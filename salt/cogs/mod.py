import discord
import datetime
import re
from discord.ext import commands
from classes import SContext, NoPermissions, scommand
from classes.converters import AmbiguityMemberConverter
from utils.advanced.checks import or_checks, is_owner, has_saltmod_role, sguild_only
from utils.advanced import confirmation_predicate_gen, prompt
from utils.funcs import discord_sanitize, normalize_caseless, kickable, bannable
from constants.colors import KICK_COLOR, BAN_COLOR
from constants.regex import MUTE_REGEX
from typing import Optional, cast

moderation_dperm_error_fmt = "Missing permissions! For this command, you need either {0}, a Salt Mod role or the \
`{1}` saltperm."


async def _kick_or_ban(
        ctx: SContext, *, member: discord.Member, reason: Optional[str], verb: str, color: discord.Colour
):
    verb_alt: str = "bann" if verb == "ban" else verb
    checker_func = kickable if verb == "kick" else bannable
    if not checker_func(member):
        if member.id == ctx.guild.owner_id:
            await ctx.send(f"I cannot {verb} the specified member, because that is the owner!")
            return
        top_role = member.top_role
        if top_role.position > ctx.me.top_role.position:
            await ctx.send(f"I cannot {verb} the specified member, because their highest role is higher than mine!")
            return
        if top_role.position == ctx.me.top_role.position:
            await ctx.send(f"I cannot {verb} the specified member, because their highest role is the same as mine!")
            return
        await ctx.send(f"I cannot {verb} the specified member!")
        return

    if not checker_func(member, performer=ctx.author, needs_the_perm=False):
        if member.id == ctx.guild.owner_id:
            await ctx.send(f"You cannot {verb} the specified member, because that is the owner!")
            return
        if member == ctx.author:
            await ctx.send(f"You cannot {verb} yourself! :eyes:")
            return
        top_role = member.top_role
        if top_role.position > ctx.author.top_role.position:
            await ctx.send(f"You cannot {verb} the specified member, because their highest role is higher than yours!")
            return
        if top_role.position == ctx.author.top_role.position:
            await ctx.send(f"You cannot {verb} the specified member, because their highest role is the same as yours!")
            return
        await ctx.send(f"You cannot {verb} the specified member!")
        return

    emb_desc: str = f"Are you sure you want to {verb} the member {discord_sanitize(str(member))}? Type __y__es to \
    confirm, and __n__o or `cancel` to cancel."

    embed = discord.Embed(color=color, description=emb_desc, timestamp=datetime.datetime.now()) \
        .set_author(name=f"{verb_alt.title()}ing {str(member)}", icon_url=member.avatar_url) \
        .set_thumbnail(url=member.avatar_url) \
        .set_footer(text="Please confirm")
    received, cancelled, _s = await prompt(
        "Are you sure?", ctx=ctx, embed=embed, already_asked=False, predicate_gen=confirmation_predicate_gen,
        cancellable=True, partial_question=False
    )
    if cancelled or normalize_caseless(received.content).startswith("n"):
        await ctx.send("Command cancelled.")
        return

    base_text = "{0}ing member... ({1})".format(verb_alt.title(), "{}")
    status_msg = await ctx.send(base_text.format("Sending DM..."))
    try:
        reason_embed: discord.Embed = discord.Embed(
            color=color, description=reason or "No reason given", timestamp=datetime.datetime.now(),
            title=f"{verb.title()} reason"
        ) \
            .set_footer(text=f"{verb_alt.title()}ed from server '{discord_sanitize(ctx.guild.name)}'") \
            .set_thumbnail(url=ctx.guild.icon_url)

        await member.send(
            f"You were {verb_alt}ed from the server '{discord_sanitize(ctx.guild.name)}'!",
            embed=reason_embed
        )
        await status_msg.edit(content=base_text.format(f"DM sent, {verb_alt}ing..."))
    except discord.HTTPException:
        await status_msg.edit(content=base_text.format(f"DM failed, {verb_alt}ing anyway..."))
    try:
        await (getattr(member, verb)(reason=reason))
    except discord.Forbidden:
        await status_msg.edit(content=f"Uh oh, it seems I cannot {verb} this member! :frowning:")
    except discord.HTTPException:
        await status_msg.edit(content=f"Uh oh, it seems {verb_alt}ing failed! (Try again?) :frowning:")
    else:
        await status_msg.edit(content=f"Successfully {verb_alt}ed member {discord_sanitize(str(member))}.")


class Moderation(commands.Cog):

    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(kick_members=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Kick Members", "kick"))
    )
    @commands.bot_has_permissions(kick_members=True)
    @sguild_only()
    @scommand(name="kick", description="Kick people.")
    async def kick(self, ctx: SContext, member: AmbiguityMemberConverter, *, reason: Optional[str]):
        await _kick_or_ban(ctx, member=cast(discord.Member, member), reason=reason, verb="kick", color=KICK_COLOR)

    @or_checks(
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
        time_to_mute = datetime.timedelta(seconds=60 * 10)  # default: 10 min
        reason_to_mute: str = ""
        if time_and_reason:
            match = re.fullmatch(MUTE_REGEX, time_and_reason, re.RegexFlag.X)
            if match:
                time, mins, mins2, reason = (
                    match.group("time"), match.group("mins"), match.group("mins2"), match.group("reason")
                )
                # TODO: Finish mute


def setup(bot: commands.Bot) -> None:
    bot.add_cog(Moderation(bot))
