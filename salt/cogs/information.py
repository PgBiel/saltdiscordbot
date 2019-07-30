import re
import discord
import datetime
from discord.ext import commands
from discord.ext.commands.converter import _get_from_guilds
from utils.funcs import humanize_delta, humanize_list, humanize_voice_region, humanize_discord_syntax, discord_sanitize
from utils.advanced import sguild_only
from classes import scommand, sgroup, SContext, AmbiguityUserOrMemberConverter, AmbiguityRoleConverter
from constants import (
    DATETIME_DEFAULT_FORMAT, PAIR_STATUS_EMOJI, EMBED_FIELD_VALUE_LIMIT,
    INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE
)
from typing import List, Union, Optional, cast


class Information(commands.Cog):
    @sgroup(name="info", description="Provides info about something.")
    async def info(self, ctx: SContext):
        pass

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @commands.bot_has_permissions(embed_links=True)
    @info.command(name="user", description="View info about an user.")
    async def info_user(self, ctx: SContext, *, member: Optional[AmbiguityUserOrMemberConverter]):
        memb_or_user = cast(Union[discord.Member, discord.User], member) or ctx.author
        is_member = isinstance(memb_or_user, discord.Member) and ctx.guild and ctx.guild.get_member(memb_or_user.id)
        role_color = memb_or_user.colour if is_member else None
        created_at = memb_or_user.created_at
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Joined Discord at {0}\n({1} ago)".format(
            formatted_created_at,
            humanize_delta(datetime.datetime.utcnow() - created_at, scale=True)
        )
        avatar = memb_or_user.avatar_url
        status: discord.Status = memb_or_user.status if is_member else None
        embed = discord.Embed(description=desc)                                                                   \
            .set_author(name=f"Info for user {discord_sanitize(str(memb_or_user))}", icon_url=avatar, url=avatar) \
            .set_footer(text=f"Click the title for avatar URL | User ID: {memb_or_user.id}")                      \
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
            activity_val = f"{activity_verb} **{discord_sanitize(activity.name)}**" if activity else None

            joined_at = memb_or_user.joined_at
            formatted_joined_at = joined_at.strftime(DATETIME_DEFAULT_FORMAT)

            normal_roles: List[discord.Role] = memb_or_user.roles
            normal_roles.pop(0)  # remove @everyone role from list
            normal_roles.reverse()
            role_count = len(normal_roles)
            role_mentions = [role.mention for role in normal_roles]
            extra_roles: int = 0
            extra_str = "...(+{})"
            if len(", ".join(role_mentions)) > EMBED_FIELD_VALUE_LIMIT:
                while len(", ".join(role_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_str) + 1):
                    role_mentions.pop()
                    extra_roles += 1
            extra_str = extra_str.format(extra_roles)
            roles_value = (
                    ", ".join(role_mentions) + (extra_str if extra_roles else "")
            ) if role_count > 0 else "None"

            nick_val = discord_sanitize((memb_or_user.nick or "None"))
            embed \
                .add_field(name="Status", value=status_val)                                                       \
                .add_field(name="Activity", value=activity_val or "None")                                         \
                .add_field(
                    name="Display Color (sidebar)", value=str(role_color if role_color.value != 0 else "Default")
                )                                                                                                 \
                .add_field(name="Permissions (see +perms)", value=memb_or_user.guild_permissions.value)           \
                .add_field(name="Server Join (UTC)", value=formatted_joined_at)                                   \
                .add_field(name="Nickname", value=nick_val)                                                       \
                .add_field(
                    name=f"Roles ({role_count})", value=roles_value, inline=False
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
            embed \
                .add_field(name="Status", value=status_val) \
                .add_field(name="Activity", value=activity_val or "None")

        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @sguild_only()
    @info.command(name='role', description='View info about a role.')
    async def info_role(self, ctx: SContext, *, role_name: AmbiguityRoleConverter):
        role: discord.Role = cast(discord.Role, role_name)

        created_at = role.created_at
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(
            formatted_created_at,
            humanize_delta(datetime.datetime.utcnow() - created_at, scale=True)
        )

        members = role.members
        members.reverse()
        member_count = len(members)
        member_mentions = [member.mention for member in members]
        extra_members: int = 0
        extra_str = "...(+{})"
        if len(", ".join(member_mentions)) > EMBED_FIELD_VALUE_LIMIT:
            while len(", ".join(member_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_str) + 1):
                member_mentions.pop()
                extra_members += 1
        extra_str = extra_str.format(extra_members)
        members_value = (
                ", ".join(member_mentions) + (extra_str if extra_members else "")
        ) if member_count > 0 else "None"

        color_url = f"http://www.colourlovers.com/img/{re.sub(r'^#', '', str(role.color))}/100/100"

        all_but_admin = discord.Permissions.all()
        all_but_admin.administrator = False
        permissions_val = "All (Administrator)" if role.permissions.administrator else (
            "All but Administrator" if role.permissions == all_but_admin else role.permissions.value
        )
        embed = discord.Embed(description=desc) \
            .add_field(name="Display Color (sidebar)", value=str(role.color if role.color.value != 0 else "Default")) \
            .add_field(name="Permissions (see +perms)", value=permissions_val) \
            .add_field(name="Position", value=role.position) \
            .add_field(name="Mentionable?", value="Yes" if role.mentionable else "No") \
            .add_field(name="Displayed separately?", value="Yes" if role.hoist else "No") \
            .add_field(name="Managed by a bot/app?", value="Yes" if role.managed else "No") \
            .add_field(name=f"Members ({member_count})", value=members_value, inline=True) \
            .set_footer(text=f"Role ID: {role.id}")

        if role.color.value != 0:
            embed.colour = role.color
            embed.set_author(name=f"Info for role {discord_sanitize(role.name)}", icon_url=color_url)
        else:
            embed.set_author(name=f"Info for role {discord_sanitize(role.name)}")

        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @sguild_only()
    @info.command(name='server', aliases=['guild'], description="View info about the current server.")
    async def info_server(self, ctx: SContext):
        guild = ctx.guild
        oldest_channel: discord.TextChannel = cast(discord.TextChannel, None)
        for chan in guild.text_channels:
            channel: discord.TextChannel = chan
            if oldest_channel is None or channel.created_at < oldest_channel.created_at:
                oldest_channel = channel

        created_at = guild.created_at
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(
            formatted_created_at,
            humanize_delta(datetime.datetime.utcnow() - created_at, scale=True)
        )

        online_members: List[discord.Member] = list(filter(
            lambda x: str(cast(discord.Member, x).status) not in ("offline", "invisible"), guild.members
        ))
        total_members = guild.members
        members_val = f"{len(online_members)} online, {guild.member_count} total"
        verifications = ["none", "low", "medium", "high", "extreme"]
        verif_val = "{0} ({1}/{2})".format(
            str(guild.verification_level).title(), verifications.index(str(guild.verification_level)),
            len(verifications) - 1
        )

        embed = discord.Embed(title=discord_sanitize(guild.name), description=desc) \
            .add_field(
                name="Owner",
                value=f"{cast(discord.Member, guild.owner).mention}\n({discord_sanitize(str(guild.owner))})"
            )                                                                                                   \
            .add_field(name="Oldest Channel", value=f"{oldest_channel.mention}")                                \
            .add_field(name="Member Amount", value=members_val)                                                 \
            .add_field(name="Channel Amount", value=len(guild.channels))                                        \
            .add_field(name="Role Amount", value=len(guild.roles))                                              \
            .add_field(name="Emoji Amount", value=f"{len(guild.emojis)}/{guild.emoji_limit}")                   \
            .add_field(name="VC Region", value=f"{humanize_voice_region(guild.region)}")                        \
            .add_field(name="Verification Level", value=verif_val)                                              \
            .set_footer(text=f"Server ID: {guild.id} | Owner ID: {guild.owner_id}")

        if guild.features:
            embed.add_field(
                name="Features", value=humanize_list(humanize_discord_syntax(guild.features)), inline=False
            )

        if guild.icon:
            embed.set_thumbnail(url=guild.icon_url)

        return await ctx.send(embed=embed, deletable=True)


def setup(bot: commands.bot):
    bot.add_cog(Information(bot))
