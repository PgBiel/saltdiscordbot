import typing
import asyncio
import re
import motor.motor_asyncio
import concurrent.futures
import concurrent.futures.thread
import math
import discord
import datetime
from pymongo import UpdateOne, DeleteOne
from pymongo.results import BulkWriteResult
from discord.ext import commands
from constants import (
    PREFIX_LIMIT, DEFAULT_PREFIX, TIME_SPLIT_REGEX, MUTE_REGEX_NO_REASON, TIME_MATCH, TIME_ALIASES, WARNSTEP_LIMIT,
    DEFAULT_MUTE_MINUTES, SETTABLE_PUNISHMENT_TYPES, DEFAULT_PROMPT_TIMEOUT, DEFAULT_AMBIGUITY_TIMEOUT
)
from classes import (
    scommand, sgroup, SContext, SaltPermission, ListConverter,
    PrefixesModel, PartialPrefixesModel, set_op, NoPermissions,
    PartialWarnExpiresModel, WarnExpiresModel, WarnLimitsModel,
    PositiveIntConverter, PermsModel, PartialPermsModel,
    ActionLogSettingsModel, PartialActionLogSettingsModel
)
from dateutil.relativedelta import relativedelta
from utils.advanced import (
    prompt, confirmation_predicate_gen, require_salt_permission,
    search_user_or_member, ambiguity_solve, search_role
)
from utils.funcs import (
    discord_sanitize, humanize_delta, dict_except, delta_compress, delta_decompress, is_vocalic,
    humanize_list, list_except, normalize_caseless, permission_literal_to_tuple, text_abstract,
    permission_tuple_to_literal, plural_s
)
from utils.advanced import or_checks, has_saltadmin_role, is_owner, sguild_only

administration_dperm_error_fmt = "Missing permissions! For this command, you need either Manage Server, \
a Salt Admin role or the `{0}` saltperm."

MAX_MEMBERS = MAX_ROLES = 15


