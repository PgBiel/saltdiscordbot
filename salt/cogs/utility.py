import unicodedata
import datetime
import discord
from discord.ext import commands
from discord.ext.commands.converter import _get_from_guilds
from utils.funcs import humanize_delta, humanize_list
from classes import scommand, sgroup, SContext, AmbiguityUserOrMemberConverter
from constants.string import DATETIME_DEFAULT_FORMAT
from constants.emoji import PAIR_STATUS_EMOJI
from typing import List, Union, Optional, cast


class Utility(commands.Cog):

    @scommand(name="len", aliases=["length"], description="Tells you the length of your message.")
    async def len(self, ctx: SContext, *, text: str):
        await ctx.send(f"Your text is **{len(text)} chars** long.")

    @scommand(name="char", aliases=["character"], description="Provides info about a unicode character.")
    async def char(self, ctx: SContext, *, characters: str):
        char_list: List[str] = list(characters.replace("\n", ""))[:10]  # Max length: 10
        text = ""
        for char in char_list:
            try:
                name = unicodedata.name(char)
            except ValueError:
                name = None
            digit = "{0:x}".format(ord(char))
            text += "``{0} {1} `` - {2} {3} - \\U{4:0>8}\n".format(
                "\u200b " if name in ("GRAVE ACCENT", "SPACE") else "", char, name or "(no name)",
                " " if name == "COMBINING ENCLOSING KEYCAP" else "",
                digit
            )

        await ctx.send(text[0:2000], deletable=True)

    @sgroup(name="info", description="Provides info about something.")
    async def info(self, ctx: SContext):
        pass

    @commands.bot_has_permissions(embed_links=True)
    @info.command(name="user", description="View info about an user.")
    async def info_user(self, ctx: SContext, *, member: Optional[AmbiguityUserOrMemberConverter]):
        memb_or_user = cast(Union[discord.Member, discord.User], member) or ctx.author
        is_member = isinstance(memb_or_user, discord.Member) and ctx.guild and ctx.guild.get_member(memb_or_user.id)
        role_color = memb_or_user.colour if is_member else None
        created_at = memb_or_user.created_at
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Joined Discord at {0} ({1} ago)".format(
            formatted_created_at,
            humanize_delta(datetime.datetime.now()-created_at)
        )
        avatar = memb_or_user.avatar_url
        status: discord.Status = memb_or_user.status if is_member else None
        embed = discord.Embed(description=desc)                                                             \
            .set_author(name=f"Info for user {str(memb_or_user)}", icon_url=avatar, url=avatar)             \
            .set_footer(text=f"Click the title for avatar URL | User ID: {memb_or_user.id}")                \
            .set_thumbnail(url=avatar)

        if is_member:
            if role_color.value != 0:
                embed.color = role_color
            status_emoji = None
            for em in PAIR_STATUS_EMOJI:
                if em.name == str(status):
                    status_emoji = em
            status_val = f"{str(status).title()}{status_emoji.emoji}" if status_emoji else "None"

            activity = memb_or_user.activity
            activity_verb = str(activity.type).replace('ActivityType.', '').title() if activity else None
            if activity_verb == "Listening":
                activity_verb += " to"
            activity_val = f"{activity_verb} **{activity.name}**" if activity else None

            joined_at = memb_or_user.joined_at
            formatted_joined_at = joined_at.strftime(DATETIME_DEFAULT_FORMAT)

            normal_roles: List[discord.Role] = memb_or_user.roles
            normal_roles.pop(0)  # remove @everyone role from list
            role_count = len(normal_roles)
            role_mentions = [role.mention for role in normal_roles]

            embed                                                                                       \
                .add_field(name="Status", value=status_val)                                             \
                .add_field(name="Activity", value=activity_val or "None")                               \
                .add_field(
                    name="Display Color (sidebar)", value=str(role_color if role_color.value != 0 else "Default")
                )                                                                                       \
                .add_field(name="Permissions (see +perms)", value=memb_or_user.guild_permissions.value) \
                .add_field(name="Server Join (UTC)", value=formatted_joined_at)                         \
                .add_field(
                    name=f"Roles ({role_count})", value=", ".join(role_mentions) if role_count > 0 else "None",
                    inline=False
                )
        elif found_member := _get_from_guilds(ctx.bot, "get_member", memb_or_user.id):
            status_emoji = None
            for em in PAIR_STATUS_EMOJI:
                if em.name == str(found_member.status):
                    status_emoji = em
            status_val = f"{str(found_member.status).title()}{status_emoji.emoji}" if status_emoji else "None"
            activity = found_member.activity
            activity_verb = str(activity.type).replace('ActivityType.', '').title() if activity else None
            if activity_verb == "Listening":
                activity_verb += " to"
            activity_val = f"{activity_verb} **{activity.name}**" if activity else None
            embed                                                              \
                .add_field(name="Status", value=status_val)                    \
                .add_field(name="Activity", value=activity_val or "None")

        await ctx.send(embed=embed, deletable=True)


def setup(bot: commands.bot):
    bot.add_cog(Utility(bot))
