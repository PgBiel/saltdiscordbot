import discord
import datetime
import re
import math
from discord_components.button import Button
import motor.motor_asyncio
import inspect
from discord_components import Interaction
from dataclasses import asdict
from pymongo import ASCENDING, DESCENDING
from dateutil.relativedelta import relativedelta
from discord.ext import commands
from copy import copy
from classes import (
    SContext, NoPermissions, scommand, MutesModel, ActiveMutesModel, set_op,
    AmbiguityUserOrMemberConverter, sgroup, PartialPunishmentsModel, PunishmentsModel, WarnsModel, PartialWarnsModel,
    PartialWarnLimitsModel, PartialActionLogSettingsModel,
    PositiveIntConverter, CustomIntConverter
)
from classes.converters import AmbiguityMemberConverter
from utils.advanced.checks import or_checks, is_owner, has_saltmod_role, sguild_only, require_salt_permission
from utils.advanced import (
    confirmation_predicate_gen, prompt, actionlog, generate_actionlog_embed, generate_actionlog_embed_from_entry,
    has_permission
)
from utils.funcs import (
    discord_sanitize, normalize_caseless, kickable, bannable, delta_decompress, humanize_delta,
    create_mute_role, humanize_list, clamp, dict_except, is_vocalic, plural_s
)
from essentials import PaginateOptions
from constants import DATETIME_DEFAULT_FORMAT, TRACK_PREVIOUS, TRACK_NEXT
from constants.colors import KICK_COLOR, BAN_COLOR, MUTE_COLOR, WARN_COLOR, SOFTBAN_COLOR
from constants.regex import MUTE_REGEX, TIME_MATCH, TIME_SPLIT_REGEX
from constants.numbers import DEFAULT_MUTE_MINUTES
from constants.maps import TIME_ALIASES
from typing import Optional, Union, cast

moderation_dperm_error_fmt = "Missing permissions! For this command, you need either {0}, a Salt Mod role or the \
`{1}` saltperm."


async def _kick_or_ban(
        ctx: SContext, *, member: Union[discord.Member, discord.User], reason: Optional[str], verb: str,
        color: discord.Colour, ban_days: Optional[int] = 1, is_idban: Optional[bool] = False
):
    """
    Run kick or ban command.

    :param ctx: The context.
    :param member: Member to be punished.
    :param reason: Reason for punishing, or None.
    :param verb: The verb ("kick" or "ban") to use in messages.
    :param color: The embed color.
    :param ban_days: If banning, the amount of days until which to delete the banned user's messages. (Default = 1 day)
    :param is_idban: If this is an ID ban. Defaults to False.
    :return:
    """
    is_softban = verb == 'softban'
    is_from_warn = getattr(ctx, '_warn_punish', False)
    is_outsider = not bool(ctx.guild.get_member(member.id)) if is_idban else False
    verb_alt: str = verb + "n" if "ban" in verb else verb  # Use for alternative forms of the verb - "ban" -> "bann"ed..
    checker_func = kickable if verb == "kick" else bannable
    member_str = "user" if is_outsider else "member"
    # Which function should we use to check if the member is punishable?

    if is_outsider:  # Ensure we don't re-ban people.
        try:
            if await ctx.guild.fetch_ban(user=discord.Object(member.id)):
                await ctx.send("That user is already banned!")
                return False
        except discord.HTTPException:
            pass

    if not is_outsider:
        if not checker_func(member):  # If the member is not punishable BY THE BOT, then let's say why.
            if member == ctx.me:
                await ctx.send(f"I won't {verb} myself! :slight_smile:")
                return False
            if member.id == ctx.guild.owner_id:  # Member is owner, can't punish
                await ctx.send(f"I cannot {verb} the specified member, because that is the owner!")
                return False
            top_role = member.top_role
            if top_role.position > ctx.me.top_role.position:  # Member is from higher role
                await ctx.send(f"I cannot {verb} the specified member, because their highest role is higher than mine!")
                return False
            if top_role.position == ctx.me.top_role.position:  # Member is from same role position
                await ctx.send(f"I cannot {verb} the specified member, because their highest role is the same as mine!")
                return False
            await ctx.send(f"I cannot {verb} the specified member!")  # idk what's going on but we can't punish
            return False

        # Now check if THE PUNISHER can do it.
        if not checker_func(member, performer=ctx.author, needs_the_perm=False) and not is_from_warn:
            if member.id == ctx.guild.owner_id:  # Well, we already made this check before, but... Can't punish owner
                await ctx.send(f"You cannot {verb} the specified member, because that is the owner!")
                return False
            if member == ctx.author:  # Cannot punish yourself :)
                await ctx.send(f"You cannot {verb} yourself! :eyes:")
                return False
            top_role = member.top_role
            if top_role.position > ctx.author.top_role.position:  # Cannot punish people above your highest role...
                await ctx.send(
                    f"You cannot {verb} the specified member, because their highest role is higher than yours!"
                )
                return False
            if top_role.position == ctx.author.top_role.position:  # ...or from same highest role position.
                await ctx.send(
                    f"You cannot {verb} the specified member, because their highest role is the same as yours!"
                )
                return False
            await ctx.send(f"You cannot {verb} the specified member!")  # wth is going on
            return False

    if not is_from_warn:  # If this is from a warn limit, then obviously we don't ask for confirmation
        emb_desc: str = f"Are you sure you want to {verb} the {member_str} {discord_sanitize(str(member))}? Type \
    **__y__es** to confirm or **__n__o** to cancel."  # Description for confirmation embed

        # Confirmation embed - are you sure you wanna kick/ban that guy? Perhaps you did a typo or something.
        embed = discord.Embed(color=color, description=emb_desc, timestamp=datetime.datetime.utcnow()) \
            .set_author(name=f"{verb_alt.title()}ing {str(member)}", icon_url=member.avatar_url) \
            .set_thumbnail(url=member.avatar_url) \
            .add_field(name="Reason", value=reason or "None") \
            .set_footer(text="Please confirm")
        # Author space is, for example: "Banning" or "Kicking" {member}

        received, cancelled, _s = await prompt(
            "Are you sure?", ctx=ctx, embed=embed, already_asked=False, predicate_gen=confirmation_predicate_gen,
            cancellable=True, partial_question=False
        )  # Run prompt.
        if cancelled or normalize_caseless(received.content).startswith("n"):  # Dude said 'no'
            await ctx.send("Command cancelled.")
            return False

    base_text = (
        "{0}ing {1}... ({2})" if not is_outsider else "{0}ing {1}..."  # We don't dm outsiders.
    ).format(verb_alt.title(), member_str, "{}")  # Banning member.../Kicking member...
    status_msg = await ctx.send(base_text.format("Sending DM..."))  # Let's keep our mod updated with what's going on
    if not is_outsider:
        try:
            reason_embed: discord.Embed = discord.Embed(  # Embed to send to DMs alerting the dude he was punished.
                color=color, description=reason or "No reason given", timestamp=datetime.datetime.utcnow(),
                title=f"{verb.title()} reason"
            ) \
                .set_footer(text=f"{verb_alt.title()}ed from server '{discord_sanitize(ctx.guild.name)}'") \
                .set_thumbnail(url=ctx.guild.icon_url)

            await member.send(
                f"You were {verb_alt}ed from the server '{discord_sanitize(ctx.guild.name)}'!",
                embed=reason_embed
            )
            await status_msg.edit(content=base_text.format(f"DM sent, {verb_alt}ing..."))  # DM sent. Punishing now.
        except discord.HTTPException:
            await status_msg.edit(content=base_text.format(f"DM failed, {verb_alt}ing anyway..."))  # DM failed, but w/e
    try:
        reason_str = f" {reason}" if reason else None
        audit_reason = f"[{verb.title()} command by {discord_sanitize(str(ctx.author))}]{reason_str}"
        if is_softban:
            await ctx.guild.ban(member, reason=audit_reason)
            await ctx.guild.unban(member, reason=audit_reason)
        elif "ban" in verb:
            await ctx.guild.ban(member, reason=audit_reason, delete_message_days=clamp(int(ban_days), 7, 0))
        else:
            await (getattr(ctx.guild, verb)(member, reason=audit_reason))  # Punishing now (guild.kick or guild.ban)
    except discord.Forbidden:
        await status_msg.edit(content=f"Uh oh, it seems I cannot {verb} this {member_str}! :frowning:")  # bruh wth
    except discord.HTTPException:
        await status_msg.edit(content=f"Uh oh, it seems {verb_alt}ing failed! (Try again?) :frowning:")  # error
    else:
        await status_msg.edit(content=f"Successfully {verb_alt}ed {member_str} {discord_sanitize(str(member))}.")
        # Succeeded! Member yeeted away from the server.
    await actionlog(ctx, punish_type=verb, target=member, moderator=ctx.author, reason=reason)


