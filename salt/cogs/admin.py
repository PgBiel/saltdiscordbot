import typing
import re
import math
import discord
import datetime
from discord.ext import commands
from constants import (
    PREFIX_LIMIT, DEFAULT_PREFIX, TIME_SPLIT_REGEX, MUTE_REGEX_NO_REASON, TIME_MATCH, TIME_ALIASES, WARNSTEP_LIMIT,
    DEFAULT_MUTE_MINUTES, SETTABLE_PUNISHMENT_TYPES
)
from classes import (
    scommand, sgroup, SContext, PrefixesModel, PartialPrefixesModel, set_op, NoPermissions,
    PartialWarnExpiresModel, WarnExpiresModel, WarnLimitsModel,
    PositiveIntConverter
)
from dateutil.relativedelta import relativedelta
from utils.advanced import prompt, confirmation_predicate_gen
from utils.funcs import (
    discord_sanitize, humanize_delta, dict_except, delta_compress, delta_decompress, is_vocalic,
    humanize_list, list_except, normalize_caseless
)
from utils.advanced import or_checks, has_saltadmin_role, is_owner, sguild_only

administration_dperm_error_fmt = "Missing permissions! For this command, you need either Manage Server, \
a Salt Mod role or the `{0}` saltperm."


class Administration(commands.Cog):

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

    @sguild_only()
    @warnlimit.command(
        name='get', aliases=['limit'],
        description='Get information about a warn limit.', example="{p}warnlimit get 26"
    )
    async def warnlimit_get(self, ctx: SContext, warn_amount: PositiveIntConverter):
        await ctx.invoke(self.warnlimit, warn_amount)  # same thing

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        error=NoPermissions(administration_dperm_error_fmt.format('warnlimit set'))
    )
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
        error=NoPermissions(administration_dperm_error_fmt.format('warnlimit unset'))
    )
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
        error=NoPermissions(administration_dperm_error_fmt.format('warnlimit clear'))
    )
    @sguild_only()
    @warnlimit.command(
        name='clear', description='Clears all warn limits (DANGER).',
        example="{p}warnlimit clear"
    )
    async def warnlimit_clear(self, ctx: SContext):
        if (await ctx.db['warnlimits'].count_documents(dict(guild_id=str(ctx.guild.id)))) < 1:
            await ctx.send("There are no warn limits in this server to clear! :slight_smile:")
            return

        emb_desc = "Are you sure you want to clear ALL warn limits? This cannot be undone. Type **__y__es**\
 to confirm, or **__n__o** to cancel."
        # Confirmation embed - this is a dangerous operation.
        embed = discord.Embed(
            description=emb_desc, timestamp=datetime.datetime.utcnow(), title="Clearing all warn limits"
        ) \
            .set_footer(text="Please confirm")

        received, cancelled, _s = await prompt(  # Prompt 'em for confirmation, in case it parsed wrong or smth
            "Are you sure?", ctx=ctx, embed=embed, already_asked=False, predicate_gen=confirmation_predicate_gen,
            cancellable=True, partial_question=False
        )
        if cancelled or normalize_caseless(received.content).startswith("n"):  # Dude said no, nvm let's not mute
            await ctx.send("Command cancelled.")
            return

        await ctx.db['warnlimits'].delete_many(dict(guild_id=str(ctx.guild.id)))
        await ctx.send("Successfully cleared all warn limits!")

    @sguild_only()
    @sgroup(name='perms', aliases=['p'], description='Work with Salt Permissions.')
    async def perms(self, ctx: SContext):
        await ctx.send_help(self.perms)



def setup(bot: commands.Bot):
    bot.add_cog(Administration(bot))
