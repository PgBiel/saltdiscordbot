import discord
import datetime
import re
import math
import motor.motor_asyncio
from dataclasses import asdict
from dateutil.relativedelta import relativedelta
from discord.ext import commands
from classes import SContext, NoPermissions, scommand, MutesModel, ActiveMutesModel, set_op, \
    AmbiguityUserOrMemberConverter
from classes.converters import AmbiguityMemberConverter
from utils.advanced.checks import or_checks, is_owner, has_saltmod_role, sguild_only
from utils.advanced import confirmation_predicate_gen, prompt, actionlog
from utils.funcs import (
    discord_sanitize, normalize_caseless, kickable, bannable, make_delta, humanize_delta,
    create_mute_role, humanize_list, clamp
)
from constants import DATETIME_DEFAULT_FORMAT
from constants.colors import KICK_COLOR, BAN_COLOR, MUTE_COLOR
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
    is_outsider = not bool(ctx.guild.get_member(member.id)) if is_idban else False
    verb_alt: str = verb + "n" if "ban" in verb else verb  # Use for alternative forms of the verb - "ban" -> "bann"ed..
    checker_func = kickable if verb == "kick" else bannable
    member_str = "user" if is_outsider else "member"
    # Which function should we use to check if the member is punishable?

    if is_outsider:  # Ensure we don't re-ban people.
        try:
            if await ctx.guild.fetch_ban(user=discord.Object(member.id)):
                await ctx.send("That user is already banned!")
                return
        except discord.HTTPException:
            pass

    if not is_outsider:
        if not checker_func(member):  # If the member is not punishable BY THE BOT, then let's say why.
            if member == ctx.me:
                await ctx.send(f"I won't {verb} myself! :slight_smile:")
                return
            if member.id == ctx.guild.owner_id:  # Member is owner, can't punish
                await ctx.send(f"I cannot {verb} the specified member, because that is the owner!")
                return
            top_role = member.top_role
            if top_role.position > ctx.me.top_role.position:  # Member is from higher role
                await ctx.send(f"I cannot {verb} the specified member, because their highest role is higher than mine!")
                return
            if top_role.position == ctx.me.top_role.position:  # Member is from same role position
                await ctx.send(f"I cannot {verb} the specified member, because their highest role is the same as mine!")
                return
            await ctx.send(f"I cannot {verb} the specified member!")  # idk what's going on but we can't punish
            return

        if not checker_func(member, performer=ctx.author, needs_the_perm=False):  # Now check if THE PUNISHER can do it.
            if member.id == ctx.guild.owner_id:  # Well, we already made this check before, but... Can't punish owner
                await ctx.send(f"You cannot {verb} the specified member, because that is the owner!")
                return
            if member == ctx.author:  # Cannot punish yourself :)
                await ctx.send(f"You cannot {verb} yourself! :eyes:")
                return
            top_role = member.top_role
            if top_role.position > ctx.author.top_role.position:  # Cannot punish people above your highest role...
                await ctx.send(
                    f"You cannot {verb} the specified member, because their highest role is higher than yours!"
                )
                return
            if top_role.position == ctx.author.top_role.position:  # ...or from same highest role position.
                await ctx.send(
                    f"You cannot {verb} the specified member, because their highest role is the same as yours!"
                )
                return
            await ctx.send(f"You cannot {verb} the specified member!")  # wth is going on
            return

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
        return

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
        is_owner(), has_saltmod_role(), commands.has_permissions(kick_members=True),  # (saltperm to be added later)
        error=NoPermissions(moderation_dperm_error_fmt.format("Kick Members", "kick"))  # TODO: Add saltperm check
    )
    @commands.bot_has_permissions(kick_members=True)
    @sguild_only()
    @scommand(name="kick", description="Kick people.")
    async def kick(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        await _kick_or_ban(ctx, member=cast(discord.Member, member), reason=reason, verb="kick", color=KICK_COLOR)

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @sguild_only()
    @scommand(name="ban", description="Ban people.")
    async def ban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        await _kick_or_ban(ctx, member=cast(discord.Member, member), reason=reason, verb="ban", color=BAN_COLOR)

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @sguild_only()
    @scommand(name="nodelban", description="Ban people without deleting any message.")
    async def nodelban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        await _kick_or_ban(
            ctx, member=cast(discord.Member, member), reason=reason, verb="ban", color=BAN_COLOR,
            ban_days=0
        )

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @sguild_only()
    @scommand(name="weekdelban", description="Ban people and delete their messages sent up to a week ago.")
    async def weekdelban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        await _kick_or_ban(
            ctx, member=cast(discord.Member, member), reason=reason, verb="ban", color=BAN_COLOR,
            ban_days=7
        )

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(), commands.has_permissions(ban_members=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @sguild_only()
    @scommand(name="idban", aliases=["hackban"], description="Ban people that aren't in the server by ID.")
    async def idban(self, ctx: SContext, member: AmbiguityUserOrMemberConverter, *, reason: Optional[str]):
        await _kick_or_ban(
            ctx, member=cast(discord.abc.User, member), reason=reason, verb="ban", color=BAN_COLOR,
            is_idban=True
        )

    @or_checks(  # Same as kick's, but Ban Members perm and 'ban' saltperm
        is_owner(), has_saltmod_role(),
        commands.has_permissions(kick_members=True), commands.has_permissions(ban_members=True),  # either kick or ban
        error=NoPermissions(moderation_dperm_error_fmt.format("Kick Members, Ban Members", "softban"))
    )
    @commands.bot_has_permissions(ban_members=True)
    @sguild_only()
    @scommand(name="softban", description="Kick but remove messages in their way out. (Ban and unban)")
    async def softban(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        await _kick_or_ban(ctx, member=cast(discord.Member, member), reason=reason, verb="softban", color=KICK_COLOR)

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @sguild_only()
    @scommand(name='mute', description="Mute people.")
    async def mute(self, ctx: SContext, member: AmbiguityMemberConverter, *, time_and_reason: Optional[str]):
        memb: discord.Member = cast(discord.Member, member)  # (Typing purposes)
        do_extend = getattr(ctx, "_mute_extend", False)  # If invoked as `emute`, in which you can re-mute muted people
        is_permanent = getattr(ctx, "_mute_permanent", False)  # If invoked as `pmute`, in which you mute people forever
        check_active_mutes: motor.motor_asyncio.AsyncIOMotorCollection = ctx.db.activemutes
        found_active_mute: motor.motor_asyncio.AsyncIOMotorCursor = await check_active_mutes.find_one(dict(
            guild_id=str(ctx.guild.id), user_id=str(memb.id)
        ))
        if found_active_mute and not do_extend:  # Otherwise don't let them re-mute.
            await ctx.send(
                "That member is already muted! To change their mute duration{0}, use the `e{1}mute` command.".format(
                    " to permanent" if is_permanent else "",
                    "p" if is_permanent else ""
                )
            )
            return
        elif do_extend and not found_active_mute:
            await ctx.send("That member is not muted! This command changes duration of already existing mutes. \
To mute someone, use the `mute` command.")
            return
        time_to_mute = relativedelta(minutes=DEFAULT_MUTE_MINUTES)  # default: 10 min
        reason_to_mute: str = time_and_reason if is_permanent else ""  # reasoning
        if time_and_reason and not is_permanent:  # if user provided a time or reason
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

        now = datetime.datetime.utcnow()
        mute_at = now
        if not is_permanent:
            try:
                mute_at += time_to_mute  # Date until when they are muted.
            except (OverflowError, OSError, ValueError):  # Except that's too far away.
                return await ctx.send("You specified a number that is too big!")

        duration_str = "Forever" if is_permanent else humanize_delta(time_to_mute) or "0 seconds"

        if not do_extend:  # No need to confirm changing mute duration, nor add mute role during it (member alr. muted)
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
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @sguild_only()
    @scommand(name='emute', aliases=["remute"], description="Change how long someone is muted for.")
    async def emute(self, ctx: SContext, member: AmbiguityMemberConverter, *, time_and_reason: Optional[str]):
        ctx._mute_extend = True
        await ctx.invoke(self.mute, member, time_and_reason=time_and_reason)\


    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
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
    @sguild_only()
    @scommand(name='pmute', description="Mute someone permanently. (Until they are manually unmuted)")
    async def pmute(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        ctx._mute_permanent = True
        await ctx.invoke(self.mute, member, time_and_reason=reason)

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Manage Roles", "mute"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @sguild_only()
    @scommand(name='unmute', description="Unmute a member.")
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


def setup(bot: commands.Bot) -> None:
    bot.add_cog(Moderation(bot))