async def _unmute(
        ctx: SContext, *, member: discord.Member, am_entry: motor.motor_asyncio.AsyncIOMotorCursor,
        reason: Optional[str] = None, author: Optional[discord.abc.User] = None
):
    """
    Unmute a member.

    :param ctx: Context of command.
    :param member: Member being unmuted.
    :param am_entry: The DB activemutes entry to be removed.
    :param reason: Optionally, a reason for unmuting, for audit logs.
    :param author: Optionally, who did this, for audit logs.
    """
    await ctx.db.activemutes.delete_one(dict(  # Remove active mute entry from db
        _id=am_entry['_id']
    ))
    mute_obj = await ctx.db.mutes.find_one(dict(  # Now we gotta remove the mute role.
        guild_id=str(ctx.guild.id)
    ))
    if mute_obj and (m_r_id := mute_obj['mute_role_id']) and (m_role := ctx.guild.get_role(int(m_r_id))):
        mute_bracket_part = f"[Unmute command by {discord_sanitize(str(author))}]" if author else "[Auto unmute]"
        reason_str = f" {reason}" if reason else None
        try:  # If there's a mute role then we remove it.
            await member.remove_roles(
                m_role,
                reason=f"{mute_bracket_part}{reason_str}"
            )  # Removing...
        except discord.HTTPException:  # well we couldn't so whatever
            pass


