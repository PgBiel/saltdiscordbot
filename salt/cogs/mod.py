import discord
import datetime
import re
import math
import motor.motor_asyncio
from dateutil.relativedelta import relativedelta
from discord.ext import commands
from classes import SContext, NoPermissions, scommand, MutesModel
from classes.converters import AmbiguityMemberConverter
from utils.advanced.checks import or_checks, is_owner, has_saltmod_role, sguild_only
from utils.advanced import confirmation_predicate_gen, prompt
from utils.funcs import (
    discord_sanitize, normalize_caseless, kickable, bannable, make_delta, humanize_delta,
    create_mute_role
)
from constants.colors import KICK_COLOR, BAN_COLOR, MUTE_COLOR
from constants.regex import MUTE_REGEX, TIME_MATCH, TIME_SPLIT_REGEX
from constants.numbers import DEFAULT_MUTE_MINUTES
from constants.maps import TIME_ALIASES
from typing import Optional, cast

moderation_dperm_error_fmt = "Missing permissions! For this command, you need either {0}, a Salt Mod role or the \
`{1}` saltperm."


async def _kick_or_ban(
        ctx: SContext, *, member: discord.Member, reason: Optional[str], verb: str, color: discord.Colour
):
    """
    Run kick or ban command.
    :param ctx: The context.
    :param member: Member to be punished.
    :param reason: Reason for punishing, or None.
    :param verb: The verb ("kick" or "ban") to use in messages.
    :param color: The embed color.
    :return:
    """
    verb_alt: str = "bann" if verb == "ban" else verb  # Use for alternative forms of the verb
    checker_func = kickable if verb == "kick" else bannable
    # Which function should we use to check if the member is punishable?

    if not checker_func(member):  # If the member is not punishable BY THE BOT, then let's say why.
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

    if not checker_func(member, performer=ctx.author, needs_the_perm=False):  # Now check if THE PUNISHER has perm to.
        if member.id == ctx.guild.owner_id:  # Well, we already made this check before, but... Can't punish owner
            await ctx.send(f"You cannot {verb} the specified member, because that is the owner!")
            return
        if member == ctx.author:  # Cannot punish yourself :)
            await ctx.send(f"You cannot {verb} yourself! :eyes:")
            return
        top_role = member.top_role
        if top_role.position > ctx.author.top_role.position:  # Cannot punish people above your highest role...
            await ctx.send(f"You cannot {verb} the specified member, because their highest role is higher than yours!")
            return
        if top_role.position == ctx.author.top_role.position:  # ...or from same highest role position.
            await ctx.send(f"You cannot {verb} the specified member, because their highest role is the same as yours!")
            return
        await ctx.send(f"You cannot {verb} the specified member!")  # wth is going on
        return

    emb_desc: str = f"Are you sure you want to {verb} the member {discord_sanitize(str(member))}? Type **__y__es** to \
    confirm or **__n__o** to cancel."  # Description for confirmation embed

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

    base_text = "{0}ing member... ({1})".format(verb_alt.title(), "{}")  # Banning member.../Kicking member...
    status_msg = await ctx.send(base_text.format("Sending DM..."))  # Let's keep our mod updated with what's going on
    try:
        reason_embed: discord.Embed = discord.Embed(  # Embed to send to DMs alerting the dude he was punished.
            color=color, description=reason or "No reason given", timestamp=datetime.datetime.now(),
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
        await (getattr(member, verb)(reason=reason))  # Punishing now (member.kick or member.ban)
    except discord.Forbidden:
        await status_msg.edit(content=f"Uh oh, it seems I cannot {verb} this member! :frowning:")  # bruh wth
    except discord.HTTPException:
        await status_msg.edit(content=f"Uh oh, it seems {verb_alt}ing failed! (Try again?) :frowning:")  # error
    else:
        await status_msg.edit(content=f"Successfully {verb_alt}ed member {discord_sanitize(str(member))}.")
        # Succeeded! Member yeeted away from the server.


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

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(manage_roles=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Ban Members", "ban"))
    )
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    @sguild_only()
    @scommand(name='mute', description="(WIP) Mute people.")
    async def mute(self, ctx: SContext, member: AmbiguityMemberConverter, *, time_and_reason: Optional[str]):
        memb: discord.Member = cast(discord.Member, member)  # (Typing purposes)
        time_to_mute = relativedelta(minutes=DEFAULT_MUTE_MINUTES)  # default: 10 min
        reason_to_mute: str = ""  # reasoning
        if time_and_reason:  # if user provided a time or reason
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

        try:
            mute_at = datetime.datetime.utcnow() + time_to_mute  # Date until when they are muted.
        except (OverflowError, OSError, ValueError):  # Except that's too far away.
            return await ctx.send("You specified a number that is too big!")

        await ctx.send(  # TODO: Remove this debug thing.
            f"Mute time and reason: time={time_to_mute}; {reason_to_mute=}. Member: {member} \
muteduntil {mute_at}"
        )

        emb_desc: str = f"Are you sure you want to mute the member {discord_sanitize(str(member))}? Type **__y__es** \
to confirm or **__n__o** to cancel. (**Note:** You can disable this confirmation screen with `{ctx.prefix}pconfig set \
mute_confirm no`)"

        # Confirmation embed.
        embed = discord.Embed(color=MUTE_COLOR, description=emb_desc, timestamp=datetime.datetime.utcnow()) \
            .set_author(name=f"Muting {str(memb)}", icon_url=memb.avatar_url) \
            .set_thumbnail(url=memb.avatar_url) \
            .add_field(name="Muted for", value=humanize_delta(time_to_mute) or "0 seconds") \
            .add_field(name="Reason", value=reason_to_mute[:512] or "None") \
            .set_footer(text="Please confirm")

        received, cancelled, _s = await prompt(  # Prompt 'em for confirmation, in case it parsed wrong or smth
            "Are you sure?", ctx=ctx, embed=embed, already_asked=False, predicate_gen=confirmation_predicate_gen,
            cancellable=True, partial_question=False
        )
        if cancelled or normalize_caseless(received.content).startswith("n"):  # Dude said no, nvm let's not mute
            await ctx.send("Command cancelled.")
            return

        mutes_col: motor.motor_asyncio.AsyncIOMotorCollection = ctx.db.mutes  # Let's see if we have a mute role stored
        mutes_entry: motor.motor_asyncio.AsyncIOMotorCursor = await mutes_col.find_one(dict(guild_id=str(ctx.guild.id)))
        mute_role_id_str: str = ""
        if (
                not mutes_entry                                           # No mutes entry for this guild
                or not (mute_role_id_str := mutes_entry['mute_role_id'])  # No mute role set
                or not ctx.guild.get_role(int(mute_role_id_str))          # mute role not found
        ):
            new_role, unable_to_channels = create_mute_role(ctx)
            if mutes_entry:
                _id_to_replace = mutes_entry['_id']
                await mutes_col.replace_one(dict(_id=_id_to_replace), dict(mute_role_id=str(new_role.id)))
            else:
                await mutes_col.insert_one(MutesModel(guild_id=str(ctx.guild.id), mute_role_id=str(new_role.id)))
        # TODO: Finish this; warn that some channels didnt have perms changed


def setup(bot: commands.Bot) -> None:
    bot.add_cog(Moderation(bot))