class Administration(commands.Cog):
    @staticmethod
    async def _permission_give_take(ctx: SContext, perm_or_perms: typing.List[str], *, subc: str):
        perm_or_perms = [s.lower().strip() for s in perm_or_perms]
        given_perms: typing.List[SaltPermission] = []
        invalid_perms: typing.List[SaltPermission] = []
        is_give = subc == "give"
        to_from = "to" if is_give else "from"

        for perm in perm_or_perms:
            initial_as_tuple = permission_literal_to_tuple(perm)
            as_tuple = tuple(["all" if p in ("*", "alls") else p for p in initial_as_tuple])
            is_cog = is_custom = is_negated = False  # type: bool

            if perm.startswith("-"):  # negate permission
                perm = perm[1:]
                is_negated = True
                as_tuple = (as_tuple[0][1:],) + as_tuple[1:]  # remove the `-` at tuple's first element

            if as_tuple[0] in ('cog', 'category', 'categories'):
                as_tuple = as_tuple[1:2]  # just keep the cog name
                is_cog = True
                if not ctx.bot.get_cog(as_tuple[0]) and not ctx.bot.get_cog(as_tuple[0].title()):
                    await ctx.send(f"Unknown cog/category `{as_tuple[0]}`! See the `help` command for a list.")
                    return

            elif as_tuple[0] == 'custom':
                as_tuple = as_tuple[1:2]  # just keep the custom cmd name; there are no subperms.
                is_custom = True
                # TODO: Add support for custom commands
                await ctx.send("Custom commands aren't supported yet!")
                return

            as_tuple = as_tuple[:4]  # max of 4 (command, extra, extrax, extraxx)

            while len(as_tuple) >= 2 and as_tuple[-1] == as_tuple[-2] == "all":  # ["str", "all", "all"] for example
                as_tuple = as_tuple[:-1]  # can't have multiple `all`.

            literal = permission_tuple_to_literal(as_tuple, is_cog=is_cog, is_custom=is_custom, is_negated=is_negated)

            as_saltperm = SaltPermission(as_tuple, is_cog=is_cog, is_custom=is_custom, is_negated=is_negated)

            if (
                    not is_cog and not is_custom and as_tuple[-1] == 'all'
                    and len(
                        [t for t in ctx.bot.saved_permissions if len(t) == len(as_tuple) and t[:-1] == as_tuple[:-1]]
                    ) < 1
            ):  # there are no permissions that accept this 'all'
                await ctx.send(
                    f"Invalid permission node **{discord_sanitize(text_abstract(literal, 128))}! (There are no \
permissions that would be affected by this usage of `all`.)"
                )

            elif (
                    'all' not in as_tuple and as_tuple not in ctx.bot.saved_permissions
            ):  # no such permission
                if is_give:
                    await ctx.send(
                        f"Unknown permission node **{discord_sanitize(text_abstract(perm, 128))}**! (Note that it \
could make sense to exist; this message indicates that no command ever checks for/depends on it.)"
                    )
                    return  # (Random arbitrary permission length limit as to not visually pollute.)

                invalid_perms.append(as_saltperm)

            given_perms.append(as_saltperm)

        if invalid_perms:
            await ctx.send(
                f"**Warning:** Unknown permission{plural_s(invalid_perms)}: \
{humanize_list([f'**`{discord_sanitize(el[:33])}`**' for el in invalid_perms])}"
            )

        found_members: typing.List[discord.Member] = []
        possib_found_members: typing.List[typing.Tuple[discord.Member, ...]] = []

        found_roles: typing.List[discord.Role] = []
        possib_found_roles: typing.List[typing.Tuple[discord.Role, ...]] = []

        def gen_predicate(obj_type: str):  # use same predicate model for member and role search.
            nonlocal ctx, found_members, found_roles

            def predicate(msg: discord.Message):
                nonlocal ctx, found_members, found_roles
                if msg.channel != ctx.channel or msg.author != ctx.author:
                    return False

                content: str = msg.content
                the_names = content.split("\n")[:MAX_MEMBERS]  # up to 15
                for name in the_names:
                    possib = search_user_or_member(name, ctx.guild.members) if obj_type == 'member' else \
                        search_role(name, ctx.guild.roles)
                    sanitized_trimmed_m = discord_sanitize(text_abstract(name, 128))
                    if len(possib) == 1:
                        (
                            possib_found_members if obj_type == 'member' else possib_found_roles
                        ).append(possib)
                        continue

                    if len(possib) < 1:
                        ctx.bot.loop.create_task(ctx.send(f"{obj_type.title()} '{sanitized_trimmed_m}' not found!"))
                        return False

                    if len(possib) > 11:
                        ctx.bot.loop.create_task(
                            ctx.send(
                                f"Too many possibilities (>11) for searching {obj_type} '{sanitized_trimmed_m}'. \
        Be more specific."
                            )
                        )
                        return False

                    (possib_found_members if obj_type == 'member' else possib_found_roles).append(possib)
                    continue

                return True

            return predicate

        given_s = plural_s(given_perms)  # "s" if more than one permission was given
        this_or_those = "those" if given_s else "this"
        _mm, cancelled_m, skipped_m = await prompt(
            f"{to_from.title()} which members (up to {MAX_MEMBERS} at once), separated by a line, would you like \
to {subc} {this_or_those} permission{' overwrite' + given_s if not is_give else given_s}? Type `skip` \
to skip to roles, and `cancel` to cancel this command. This command expires in {DEFAULT_PROMPT_TIMEOUT} seconds.",
            ctx=ctx, timeout=DEFAULT_PROMPT_TIMEOUT, predicate=gen_predicate("member"),
            cancellable=True, skippable=True
        )
        if cancelled_m:
            await ctx.send("Command cancelled.")
            return

        if skipped_m:
            await ctx.send("Skipped member permissions, now going to role permissions.")

        elif possib_found_members:
            for possibl in possib_found_members:
                if len(possibl) == 1:
                    found_members.append(possibl[0])
                    continue

                if len(possibl) < 1 or len(possibl) > 11:
                    continue

                found, cancelled = await ambiguity_solve(ctx, possibl, type_name="member")
                if cancelled:
                    return

                found_members.append(found)

        _mr, cancelled_r, skipped_r = await prompt(
            f"{to_from.title()} which roles (up to {MAX_ROLES} at once), separated by a line, would you like to {subc} \
{this_or_those} permission{' overwrite' + given_s if not is_give else given_s}?",
            ctx=ctx, timeout=DEFAULT_PROMPT_TIMEOUT, predicate=gen_predicate("role"),
            cancellable=True, skippable=not skipped_m, partial_question=True
        )
        if cancelled_r or (skipped_m and skipped_r):
            await ctx.send("Command cancelled.")
            return

        if skipped_r:
            await ctx.send("Skipped role permissions.")

        elif possib_found_roles:
            for possibl in possib_found_roles:
                if len(possibl) == 1:
                    found_roles.append(possibl[0])
                    continue

                if len(possibl) < 1 or len(possibl) > 11:
                    continue

                found, cancelled = await ambiguity_solve(ctx, possibl, type_name="role")
                if cancelled:
                    return

                found_roles.append(found)

        updates = []  # updates to send to the DB in batch form instead of sending a lot of db calls

        for permission in given_perms:
            as_tuple = permission.tuple
            command = as_tuple[0]
            extra = as_tuple[1] if len(as_tuple) >= 2 else None
            extrax = as_tuple[2] if len(as_tuple) >= 3 else None
            extraxx = as_tuple[3] if len(as_tuple) >= 4 else None
            model = PermsModel(
                guild_id=str(ctx.guild.id), id="", type="",
                command=command, extra=extra, extrax=extrax, extraxx=extraxx,
                is_custom=permission.is_custom, is_cog=permission.is_cog, is_negated=permission.is_negated
            )
            if found_members:
                for member in found_members:
                    member_model = model.copy()
                    member_model.id = str(member.id)
                    member_model.type = "member"

                    updates.append((UpdateOne if is_give else DeleteOne)(
                        PartialPermsModel(
                            guild_id=str(ctx.guild.id), id=str(member.id), type="member",
                            command=command, extra=extra, extrax=extrax, extraxx=extraxx,
                            is_custom=permission.is_custom, is_cog=permission.is_cog  # prevent duplicates with upsert
                        ).as_dict(),                                                  # and don't care if it's negated
                        *([                                                           # or not
                            set_op(  # on +p give, we set it to our new model.
                                member_model.as_dict()
                            ),
                        ] if is_give else []),
                        **(dict(upsert=True) if is_give else {})
                    ))

            if found_roles:
                for role in found_roles:
                    role_model = model.copy()
                    role_model.id = str(role.id)
                    role_model.type = "role"

                    updates.append((UpdateOne if is_give else DeleteOne)(
                        PartialPermsModel(
                            guild_id=str(ctx.guild.id), id=str(role.id), type="role",
                            command=command, extra=extra, extrax=extrax, extraxx=extraxx,
                            is_custom=permission.is_custom, is_cog=permission.is_cog  # prevent duplicates
                        ).as_dict(),
                        *([
                              set_op(  # on +p give, we set it to our new model.
                                  role_model.as_dict()
                              ),
                          ] if is_give else []),
                        **(dict(upsert=True) if is_give else {})
                    ))

        bw_res: BulkWriteResult = await ctx.db['perms'].bulk_write(updates)
        deleted = bw_res.deleted_count if not is_give else 0
        delete_s: str = plural_s(deleted) if not is_give else ""

        literals = [f"**`{discord_sanitize(p.literal)}`**" for p in given_perms]

        if not is_give and not deleted:
            await ctx.send("No permission overwrites were removed! (None were found for the given nodes)")
            return

        await ctx.send(
            "Successfully {0} permission{1} {2} {3} {4}{5}!{6}".format(
                "gave" if is_give else "took",

                plural_s(literals), humanize_list(literals),

                to_from,

                f"{len(found_members)} member{plural_s(found_members)}" if found_members else "",

                f"{' and ' if found_members else ''}{len(found_roles)} role{plural_s(found_roles)}" if found_roles
                else "",

                f" (In total, {bw_res.deleted_count} overwrite{delete_s} {'were' if delete_s else 'was'} removed.)"
                if not is_give else ""
            )
        )

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        error=NoPermissions(administration_dperm_error_fmt.format('prefix'))
    )
    @sguild_only()
    @scommand(name='prefix', description='Views or changes the prefix of the server.')
    async def prefix(self, ctx: SContext, *, new_prefix: typing.Optional[str]):
        prefixes = ctx.db['prefixes']
        found = await prefixes.find_one(dict(guild_id=str(ctx.guild.id)))  # get this guild's prefix
        if new_prefix:
            if not ctx.author.guild_permissions.manage_guild:
                raise commands.MissingPermissions(missing_perms=["manage_guild"])
            if len(new_prefix) > PREFIX_LIMIT:
                await ctx.send(f"Too big! The max prefix length is **{PREFIX_LIMIT} characters**. (Remember: \
any kind of mentions - user, channel or role mentions - and custom emojis represent a larger amount of \
characters than you see!)")
                return
            if found:  # If there already was a custom prefix in database, then change it
                await prefixes.update_one(
                    PartialPrefixesModel(guild_id=str(ctx.guild.id)).as_dict(),
                    set_op(PartialPrefixesModel(prefix=new_prefix).as_dict())
                )
            else:
                await prefixes.insert_one(
                    PrefixesModel(guild_id=str(ctx.guild.id), prefix=new_prefix).as_dict()
                )
            await ctx.send(f"Successfully set the server prefix to '{discord_sanitize(new_prefix)}'! Keep in mind that \
this command in specific doesn't change its prefix.")
        else:
            curr_prefix = found['prefix'] if found else DEFAULT_PREFIX
            await ctx.send(f"This server's current prefix is '{curr_prefix or DEFAULT_PREFIX}'!")

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        error=NoPermissions(administration_dperm_error_fmt.format('warnexpire'))
    )
    @sguild_only()
    @scommand(name='warnexpire', description='Set the amount of time it takes for a warn to "expire" ((stop counting \
towards warn limits).', example="{p}warnexpire\n{p}warnexpire 2 weeks\n{p}warnexpire 5 days")
    async def warnexpire(self, ctx: SContext, *, time: typing.Optional[str] = None):
        if not time:
            current: dict = await ctx.db['warnexpires'].find_one(dict(guild_id=str(ctx.guild.id)))
            c_model = PartialWarnExpiresModel(**(dict_except(current, "_id") if current else dict()))
            expiry_time = delta_decompress(c_model.expires) if c_model.expires else relativedelta(weeks=1)
            await ctx.send(f"This server's warns expire after {humanize_delta(expiry_time)}!")
            return

        if not re.match(MUTE_REGEX_NO_REASON, time, re.RegexFlag.I | re.RegexFlag.X):
            await ctx.send("Invalid time specified!")
            return

        time = time.strip("\"'").strip().replace(",", "").replace("and", "") .replace("+", "").replace("-", "")
        # Do some cleaning in the house

        parsed = re.findall(TIME_SPLIT_REGEX, time, flags=re.RegexFlag.I | re.RegexFlag.X)
        try:
            units = dict()
            # Here we separate each part of time - ["5 years", "5 seconds"] - to add to our delta
            for part in parsed:
                p_match = re.fullmatch(TIME_MATCH, part, flags=re.RegexFlag.I)  # Now let's separate "5" from "years"
                num_str, time_str = (p_match.group("number"), p_match.group("unit"))  # ^
                amount = float(num_str)  # Convert to float, or error if too big (see try/except)
                unit = TIME_ALIASES[time_str.lower()]  # Unit using
                if unit in ("years", "months"):  # On 'years' and 'months', can only use int, not float
                    amount = math.floor(amount)  # On the rest we can use floats tho so it's ok
                if units.get(unit):  # If the user already specified this unit before, just sum (5s + 5s)
                    units[unit] += amount
                else:  # Else just add to our dict
                    units[unit] = amount

            expire_time = relativedelta(**units)  # Using the units parsed, we are good to go.
        except (OverflowError, OSError, ValueError):  # Oh no, num too big
            await ctx.send("You specified a number that is too big!")
            return

        await ctx.db['warnexpires'].update_one(
            dict(guild_id=str(ctx.guild.id)),
            set_op(WarnExpiresModel(guild_id=str(ctx.guild.id), expires=delta_compress(expire_time)).as_dict()),
            upsert=True
        )
        await ctx.send(f"Successfully updated time for warn expire to {humanize_delta(expire_time) or '0 seconds'}!")

    @sgroup(
        name='warnlimit', aliases=['setwarns'], description="""Work with warn limits - they are an amount of warnings\
 an user can get before receiving a certain punishment. There can be multiple of those, up to 50. Each warn limit can\
 have a different punishment. See each of the subcommands' help for more info.
""", example="{p}warnlimit 5",
        invoke_without_command=True
    )
    @sguild_only()
    async def warnlimit(self, ctx: SContext, warn_amount: PositiveIntConverter):
        w_amount = typing.cast(int, warn_amount)
        # if w_amount is None:
        #     await ctx.send(f"")
        current: dict = await ctx.db['warnlimits'].find_one(
            dict(guild_id=str(ctx.guild.id), amount=w_amount)
        ) if w_amount <= WARNSTEP_LIMIT else None
        if not current:
            await ctx.send(f"Warn limit for the amount of {w_amount} warns is not set! You can set using the \
`warnlimit set` subcommand, if you have enough permissions.")
            return

        c_model = WarnLimitsModel(**dict_except(current, "_id"))
        punish_type = c_model.punishment
        mute_duration = c_model.mute_time
        permanent_mute = c_model.permanent_mute

        await ctx.send(
            "Upon reaching {0} warns, the user receives a{1} {2}{3}{4}.".format(
                w_amount, 'n' if is_vocalic(punish_type) else '',
                "permanent " if permanent_mute else "", punish_type,
                "" if punish_type not in ('mute', 'remute') or permanent_mute else (
                    f" for {humanize_delta(delta_decompress(mute_duration))}"
                )
            )
        )

    @require_salt_permission("warnlimit get", default=True)
    @sguild_only()
    @warnlimit.command(
        name='get', aliases=['limit'],
        description='Get information about a warn limit.', example="{p}warnlimit get 26"
    )
    async def warnlimit_get(self, ctx: SContext, warn_amount: PositiveIntConverter):
        await ctx.invoke(self.warnlimit, warn_amount)  # same thing

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("warnlimit set", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('warnlimit set'))
    )
    @require_salt_permission("warnlimit set", just_check_if_negated=True)
    @sguild_only()
    @warnlimit.command(name='set', example="{p}warnlimit set 5 kick\n{p}warnlimit set 6 mute 10 hours")
    async def warnlimit_set(
            self, ctx: SContext, warn_amount: PositiveIntConverter,
            punishment: str, *, mute_duration: typing.Optional[str] = None
    ):
        """
        Sets a warn limit. Any punishment can be specified, such as `kick` or `ban`. in case of `mute`,\
        you must specify the mute duration after, or it defaults to 10 minutes (see: Examples).\
        For a permanent mute, specify `pmute` as the punishment instead.
        """
        w_amount: int = typing.cast(int, warn_amount)
        if w_amount > WARNSTEP_LIMIT:
            await ctx.send(f"Invalid warn amount for warn limit! Max is {WARNSTEP_LIMIT}.")
            return

        punishment = punishment.lower()
        if punishment not in SETTABLE_PUNISHMENT_TYPES:  # "remute" is not a 'legit' punishment
            await ctx.send(
                "Invalid punishment type! Must be one of {}.".format(
                    humanize_list(list_except(SETTABLE_PUNISHMENT_TYPES, "remute"), connector='or')
                )
            )
            return

        model_to_set = WarnLimitsModel(guild_id=str(ctx.guild.id), amount=w_amount, punishment=punishment)
        if punishment == 'mute':
            if mute_duration:
                time = mute_duration \
                    .strip("\"'").strip().replace(",", "").replace("and", "").replace("+", "").replace("-", "")
                # Do some cleaning in the house

                if not re.match(MUTE_REGEX_NO_REASON, time, re.RegexFlag.I | re.RegexFlag.X):
                    await ctx.send("Invalid time specified!")
                    return

                parsed = re.findall(TIME_SPLIT_REGEX, time, flags=re.RegexFlag.I | re.RegexFlag.X)
                try:
                    units = dict()
                    # Here we separate each part of time - ["5 years", "5 seconds"] - to add to our delta
                    for part in parsed:
                        p_match = re.fullmatch(TIME_MATCH, part,
                                               flags=re.RegexFlag.I)  # Now let's separate "5" from "years"
                        num_str, time_str = (p_match.group("number"), p_match.group("unit"))  # ^
                        amount = float(num_str)  # Convert to float, or error if too big (see try/except)
                        unit = TIME_ALIASES[time_str.lower()]  # Unit using
                        if unit in ("years", "months"):  # On 'years' and 'months', can only use int, not float
                            amount = math.floor(amount)  # On the rest we can use floats tho so it's ok
                        if units.get(unit):  # If the user already specified this unit before, just sum (5s + 5s)
                            units[unit] += amount
                        else:  # Else just add to our dict
                            units[unit] = amount

                    mute_time = relativedelta(**units)  # Using the units parsed, we are good to go.
                except (OverflowError, OSError, ValueError):  # Oh no, num too big
                    await ctx.send("You specified a number (in mute duration) that is too big!")
                    return

            else:
                mute_time = relativedelta(minutes=DEFAULT_MUTE_MINUTES)

            model_to_set.mute_time = delta_compress(mute_time)

        if punishment == 'pmute':
            punishment = 'mute'
            model_to_set.punishment = punishment
            model_to_set.permanent_mute = True

        await ctx.db['warnlimits'].update_one(
            dict(guild_id=str(ctx.guild.id), amount=w_amount),
            set_op(model_to_set.as_dict()),
            upsert=True  # if there's already a warn limit with this amount in this guild, change it, otherwise create
        )
        await ctx.send(
            "Successfully set the punishment for reaching {0} warns to a{1} {2}{3}{4}!".format(
                w_amount, "n" if is_vocalic(punishment) else "",
                "permanent " if model_to_set.permanent_mute else "", punishment,
                f" for {humanize_delta(mute_time)}" if model_to_set.mute_time else ""
            )
        )

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("warnlimit unset", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('warnlimit unset'))
    )
    @require_salt_permission("warnlimit unset", just_check_if_negated=True)
    @sguild_only()
    @warnlimit.command(
        name='unset', aliases=['remove'], description='Removes a warn limit.', example="{p}warnlimit remove 5"
    )
    async def warnlimit_unset(self, ctx: SContext, warn_amount: PositiveIntConverter):
        w_amount: int = typing.cast(int, warn_amount)
        current: dict = await ctx.db['warnlimits'].find_one(
            dict(guild_id=str(ctx.guild.id), amount=w_amount)
        ) if w_amount <= WARNSTEP_LIMIT else None
        if not current:
            await ctx.send(f"Warn limit for the amount of {w_amount} warns is not set! You can set using the \
`warnlimit set` subcommand, if you have enough permissions.")
            return

        c_model = WarnLimitsModel(**dict_except(current, "_id"))
        punish_type = c_model.punishment
        mute_duration = c_model.mute_time
        permanent_mute = c_model.permanent_mute

        await ctx.db['warnlimits'].delete_one(dict(_id=current['_id']))

        await ctx.send(
            "Successfully removed the warn limit of {0} warns, in which the user, after reaching it, would receive \
a{1} {2}{3}{4}.".format(
                w_amount, 'n' if is_vocalic(punish_type) else '',
                "permanent " if permanent_mute else "", punish_type,
                "" if punish_type not in ('mute', 'remute') or permanent_mute else (
                    f" for {humanize_delta(delta_decompress(mute_duration))}"
                )
            )
        )

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("warnlimit clear", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('warnlimit clear'))
    )
    @require_salt_permission("warnlimit clear", just_check_if_negated=True)
    @sguild_only()
    @warnlimit.command(
        name='clear', description='Clears all warn limits (DANGER).',
        example="{p}warnlimit clear"
    )
    async def warnlimit_clear(self, ctx: SContext):
        if (await ctx.db['warnlimits'].count_documents(dict(guild_id=str(ctx.guild.id)))) < 1:
            await ctx.send("There are no warn limits in this server to clear! :slight_smile:")
            return

        emb_desc = "Are you sure you want to clear ALL warn limits? This cannot be undone. Type **__y__es** \
to confirm, or **__n__o** to cancel."
        # Confirmation embed - this is a dangerous operation.
        embed = discord.Embed(
            description=emb_desc, timestamp=datetime.datetime.utcnow(), title="Clearing all warn limits"
        ) \
            .set_footer(text="Please confirm")

        received, cancelled, _s = await prompt(  # Prompt 'em for confirmation, in case it parsed wrong or something
            "Are you sure?", ctx=ctx, embed=embed, already_asked=False, predicate_gen=confirmation_predicate_gen,
            cancellable=True, partial_question=False
        )
        if cancelled or normalize_caseless(received.content).startswith("n"):  # Dude said no, nvm let's not mute
            await ctx.send("Command cancelled.")
            return

        await ctx.db['warnlimits'].delete_many(dict(guild_id=str(ctx.guild.id)))
        await ctx.send("Successfully cleared all warn limits!")

    @require_salt_permission("actionlogs", default=True)
    @sguild_only()
    @sgroup(name="actionlogs", aliases=['actionlog', 'alog', 'alogs'], invoke_without_command=True)
    async def actionlogs(self, ctx: SContext):
        """
        Manage the server's action logs. You can either **set** ()
        """
        await ctx.send_help(self.actionlogs)

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("actionlogs set", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('actionlogs set'))
    )
    @require_salt_permission("actionlogs set", just_check_if_negated=True)
    @sguild_only()
    @actionlogs.command(
        name='set', description='Sets the action logs channel, at which punishments with Salt will be logged.',
        example="{p}actionlogs set #channel"
    )
    async def actionlogs_set(self, ctx: SContext, channel: discord.TextChannel):
        if channel not in ctx.guild.channels:
            await ctx.send("The channel specified must be in the current guild!")  # TODO: Make this into a converter

        current = await ctx.db['actionlogsettings'].find_one(dict(guild_id=str(ctx.guild.id)))
        logs_on = current['logs_on'] if current and current['logs_on'] is not None else True
        model = ActionLogSettingsModel(
            guild_id=str(ctx.guild.id), logs_channel_id=str(channel.id), logs_on=logs_on,
            latest_case=current['latest_case'] if current else 0
        )
        await ctx.db['actionlogsettings'].update_one(
            dict(guild_id=str(ctx.guild.id)), set_op(model.as_dict()), upsert=True
        )  # TODO: Fix counter disappearance
        await ctx.send(f"Successfully set the action logging channel to {channel.mention}!", deletable=True)

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("actionlogs toggle", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('actionlogs toggle'))
    )
    @require_salt_permission("actionlogs toggle", just_check_if_negated=True)
    @sguild_only()
    @actionlogs.command(
        name='enable', description='Enables action logging into the set action log channel.',
        example="{p}actionlogs enable"
    )
    async def actionlogs_enable(self, ctx: SContext):
        current = await ctx.db['actionlogsettings'].find_one(dict(guild_id=str(ctx.guild.id)))
        logs_channel_id = current['logs_channel_id'] if current else None
        model = ActionLogSettingsModel(
            guild_id=str(ctx.guild.id), logs_channel_id=logs_channel_id, logs_on=True,
            latest_case=current['latest_case'] if current else 0
        )
        await ctx.db['actionlogsettings'].update_one(
            dict(guild_id=str(ctx.guild.id)), set_op(model.as_dict()), upsert=True
        )
        await ctx.send(
            "Successfully enabled action logging!{0}".format(
                f" (Note: no action log channel has been set yet! Set with ``{discord_sanitize(ctx.prefix)}actionlogs \
set #channel``." if not logs_channel_id else ""
            ),
            deletable=True
        )

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("actionlogs toggle", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('actionlogs toggle'))
    )
    @require_salt_permission("actionlogs toggle", just_check_if_negated=True)
    @sguild_only()
    @actionlogs.command(
        name='disable', description='Disables action logging into the set action log channel.',
        example="{p}actionlogs disable"
    )
    async def actionlogs_disable(self, ctx: SContext):
        current = await ctx.db['actionlogsettings'].find_one(dict(guild_id=str(ctx.guild.id)))
        logs_channel_id = current['logs_channel_id'] if current else None
        model = ActionLogSettingsModel(
            guild_id=str(ctx.guild.id), logs_channel_id=logs_channel_id, logs_on=False,
            latest_case=current['latest_case'] if current else 0
        )
        await ctx.db['actionlogsettings'].update_one(
            dict(guild_id=str(ctx.guild.id)), set_op(model.as_dict()), upsert=True
        )
        await ctx.send(
            "Successfully disabled action logging!{0}".format(
                f" (Note: no action log channel has been set yet! Set with ``{discord_sanitize(ctx.prefix)}actionlogs \
set #channel``." if not logs_channel_id else ""
            ),
            deletable=True
        )

    @require_salt_permission("perms", default=True)
    @sguild_only()
    @sgroup(name='perms', aliases=['p'], description='Work with Salt Permissions.', invoke_without_command=True)
    async def perms(self, ctx: SContext):
        await ctx.send_help(self.perms)

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("perms give", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('perms give'))
    )
    @require_salt_permission("perms give", just_check_if_negated=True)
    @sguild_only()
    @perms.command(
        name='give', aliases=['add'],
        example=(
            "{p}p give case reason\n"
            "{p}p give ban, kick, mute\n"
            "{p}p give all\n"
            "{p}p give -ban, -kick, mute"
        )
    )
    async def perms_give(
        self, ctx: SContext,
        *, perm_or_perms: ListConverter(
            re.compile(r"[^a-zA-Z\d.\- ]+"), maxsplit=10, human_separator="any non-letter/digit/dot/hyphen character"
        )
    ):
        """
        Give one/multiple Salt Permission(s) to one/multiple member(s) and/or one/multiple role(s). To specify \
        multiple permissions, separate using characters such as `,` or `;`. The targets that receive the permission \
        are specified after the command is run, as a prompt, so that you can specify more than one per type.

        To negate a permission (i.e., forbid the user from doing something), use this command with a `-` before the \
        whole permission node, as seen in examples.
        """
        await self._permission_give_take(ctx, perm_or_perms, subc="give")

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        require_salt_permission("perms take", default=False),
        error=NoPermissions(administration_dperm_error_fmt.format('perms take'))
    )
    @require_salt_permission("perms take", just_check_if_negated=True)
    @sguild_only()
    @perms.command(
        name='take', aliases=['remove'],
        example="{p}p take case reason\n{p}p take ban, kick, mute\n{p}p take all\n{p}p take -ban, -kick, mute"
    )
    async def perms_take(
        self, ctx: SContext,
        *, perm_or_perms: ListConverter(
            re.compile(r"[^a-zA-Z\d.\- ]+"), maxsplit=10, human_separator="any non-letter/digit/dot/hyphen character"
        )
    ):
        """
        Take one/multiple Salt Permission overwrites from one/multiple member(s) and/or one/multiple role(s). \
        To specify multiple permissions, separate using characters such as `,` or `;`. The targets from who the \
        permission overwrites are taken are specified after the command is run, as a prompt, so that you can \
        specify more than one per type.

        This command is used to **undo a former `p give`**; __do not confuse this with *negating*__ - this command \
        does not forbid anyone from doing anything, it just resets their permissions to the default for some node. \
        For example, if someone previously negated the permission `8ball` from user A through `p give -8ball`, \
        forbidding them from using that command, that same user will be able to use the `8ball` command again \
        through `p take -8ball`, which **removes the overwrite** and resets to the default (which is _yes, can use_).

        (Note: the same applies to the reverse - if you gave `ban` permission to someone and want to remove it, use \
        `p take ban`, which reverts to the default of `no, can't use`.)
        """
        await self._permission_give_take(ctx, perm_or_perms, subc="take")


def setup(bot: commands.Bot):
    bot.add_cog(Administration(bot))