class Moderation(commands.Cog):

    @or_checks(  # Either is bot dev, has SaltMod role (will be removed), has Kick Members perm or has "kick" saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(kick_members=True),
        require_salt_permission("kick", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Kick Members", "kick"))  # TODO: Add saltperm check
    )
    @commands.bot_has_permissions(kick_members=True)
    @require_salt_permission("kick", just_check_if_negated=True)
    @sguild_only()
    @scommand(name="kick", description="Kick people.", example="{p}kick @Boi#0001 Toxicity")
    async def kick(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        return await _kick_or_ban(
            ctx, member=cast(discord.Member, member), reason=reason, verb="kick", color=KICK_COLOR
        )

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        require_salt_permission("ban", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @require_salt_permission("ban", just_check_if_negated=True)
    @sguild_only()
    @scommand(name="ban", description="Ban people.", example="{p}ban @Boi#0001 Raiding")
    async def ban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        return await _kick_or_ban(ctx, member=cast(discord.Member, member), reason=reason, verb="ban", color=BAN_COLOR)

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        require_salt_permission("ban", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @require_salt_permission("ban", just_check_if_negated=True)
    @sguild_only()
    @scommand(name="nodelban", description="Ban people without deleting any message.")
    async def nodelban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        return await _kick_or_ban(
            ctx, member=cast(discord.Member, member), reason=reason, verb="ban", color=BAN_COLOR,
            ban_days=0
        )

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        require_salt_permission("ban", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @require_salt_permission("ban", just_check_if_negated=True)
    @sguild_only()
    @scommand(name="weekdelban", description="Ban people and delete their messages sent up to a week ago.")
    async def weekdelban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        return await _kick_or_ban(
            ctx, member=cast(discord.Member, member), reason=reason, verb="ban", color=BAN_COLOR,
            ban_days=7
        )

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        require_salt_permission("ban", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @require_salt_permission("ban", just_check_if_negated=True)
    @sguild_only()
    @scommand(
        name="idban", aliases=["hackban"], description="Ban people that aren't in the server by ID.",
        example="{p}idban 261979210363437059"
    )
    async def idban(self, ctx: SContext, member: AmbiguityUserOrMemberConverter, *, reason: Optional[str]):
        return await _kick_or_ban(
            ctx, member=cast(discord.abc.User, member), reason=reason, verb="ban", color=BAN_COLOR,
            is_idban=True
        )

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(),
        commands.has_permissions(kick_members=True), commands.has_permissions(ban_members=True),  # either kick or ban
        require_salt_permission("softban", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Kick Members, Ban Members", "softban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @require_salt_permission("softban", just_check_if_negated=True)
    @sguild_only()
    @scommand(
        name="softban", description="Kick but remove messages in their way out. (Ban and unban)",
        example="{p}softban @Boi#0001 Spamming"
    )
    async def softban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        return await _kick_or_ban(
            ctx, member=cast(discord.Member, member), reason=reason, verb="softban", color=SOFTBAN_COLOR
        )

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        require_salt_permission("mute", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @require_salt_permission("mute", just_check_if_negated=True)
    @sguild_only()
    @scommand(
        name='mute', description="Mute people.",
        example="""{p}mute @Boi#0001 1 hour and 2 days Being stupid
{p}mute @Boi#0001 1h2d Being stupid"""
    )
    async def mute(self, ctx: SContext, member: AmbiguityMemberConverter, *, time_and_reason: Optional[str]):
        memb: discord.Member = cast(discord.Member, member)  # (Typing purposes)
        do_extend = getattr(ctx, "_mute_extend", False)  # If invoked as `emute`, in which you can re-mute muted people
        is_permanent = getattr(ctx, "_mute_permanent", False)  # If invoked as `pmute`, in which you mute people forever
        is_from_warn = getattr(ctx, "_warn_punish", False)  # If invoked as a warn limit in `warn`.
        
        check_active_mutes: motor.motor_asyncio.AsyncIOMotorCollection = ctx.db.activemutes
        found_active_mute: motor.motor_asyncio.AsyncIOMotorCursor = await check_active_mutes.find_one(dict(
            guild_id=str(ctx.guild.id), user_id=str(memb.id)
        ))  # see if user is muted
        if found_active_mute and not do_extend:  # Don't let them re-mute if not extending mute.
            
            await ctx.send(
                "That member is already muted! To change their mute duration{0}, use the `e{1}mute` command.".format(
                    " to permanent" if is_permanent else "",
                    "p" if is_permanent else ""
                ) if not is_from_warn else "That member is already muted, so they cannot be muted again!"
            )
            return False
        elif do_extend and not found_active_mute:  # Extending mute, but there's no mute to extend
            await ctx.send("That member is not muted! This command changes duration of already existing mutes. \
To mute someone, use the `mute` command.")
            return False

        # default mute time: 10 min
        time_to_mute = getattr(ctx, "_mute_duration", None) or relativedelta(minutes=DEFAULT_MUTE_MINUTES)
        reason_to_mute: str = time_and_reason if is_permanent else ""  # reasoning
        if time_and_reason and not is_permanent and not is_from_warn:  # if user provided a time or reason
            match = re.fullmatch(MUTE_REGEX, time_and_reason, re.RegexFlag.X | re.RegexFlag.I)  # let's match it
            if match:
                time, mins, mins2, reason = (
                    match.group("time"), match.group("mins"), match.group("mins2"), match.group("reason")
                )
                if mins or mins2:  # If user only provided a number, like +mute @boi 2  -- 2 will be minutes amount
                    time_to_mute = relativedelta(minutes=int(mins or mins2))
                elif time:  # User provided complete time string - +mute @boi 5 years, 2 seconds...
                    try:
                        time = time.strip("\"'").strip().replace(",", "").replace("and", "") \
                            .replace("+", "").replace("-", "")  # Do some cleaning in the house
                        parts = re.findall(TIME_SPLIT_REGEX, time, flags=re.RegexFlag.I | re.RegexFlag.X)
                        # Here we separate each part of time - ["5 years", "5 seconds"] - to add to our delta
                        units = dict()  # Units to add to delta - will be filled in loop
                        for part in parts:
                            p_match = re.fullmatch(TIME_MATCH, part)  # Now let's separate "5" from "years"
                            num_str, time_str = (p_match.group("number"), p_match.group("unit"))  # ^
                            amount = float(num_str)  # Convert to float, or error if too big (see try/except)
                            unit = TIME_ALIASES[time_str.lower()]  # Unit using
                            if unit in ("years", "months"):  # On 'years' and 'months', can only use int, not float
                                amount = math.floor(amount)  # On the rest we can use floats tho so it's ok
                            if units.get(unit):  # If the user already specified this unit before, just sum (5s + 5s)
                                units[unit] += amount
                            else:  # Else just add to our dict
                                units[unit] = amount

                        time_to_mute = relativedelta(**units)  # Using the units parsed, we are good to go.
                    except (OverflowError, OSError, ValueError):  # Oh no, num too big
                        return await ctx.send("You specified a number that is too big!")
                if reason:
                    reason_to_mute = reason

        elif is_from_warn and time_and_reason:
            reason_to_mute = time_and_reason

        now = datetime.datetime.utcnow()
        mute_at = now
        if not is_permanent:
            try:
                mute_at += time_to_mute  # Date until when they are muted.
            except (OverflowError, OSError, ValueError):  # Except that's too far away.
                return await ctx.send(
                    "You specified a number that is too big!" if not is_from_warn else "The time specified for mute \
was too big!"
                )

        duration_str = "Forever" if is_permanent else humanize_delta(time_to_mute) or "0 seconds"

        # No need to confirm changing mute duration or warn limit punish
        if not do_extend and not is_from_warn:
            emb_desc: str = f"Are you sure you want to mute the member {discord_sanitize(str(member))}? Type \
**__y__es** to confirm or **__n__o** to cancel. (**Note:** You can disable this confirmation screen with \
`{ctx.prefix}pconfig set mute_confirm no`)"

            # Confirmation embed.
            embed = discord.Embed(color=MUTE_COLOR, description=emb_desc, timestamp=now) \
                .set_author(name=f"Muting {str(memb)}", icon_url=memb.avatar_url) \
                .set_thumbnail(url=memb.avatar_url) \
                .add_field(name="Muted for", value=duration_str) \
                .add_field(name="Reason", value=reason_to_mute[:512] or "None") \
                .set_footer(text="Please confirm")

            received, cancelled, _s = await prompt(  # Prompt 'em for confirmation, in case it parsed wrong or smth
                "Are you sure?", ctx=ctx, embed=embed, already_asked=False, predicate_gen=confirmation_predicate_gen,
                cancellable=True, partial_question=False
            )
            if cancelled or normalize_caseless(received.content).startswith("n"):  # Dude said no, nvm let's not mute
                await ctx.send("Command cancelled.")
                return

        if not do_extend:
            mutes_col: motor.motor_asyncio.AsyncIOMotorCollection = ctx.db.mutes  # Let's see if we have muterole stored
            mutes_entry: motor.motor_asyncio.AsyncIOMotorCursor = await mutes_col.find_one(dict(
                guild_id=str(ctx.guild.id)
            ))
            mute_role: discord.Role = cast(discord.Role, None)  # Let's initialize to not have problems
            mute_role_id_str: str = ""
            if (
                    not mutes_entry                                           # No mutes entry for this guild
                    or not (mute_role_id_str := mutes_entry['mute_role_id'])  # No mute role set
                    or not (mute_role := ctx.guild.get_role(int(mute_role_id_str)))          # mute role not found
                    or mute_role >= ctx.me.top_role
            ):
                msg: Optional[discord.Message] = None
                try:
                    msg = await ctx.send("Mute role not found, creating...")  # Let's keep them updated.
                except discord.HTTPException:                                 # If we can't though, not a problem
                    pass
                new_role, unable_to_channels = await create_mute_role(ctx)  # Create mute role
                mute_role = new_role
                mute_role_id_str = new_role.id
                if mutes_entry:                                 # If there was already a mute role in place,
                    _id_to_replace = mutes_entry['_id']         # then gotta replace it, cuz it seems it's borke.
                    await mutes_col.update_one(
                        dict(_id=_id_to_replace), { "$set": dict(mute_role_id=str(new_role.id)) }
                    )
                else:  # First mute role of the guild.
                    await mutes_col.insert_one(  # insert that crap
                        MutesModel(guild_id=str(ctx.guild.id), mute_role_id=str(new_role.id)).as_dict()
                    )
                if msg:  # Let's keep them updated!
                    unable_to_channels = [chan.mention for chan in unable_to_channels]
                    multiple_chans = len(unable_to_channels) > 1  # If there's more than one Unable Channel
                    extra_chans = len(unable_to_channels[10:])  # Limit of 10 channels displayed
                    await msg.edit(
                        content="Mute role created successfully!{}".format(  # Yay
                            " However, {0} text channel{1} couldn't have the mute role's \
    `Send Messages` permission due to missing permissions in {2}: {3}{4}".format(  # However, some channels not changed
                                len(unable_to_channels), "s" if multiple_chans else "",
                                "those channels" if multiple_chans else "that channel",
                                humanize_list(unable_to_channels[:10], no_and=bool(extra_chans)),
                                f" and {extra_chans} more." if extra_chans else ""
                            ) if unable_to_channels else ""
                        )
                    )

        # Mute role stuff is okay, now time to mute.
        sanitized_m = discord_sanitize(str(memb))
        msg_fmt = "{0} {1}... ({2})".format("Re-muting" if do_extend else "Muting", sanitized_m, "{}")

        is_myself = memb == ctx.me

        sent_msg: discord.Message = await ctx.send(msg_fmt.format("Sending DM..." if not is_myself else (
            "Re-muting..." if do_extend else "Muting..."
        )))
        try:
            if not is_myself:
                reason_embed: discord.Embed = discord.Embed(  # Embed to send to DMs alerting the dude he was punished.
                    color=MUTE_COLOR, description=reason_to_mute or "No reason given",
                    timestamp=datetime.datetime.utcnow(), title="Mute reason"
                ) \
                    .set_footer(text=f"Muted from server '{discord_sanitize(ctx.guild.name)}'") \
                    .set_thumbnail(url=ctx.guild.icon_url) if not do_extend else None

                await memb.send(
                    "{0} in the server '{1}'!".format(
                        f"Your mute duration changed to **{duration_str}**" if do_extend else "You were muted",
                        discord_sanitize(ctx.guild.name)
                    ),
                    embed=reason_embed or None
                )
                await sent_msg.edit(content=msg_fmt.format("DM Sent, {0}...".format(
                    "changing duration" if do_extend else "muting")
                ))
        except discord.HTTPException:
            await sent_msg.edit(content=msg_fmt.format("DM Failed, {0} anyway...".format(
                "changing duration" if do_extend else "muting")
            ))

        try:  # Now we mute for real
            if not do_extend:
                reason_str = f" {reason_to_mute}" if reason_to_mute else ""
                await memb.add_roles(mute_role, reason=f"[Mute command by {ctx.author}]{reason_str}")
        except discord.HTTPException:
            await sent_msg.edit(content="Sorry, adding the mute role failed! (Try again?) :frowning:")
        else:
            active_mutes_col: motor.motor_asyncio.AsyncIOMotorCollection = ctx.db.activemutes
            if do_extend:  # Change mute duration
                await active_mutes_col.update_one(
                    dict(_id=found_active_mute['_id']), set_op(
                        dict(timestamp=str(mute_at.timestamp()), permanent=is_permanent)
                    )
                )
            else:
                await active_mutes_col.insert_one(
                    ActiveMutesModel(
                        guild_id=str(ctx.guild.id), user_id=str(memb.id), timestamp=str(mute_at.timestamp()),
                        permanent=is_permanent
                    ).as_dict()
                )
            await sent_msg.edit(
                content="Successfully {0} {1} {2} {3}!".format(
                    "changed the mute duration of the member" if do_extend else "muted member",
                    sanitized_m,
                    "to" if do_extend else ("for" if not is_permanent else "forever"),
                    "permanent" if is_permanent and do_extend else (
                        "(until they are manually unmuted)" if is_permanent else duration_str
                    )
                )
            )

        await actionlog(
            ctx, punish_type="{}mute".format("re" if do_extend else ""), target=memb, moderator=ctx.author,
            reason=reason_to_mute, permanent_mute=is_permanent or False, punished_at=now, muted_until=mute_at
        )

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        require_salt_permission("mute", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @require_salt_permission("mute", just_check_if_negated=True)
    @sguild_only()
    @scommand(name='emute', aliases=["remute"], description="Change how long someone is muted for.")
    async def emute(self, ctx: SContext, member: AmbiguityMemberConverter, *, time_and_reason: Optional[str]):
        ctx._mute_extend = True
        await ctx.invoke(self.mute, member, time_and_reason=time_and_reason)

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        require_salt_permission("mute", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @require_salt_permission("mute", just_check_if_negated=True)
    @sguild_only()
    @scommand(name='epmute', aliases=["repmute"], description="Change a mute to a permanent mute.")
    async def epmute(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        ctx._mute_extend = True
        ctx._mute_permanent = True
        await ctx.invoke(self.mute, member, time_and_reason=reason)

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @require_salt_permission("mute", just_check_if_negated=True)
    @sguild_only()
    @scommand(name='pmute', description="Mute someone permanently. (Until they are manually unmuted)")
    async def pmute(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        ctx._mute_permanent = True
        await ctx.invoke(self.mute, member, time_and_reason=reason)

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        require_salt_permission("unmute"),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @require_salt_permission("unmute", just_check_if_negated=True)
    @sguild_only()
    @scommand(name='unmute', description="Unmute a member.", example="{p}unmute @Boi#0001 They're good now")
    async def unmute(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str] = None):
        memb: discord.Member = cast(discord.Member, member)  # Typing purposes
        check_active_mutes: motor.motor_asyncio.AsyncIOMotorCollection = ctx.db.activemutes
        found_active_mute: motor.motor_asyncio.AsyncIOMotorCursor = await check_active_mutes.find_one(dict(
            guild_id=str(ctx.guild.id), user_id=str(memb.id)
        ))
        if found_active_mute:
            await _unmute(ctx=ctx, member=memb, am_entry=found_active_mute, reason=reason, author=ctx.author)
            await ctx.send(f"Member {discord_sanitize(str(memb))} unmuted successfully!")
            await actionlog(
                ctx, punish_type="unmute", target=memb, moderator=ctx.author, reason=reason
            )
            return
        else:
            await ctx.send("That member is not muted!")
            return

    @require_salt_permission("mutetime", default=True)
    @sguild_only()
    @scommand(name='mutetime', description="See how long someone is muted for.")
    async def mutetime(self, ctx: SContext, *, member: AmbiguityMemberConverter):
        memb: discord.Member = cast(discord.Member, member)  # Typing purposes
        sanitized_m = discord_sanitize(str(memb))
        check_active_mutes: motor.motor_asyncio.AsyncIOMotorCollection = ctx.db.activemutes
        found_active_mute: motor.motor_asyncio.AsyncIOMotorCursor = await check_active_mutes.find_one(dict(
            guild_id=str(ctx.guild.id), user_id=str(memb.id)
        ))
        if found_active_mute:  # If the member is muted:
            if found_active_mute.get('permanent'):
                await ctx.send(f"The member {sanitized_m} is muted forever (until they are manually unmuted)!")
                return
            try:
                timestamp = found_active_mute['timestamp']  # Until when they are muted
                muted_until = datetime.datetime.fromtimestamp(float(timestamp))  # ^
                now = datetime.datetime.utcnow()
                if now > muted_until:  # If the mute already expired and we did not realize:
                    await _unmute(ctx, member=memb, am_entry=found_active_mute)  # Unmute them.
                else:
                    delta = relativedelta(muted_until, now)
                    await ctx.send(
                        f"The member {sanitized_m} is muted for {humanize_delta(delta)} (until \
{muted_until.strftime(DATETIME_DEFAULT_FORMAT)}, UTC)!"
                    )
                    return
            except (OverflowError, OSError, ValueError):
                await _unmute(ctx, member=memb, am_entry=found_active_mute)
                await ctx.send(f"The member {sanitized_m} was muted way for too long, so they were automatically \
unmuted!")
        await ctx.send(f"The member {sanitized_m} is not muted!")

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        require_salt_permission("warn", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "warn"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @require_salt_permission("warn", just_check_if_negated=True)
    @sguild_only()
    @scommand(
        name='warn', description="Warn people.",
        example="""{p}warn @Boi#0001 Arguing with people"""
    )
    async def warn(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str] = None):
        memb: discord.Member = cast(discord.Member, member)
        is_myself: bool = memb == ctx.me
        is_bot: bool = memb.bot

        count = await ctx.db['warns'].count_documents(  # how many times this user has been warned so far
            PartialWarnsModel(guild_id=str(ctx.guild.id), user_id=str(memb.id)).as_dict()
        )
        new_count = count + 1  # how many times the user will have been warned after this new warn
        new_limit_d = await ctx.db['warnlimits'].find_one(dict(guild_id=str(ctx.guild.id), amount=new_count))
        new_limit: Optional[PartialWarnLimitsModel] = None  # limit the user will reach after this warn
        if new_limit_d:
            new_limit = PartialWarnLimitsModel(**dict_except(new_limit_d, '_id'))
        are_there_limits = bool(await ctx.db['warnlimits'].find_one(dict(guild_id=str(ctx.guild.id))))

        sanitized_m = discord_sanitize(str(member))
        fmt = "Warning {0}... ({1})".format(sanitized_m, "{}")
        sent_msg: discord.Message = await ctx.send(
            fmt.format("Sending DM" if not new_limit and not is_myself and not is_bot else "Processing...")
        )

        if not new_limit and not is_myself and not is_bot:  # If we're reaching a limit, the punishment we invoke
            try:                                            # will do the job of sending DM.
                if not is_myself and not is_bot:
                    reason_embed: discord.Embed = discord.Embed(                         # Embed to send to DMs alerting
                        color=WARN_COLOR, description=reason or "No reason given",       # the dude he was punished
                        timestamp=datetime.datetime.utcnow(), title="Warn reason"
                    ) \
                        .set_footer(text=f"Warned in the server '{discord_sanitize(ctx.guild.name)}'") \
                        .set_thumbnail(url=ctx.guild.icon_url)

                    await memb.send(
                        f"You were warned in the server '{discord_sanitize(ctx.guild.name)}'!",
                        embed=reason_embed or None
                    )
                    await sent_msg.edit(content=fmt.format("DM Sent, warning..."))
            except discord.HTTPException:
                await sent_msg.edit(content=fmt.format("DM Failed, warning anyway..."))

        act_settings = await ctx.db['actionlogsettings'].find_one(dict(guild_id=str(ctx.guild.id)))
        case: Optional[int] = None
        if act_settings:
            act_settings_model = PartialActionLogSettingsModel(**dict_except(act_settings, '_id'))
            if (latest_c := act_settings_model.latest_case) and latest_c >= 0:
                case = latest_c + 1

        success_fmt = "Warned {0} successfully!{1}".format(sanitized_m, "{}")

        if new_limit and (punish_type := new_limit.punishment):
            mute_duration = delta_decompress(new_limit.mute_time) if new_limit.mute_time else None
            perma_mute = new_limit.permanent_mute or False
            res = None
            ctx._warn_punish = True
            ctx._mute_duration = mute_duration
            ctx._mute_permanent = perma_mute
            if (
                hasattr(self, punish_type)
                and (cmd := getattr(self, punish_type))
                and callable(clb := getattr(cmd, 'callback', None))
            ):
                vowel_n = "n" if is_vocalic(punish_type) else ""
                await sent_msg.edit(
                    content=success_fmt.format(
                        f" For reaching the set limit of {new_limit.amount} warns, they receive \
a{vowel_n} **{punish_type}**."
                    )
                )
                sig = inspect.signature(clb)
                new_reason = f"[Auto warn limit punishment] {reason}".strip()
                args = [
                    (
                        memb if param.annotation in (AmbiguityMemberConverter, discord.Member) else (
                            new_reason if "reason" in param.name.lower() else None
                        )  # affected member = warned member; reason = reason given.
                    ) for param in sig.parameters.values() if param.kind in (
                        inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD
                    ) and param.name not in ('self', 'ctx') and param.annotation not in (SContext, commands.Context)
                ]
                kwargs = {
                    param.name: (
                        memb if param.annotation in (AmbiguityMemberConverter, discord.Member) else (
                            new_reason if "reason" in param.name.lower() else None
                        )
                    ) for param in sig.parameters.values() if (
                        param.kind == inspect.Parameter.KEYWORD_ONLY
                        and param.name not in ('self', 'ctx')
                        and param.annotation not in (
                            SContext, commands.Context
                        )
                    )
                }
                res = await ctx.invoke(cmd, *args, **kwargs)
            else:
                await sent_msg.edit(
                    content=success_fmt.format(f" They reached the set limit of {new_limit.amount} warns, but could not\
be punished.")
                )

            highest_limit = await ctx.db['warnlimits'].find_one(
                PartialWarnLimitsModel(guild_id=str(ctx.guild.id)).as_dict(),
                sort=[('amount', DESCENDING)]
            )
            if highest_limit and new_limit.amount >= highest_limit['amount']:
                await ctx.db['warns'].delete_many(
                    dict(guild_id=str(ctx.guild.id), user_id=str(memb.id))
                )
            else:
                await ctx.db['warns'].insert_one(
                    WarnsModel(
                        guild_id=str(ctx.guild.id), user_id=str(memb.id), moderator_id=str(ctx.author.id),
                        warned_at=str(datetime.datetime.utcnow().timestamp()), case=case if res is not False else None
                    ).as_dict()
                )
            return

        if are_there_limits:  # no point in storing warns if there are no limits.
            await ctx.db['warns'].insert_one(
                WarnsModel(
                    guild_id=str(ctx.guild.id), user_id=str(memb.id), moderator_id=str(ctx.author.id),
                    warned_at=str(datetime.datetime.utcnow().timestamp()), case=case
                ).as_dict()
            )

        if act_settings:
            await actionlog(
                ctx, punish_type="warn", target=memb, moderator=ctx.author, reason=reason
            )

        await sent_msg.edit(content=success_fmt.format(""))

    @require_salt_permission("case get", default=True)
    @sguild_only()
    @sgroup(
        name="case", description="View action log cases.", invoke_without_command=True, example="{p}case 6"
    )
    async def case(self, ctx: SContext, number: int):
        found_dict = await ctx.db['punishments'].find_one(
            PartialPunishmentsModel(guild_id=str(ctx.guild.id), case=number, deleted=False).as_dict()
        )
        if not found_dict or found_dict['deleted']:
            await ctx.send(f"Case #{number} not found!")
            return

        oldest_case = await ctx.db['punishments'].find_one(
            PartialPunishmentsModel(guild_id=str(ctx.guild.id), deleted=False).as_dict(),
            sort=[('case', ASCENDING)]  # max=[('case', number)]
        )  # fetch oldest case
        latest_case = await ctx.db['punishments'].find_one(
            PartialPunishmentsModel(guild_id=str(ctx.guild.id), deleted=False).as_dict(),
            sort=[('case', DESCENDING)]  # max=[('case', number)]
        )  # fetch latest case
        min_case = oldest_case['case']
        max_case = latest_case['case']

        async def paginate(pag: PaginateOptions, msg: discord.Message, _ctx, intr: Interaction):
            nonlocal latest_case, oldest_case
            diff = pag.current_page - pag.old_page
            if pag.current_page > max_case or pag.current_page < min_case or not diff:
                return  # bruh
            max_to_use: int = pag.old_page if diff > 0 else pag.old_page + diff - 1  # account for negative diff
            diff_to_use: int = diff - 1 if diff > 0 else 0
            if not isinstance(intr.component, Button):
                return
            chosen_emj = str(intr.component.emoji)
            next_case = latest_case if chosen_emj == TRACK_NEXT else (
                oldest_case if chosen_emj == TRACK_PREVIOUS else await ctx.db['punishments'].find_one(
                    PartialPunishmentsModel(guild_id=str(ctx.guild.id), deleted=False).as_dict(),
                    sort=[('case', ASCENDING)], max={'case': max_to_use},
                    skip=diff_to_use  # "max" already skips 1 by default
                )  # fetch next case
            )
            new_case_num = next_case.get('case')
            if next_case and new_case_num != pag.old_page:
                pag.current_page = new_case_num
                try:
                    embed = await generate_actionlog_embed_from_entry(ctx, next_case, attempt_to_fetch=False)
                    await pag.respond(
                        interaction=intr,
                        embed=embed
                    )
                except discord.NotFound:
                    return

        try:
            await ctx.send(
                embed=await generate_actionlog_embed_from_entry(ctx, found_dict, attempt_to_fetch=True),
                paginate=PaginateOptions(paginate, current_page=number, min_page=min_case, max_page=max_case)
            )
        except discord.NotFound:
            await ctx.send("That case has an invalid user! :frowning:")
            return

    @require_salt_permission("case reason", default=True, also_uses=("case others",))
    @sguild_only()
    @case.command(
        name="reason", aliases=["edit"],
        description="Change an action log's reason.", example="{p}case reason 6 New reason"
    )
    async def case_reason(self, ctx: SContext, number: int, *, new_reason: str):
        found_dict = await ctx.db['punishments'].find_one(
            PartialPunishmentsModel(guild_id=str(ctx.guild.id), case=number).as_dict()
        )
        if not found_dict or found_dict['deleted']:
            await ctx.send(f"Case #{number} not found!")
            return
        provide_dict = copy(found_dict)
        del provide_dict['_id']

        found = PunishmentsModel(**provide_dict)
        if (
            found.moderator_id != str(ctx.author.id)
            and not ctx.author.guild_permissions.administrator
            and not await has_permission(
                ctx, ctx.author, "case others",
                obj_type="member", default=False, cog_name=ctx.command.cog.__class__.__name__,
                user_check_context=True
            )
        ):
            await ctx.send(f"That case is not yours! To edit others' cases, you need the `Administrator` Discord \
permission, a Salt Admin role or the `case others` saltperm!")
            return
        found.reason = new_reason
        await ctx.db['punishments'].update_one(dict(_id=found_dict['_id']), set_op(dict(reason=new_reason)))

        try:
            if (
                found.channel_id and (chan := ctx.guild.get_channel(int(found.channel_id)))
                and found.message_id
                and (msg := await cast(discord.TextChannel, chan).fetch_message(int(found.message_id)))
                and msg.embeds and len(msg.embeds) > 0
            ):  # if action log message exists
                embed = msg.embeds[0]
                modified: bool = False
                for i in range(len(embed.fields)):
                    field = embed.fields[i]
                    if field and hasattr(field, "name") and field.name.lower() == "reason":
                        embed.set_field_at(index=i, name="Reason", value=new_reason, inline=field.inline)
                        modified = True
                        break
                if modified:
                    await msg.edit(embed=embed)
        except discord.HTTPException:
            pass

        await ctx.send(f"Successfully changed Case #{number}'s reason!")

    @require_salt_permission("case togglethumb", default=True, also_uses=["case others"])
    @sguild_only()
    @case.command(name="togglethumb", description="Toggle an action log's thumbnail. \
(In case avatar is innapropriate or something like that)", example="{p}case togglethumb 5")
    async def case_togglethumb(self, ctx: SContext, number: int, on_or_off: bool = None):
        found_dict = await ctx.db['punishments'].find_one(
            PartialPunishmentsModel(guild_id=str(ctx.guild.id), case=number).as_dict()
        )
        if not found_dict or found_dict['deleted']:
            await ctx.send(f"Case #{number} not found!")
            return
        provide_dict = copy(found_dict)
        del provide_dict['_id']

        found = PunishmentsModel(**provide_dict)
        if (
            found.moderator_id != str(ctx.author.id)
            and not ctx.author.guild_permissions.administrator
            and not await has_permission(
                ctx, ctx.author, "case others",
                obj_type="member", default=False, cog_name=ctx.command.cog.__class__.__name__,
                user_check_context=True
            )
        ):
            await ctx.send(f"That case is not yours! To edit others' cases, you need the `Administrator` Discord \
permission, a Salt Admin role or the `case others` saltperm!")
            return
        on_or_off = not found.thumb_on if on_or_off is None else on_or_off
        found.thumb_on = on_or_off
        await ctx.db['punishments'].update_one(dict(_id=found_dict['_id']), set_op(dict(thumb_on=on_or_off)))

        try:
            if (
                found.channel_id and (chan := ctx.guild.get_channel(int(found.channel_id)))
                and found.message_id
                and (msg := await cast(discord.TextChannel, chan).fetch_message(int(found.message_id)))
                and msg.embeds and len(msg.embeds) > 0
            ):  # if action log message exists
                embed = msg.embeds[0]
                as_dict = embed.to_dict()
                modified: bool = False
                if (
                    on_or_off and not as_dict.get('thumbnail', None)
                    or not on_or_off and as_dict.get('thumbnail', None)
                ):
                    if not on_or_off:
                        del as_dict['thumbnail']
                        embed = discord.Embed.from_dict(as_dict)
                    else:
                        new_embed = await generate_actionlog_embed_from_entry(ctx, found.as_dict())
                        embed.set_thumbnail(url=new_embed.thumbnail)
                    modified = True

                if modified:
                    await msg.edit(embed=embed)
        except discord.HTTPException:
            pass

        await ctx.send(f"Successfully toggled Case #{number}'s thumbnail {'on' if on_or_off else 'off'}!")

    @require_salt_permission("case delete", default=True, also_uses=["case others"])
    @sguild_only()
    @case.command(name="delete", description="Delete a case.", example="{p}case delete 6")
    async def case_delete(self, ctx: SContext, number: int):
        found_dict = await ctx.db['punishments'].find_one(
            PartialPunishmentsModel(guild_id=str(ctx.guild.id), case=number).as_dict()
        )
        if not found_dict or found_dict['deleted']:
            await ctx.send(f"Case #{number} not found!")
            return
        provide_dict = copy(found_dict)
        del provide_dict['_id']

        found = PunishmentsModel(**provide_dict)
        if (
            found.moderator_id != str(ctx.author.id)
            and not ctx.author.guild_permissions.administrator
            and not await has_permission(
                ctx, ctx.author, "case others",
                obj_type="member", default=False, cog_name=ctx.command.cog.__class__.__name__,
                user_check_context=True
            )
        ):
            await ctx.send(f"That case is not yours! To edit others' cases, you need the `Administrator` Discord \
permission, a Salt Admin role or the `case others` saltperm!")
            return

        emb_desc: str = f"Are you sure you want to delete Case #{number}? **This is irreversible.** Type \
**__y__es** to confirm or **__n__o** to cancel."  # Description for confirmation embed

        # Confirmation embed - are you sure you wanna delete this case?
        embed = discord.Embed(description=emb_desc, timestamp=datetime.datetime.utcnow()) \
            .set_author(name=f"Deleting Case #{number}")                                  \
            .set_footer(text="Please confirm")

        received, cancelled, _s = await prompt(
            "Are you sure?", ctx=ctx, embed=embed, already_asked=False, predicate_gen=confirmation_predicate_gen,
            cancellable=True, partial_question=False
        )  # Run prompt.

        if cancelled or normalize_caseless(received.content).startswith("n"):  # Dude said 'no'
            await ctx.send("Command cancelled.")
            return

        try:
            if (
                found.channel_id and (chan := ctx.guild.get_channel(int(found.channel_id)))
                and found.message_id
                and (msg := await cast(discord.TextChannel, chan).fetch_message(int(found.message_id)))
            ):  # if action log message exists
                await msg.delete()  # We're deleting the case after all
        except discord.HTTPException:
            pass

        await ctx.db['punishments'].delete_one(dict(_id=found_dict['_id']))

        await ctx.send(f"Case #{number} deleted successfully!")

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_messages=True),
        require_salt_permission("clear", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Messages", "clear"))
    )
    @require_salt_permission("clear", just_check_if_negated=True)
    @commands.bot_has_permissions(manage_messages=True)
    @sguild_only()
    @sgroup(
        name="clear", invoke_without_command=True,
        example="{p}clear 6\n{p}clear 10 Annoying#0001\n{p}clear 15 Raider1#0001 Raider2#0001 Raider3#0001"
    )
    async def clear(
            self, ctx: SContext,
            amount: CustomIntConverter(condition=lambda i: 0 < i <= 1000, range_str="be between 1 and 1000") = 10,
            *users: Optional[AmbiguityMemberConverter]
    ):
        """
        Clear one or more messages. If one or more users are specified (separated by space - enclose spaced names \
        with quotes around them), only their messages are deleted. If not specified, the default amount of cleared \
        messages is 10.
        """
        amnt = cast(int, amount)
        is_clear_bot = hasattr(ctx, "_clear_bot") and getattr(ctx, "_clear_bot", False)  # invoked +clear bot

        def user_check(msg: discord.Message):
            return msg.author in users

        def bot_check(msg: discord.Message):
            return msg.author.bot

        check = None
        if is_clear_bot:
            check = bot_check
        elif users:
            check = user_check

        before_sending = datetime.datetime.utcnow()
        sent_msg = await ctx.send(
            f"Deleting {amnt} {'bot ' if is_clear_bot else ''}message{plural_s(amnt)}\
{' sent by the specified user{}'.format(plural_s(users)) if users else ''}..."
        )

        include_clear_msg = ctx.author in users or not users

        deleted = await cast(discord.TextChannel, ctx.channel).purge(
            limit=amnt + (1 if include_clear_msg else 0),  # that " + 1" is to account for the `+clear`
            check=check, before=before_sending    # message, which should also be deleted.
        )
        real_len = len(deleted) - (1 if include_clear_msg else 0)  # excluding `+clear`
        await sent_msg.edit(content="{0} {1}message{2} {3}deleted successfully!".format(
            real_len, "bot " if is_clear_bot else "",
            plural_s(real_len), f"by {discord_sanitize(str(users[0]))} " if len(users) == 1 else (
                "by the specified users " if users else ""
            )
        ))
        await sent_msg.delete(delay=5)

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_messages=True),
        require_salt_permission("clear bot", default=False),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Messages", "clear"))
    )
    @require_salt_permission("clear bot", just_check_if_negated=True)
    @commands.bot_has_permissions(manage_messages=True)
    @sguild_only()
    @clear.command(name="bot", example="{p}clear bot 5")
    async def clear_bot(
            self, ctx: SContext,
            amount: CustomIntConverter(condition=lambda i: 0 < i <= 1000, range_str="be between 1 and 1000") = 10
    ):
        """
        Clears messages from bots.
        """
        ctx._clear_bot = True
        await ctx.invoke(self.clear, amount)


def setup(bot: commands.Bot) -> None:
    bot.add_cog(Moderation(bot))
