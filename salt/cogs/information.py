import re
import discord
import datetime
from discord.ext import commands
from discord.ext.commands.converter import _get_from_guilds
from dateutil.relativedelta import relativedelta
from utils.funcs import humanize_delta, humanize_list, humanize_voice_region, humanize_discord_syntax, discord_sanitize
from utils.advanced import sguild_only, require_salt_permission
from classes import (
    scommand, sgroup, SContext, AmbiguityUserOrMemberConverter, AmbiguityRoleConverter, CONVERT_FAILED,
    GetSContextAttr
)
from constants import (
    DATETIME_DEFAULT_FORMAT, PAIR_STATUS_EMOJI, EMBED_FIELD_VALUE_LIMIT,
    INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE
)
from typing import List, Union, Optional, cast


class Information(commands.Cog):

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("avatar", default=True)
    @scommand(name="avatar", description="Get an user's avatar.")
    async def avatar(
            self, ctx: SContext, *,
            user: AmbiguityUserOrMemberConverter = None
    ):
        user = user or ctx.author
        usr: discord.User = cast(discord.User, user)
        av: str = usr.avatar_url
        tag: str = discord_sanitize(str(usr))
        embed = discord.Embed(timestamp=datetime.datetime.utcnow()) \
            .set_author(name=f"Avatar of user {tag}", url=av, icon_url=av)      \
            .set_image(url=av)                                                  \
            .set_footer(text=f"Click the title for Avatar URL | User ID: {usr.id}")

        await ctx.send(embed=embed, deletable=True)

    @require_salt_permission("info", default=True)
    @sgroup(name="info", description="Provides info about something.")
    async def info(self, ctx: SContext):
        pass

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("avatar", default=True)
    @info.command(name="avatar", description="Get an user's avatar. (Alias for `avatar`)")
    async def info_avatar(self, ctx: SContext, *, user: AmbiguityUserOrMemberConverter = None):
        await ctx.invoke(self.avatar, user=user)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @commands.bot_has_permissions(embed_links=True)
    @require_salt_permission("info user", default=True)
    @info.command(name="user", description="View info about an user.")  # User or member. Defaults to author
    async def info_user(self, ctx: SContext, *, member: AmbiguityUserOrMemberConverter = None):
        memb_or_user = cast(Union[discord.Member, discord.User], member) or ctx.author  # Typing purposes, or default
        is_member = isinstance(memb_or_user, discord.Member) and ctx.guild and ctx.guild.get_member(memb_or_user.id)
        # ^ Check if we're in a guild and checking a member in that guild
        role_color = memb_or_user.colour if is_member else None  # Color of the member's highest role, if any.
        
        created_at = memb_or_user.created_at  # When the member/user joined Discord.
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"  # Format it, + add UTC
        desc = "Joined Discord at {0}\n({1} ago)".format(  # Embed desc, saying when the user joined Discord.
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)
        )

        avatar = memb_or_user.avatar_url  # Get the user's avatar

        status: discord.Status = memb_or_user.status if is_member else None  # Get the user's status, if any.
        embed = discord.Embed(description=desc)                                                                   \
            .set_author(name=f"Info for user {discord_sanitize(str(memb_or_user))}", icon_url=avatar, url=avatar) \
            .set_footer(text=f"Click the title for avatar URL | User ID: {memb_or_user.id}")                      \
            .set_thumbnail(url=avatar)
        # ^Initial embed.

        if is_member:  # If we're handling a member in the current guild (if any):
            if role_color.value != 0:  # If role color isn't the default, let's set sidebar to it.
                embed.color = role_color

            status_emoji = None  # Get the status emoji, which is the online, idle, dnd or offline ball.
            for em in PAIR_STATUS_EMOJI:  # Let's iterate over the possible emojis.
                if em.name == str(status):
                    status_emoji = em
            status_val = f"{str(status).title()}{status_emoji.emoji}" if status_emoji else "None"  # Field val
            # If there's any status, then this should work, otherwise "None"

            activity = memb_or_user.activity  # If member is playing/watching/listening to something
            activity_verb = str(activity.type).replace('ActivityType.', '').title() if activity else None
            if activity_verb == "Listening":  # Listening *to*
                activity_verb += " to"
            activity_val = f"{activity_verb} **{discord_sanitize(activity.name)}**" if activity else None  # Field val

            joined_at = memb_or_user.joined_at  # When the member joined the current guild
            formatted_joined_at = joined_at.strftime(DATETIME_DEFAULT_FORMAT)  # (formatted)

            normal_roles: List[discord.Role] = memb_or_user.roles  # List of roles that the member has (to add at end)
            normal_roles.pop(0)             # remove @everyone role from list, not cool
            normal_roles.reverse()          # reverse to show highest ones first.
            role_count = len(normal_roles)  # Get count of roles
            role_mentions = [role.mention for role in normal_roles]  # <@&role>s
            extra_roles: int = 0  # Amount of roles that exceed the field max char limit.
            extra_str = "...(+{})"  # (We will format this later)
            if len(", ".join(role_mentions)) > EMBED_FIELD_VALUE_LIMIT:  # If we trespassed the field char limit:
                while len(", ".join(role_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_str) + 1):
                    role_mentions.pop()  # Until we're under that limit, we gotta keep removing roles from list.
                    extra_roles += 1     # But dw, we say how many we didn't show. Also, can see all with +info roles MM

            extra_str = extra_str.format(extra_roles)  # Now we format!
            roles_value = (  # Final field value, or "None"
                    ", ".join(role_mentions) + (extra_str if extra_roles else "")
            ) if role_count > 0 else "None"

            nick_val = discord_sanitize((memb_or_user.nick or "None"))  # Value of "Nickname" field

            embed \
                .add_field(name="Status", value=status_val)                                                       \
                .add_field(name="Activity", value=activity_val or "None")                                         \
                .add_field(
                    name="Display Color (sidebar)", value=str(role_color if role_color.value != 0 else "Default")
                )                                                                                                 \
                .add_field(name="Permissions (see +dperms)", value=memb_or_user.guild_permissions.value)          \
                .add_field(name="Server Join (UTC)", value=formatted_joined_at)                                   \
                .add_field(name="Nickname", value=nick_val)                                                       \
                .add_field(
                    name=f"Roles ({role_count})", value=roles_value, inline=False
                )  # our embed is done!

        elif found_member := _get_from_guilds(ctx.bot, "get_member", memb_or_user.id):  # Well, not in this guild, but
            status_emoji = None                                                         # shares a guild with the bot
            for em in PAIR_STATUS_EMOJI:                                                # (So we know their status!)
                if em.name == str(found_member.status):
                    status_emoji = em  # same thing as before

            status_val = f"{str(found_member.status).title()}{status_emoji.emoji}" if status_emoji else "None"

            activity = found_member.activity  # What is the member playing/watching/...
            activity_verb = str(activity.type).replace('ActivityType.', '').title() if activity else None
            if activity_verb == "Listening":  # Listening *to*
                activity_verb += " to"
            activity_val = f"{activity_verb} **{activity.name}**" if activity else None  # Field val

            embed \
                .add_field(name="Status", value=status_val) \
                .add_field(name="Activity", value=activity_val or "None")  # Pretty simple

        # If neither of the 'if's matched, means they did an `info user` for someone that doesn't share guilds with bot.
        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info role", default=True)
    @sguild_only()
    @info.command(name='role', description='View info about a role.')
    async def info_role(self, ctx: SContext, *, role_name: AmbiguityRoleConverter):
        role: discord.Role = cast(discord.Role, role_name)  # Typing purposes

        created_at = role.created_at  # When was the role created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"  # Formatted for humans
        desc = "Created at {0}\n({1} ago)".format(  # Description value
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)
        )

        members = role.members                          # List of members in this role
        sorted(members, key=lambda m: m.display_name)   # Sort by name/nickname
        member_count = len(members)
        member_mentions = [member.mention for member in members]  # @pal's
        extra_members: int = 0  # Amount of members we can't display cuz val too big
        extra_str = "...(+{})"  # <- but formatted
        if len(", ".join(member_mentions)) > EMBED_FIELD_VALUE_LIMIT:  # If we trespassed field val limit:
            while len(", ".join(member_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_str) + 1):  # (Gotta fit '...')
                member_mentions.pop()  # Let's keep removing members from list until it fits
                extra_members += 1     # But also display how many we removed

        extra_str = extra_str.format(extra_members)
        members_value = (  # Final field value.
                ", ".join(member_mentions) + (extra_str if extra_members else "")
        ) if member_count > 0 else "None"

        color_url = f"http://www.colourlovers.com/img/{re.sub(r'^#', '', str(role.color))}/100/100"
        # Used for showing color of role in 'Author' spot icon.

        all_but_admin = discord.Permissions.all()  # Get the Permissions value for when you have all permissions...
        all_but_admin.administrator = False        # ...but Administrator.
        permissions_val = "All (Administrator)" if role.permissions.administrator else (  # Final field value
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
            .set_footer(text=f"Role ID: {role.id}")  # embed done yay

        if role.color.value != 0:       # If the role color isn't the default:
            embed.colour = role.color   # Set sidebar to it.
            embed.set_author(name=f"Info for role {discord_sanitize(role.name)}", icon_url=color_url)
        else:
            embed.set_author(name=f"Info for role {discord_sanitize(role.name)}")

        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info server", default=True)
    @sguild_only()
    @info.command(name='server', aliases=['guild'], description="View info about the current server.")
    async def info_server(self, ctx: SContext):
        guild = ctx.guild  # Get this guild

        oldest_channel: discord.TextChannel = cast(discord.TextChannel, None)  # Get oldest channel.
        for chan in guild.text_channels:  # Iterate over channels and find the oldest.
            channel: discord.TextChannel = chan
            if oldest_channel is None or channel.created_at < oldest_channel.created_at:  # If older: Set "oldest" to it
                oldest_channel = channel

        created_at = guild.created_at  # When guild was created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(  # format it in our embed desc
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)  # human-friendly diff.
        )

        online_members: List[discord.Member] = list(filter(  # Filter members that are not offline
            lambda x: str(cast(discord.Member, x).status) not in ("offline", "invisible"),
            guild.members
        ))
        total_members = guild.member_count   # Also get member amount whether offline or not
        members_val = f"{len(online_members)} online, {guild.member_count} total"  # X Online / Y Total

        verifications = ["none", "low", "medium", "high", "extreme"]  # Different levels of verification.
        verif_val = "{0} ({1}/{2})".format(  # Get the current level, in comparison with how high it can be.
            str(guild.verification_level).title(), verifications.index(str(guild.verification_level)),
            len(verifications) - 1
        )

        embed = discord.Embed(title=discord_sanitize(guild.name), description=desc) \
            .add_field(
                name="Owner",  # Respectable owner of guild
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

        if guild.features:  # If guild has Nitro Boost features or is Partnered or something
            embed.add_field(
                name="Features", value=humanize_list(humanize_discord_syntax(guild.features)), inline=False
            )

        if guild.icon:  # If guild has icon: Let our embed include it
            embed.set_thumbnail(url=guild.icon_url)

        return await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info bot", default=True)
    @info.command(name='bot', aliases=['stats'], description="View info about the bot.")
    async def info_bot(self, ctx: SContext):
        bot = ctx.bot
        me = bot.user
        created_at = me.created_at  # When guild was created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(  # format it in our embed desc
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)  # human-friendly diff.
        )

        uptime_delta = relativedelta(datetime.datetime.utcnow(), bot.uptime)
        h_uptime_delta = humanize_delta(uptime_delta)

        text_chans = sum(map(lambda g: len(g.text_channels), bot.guilds))
        voice_chans = sum(map(lambda g: len(g.voice_channels), bot.guilds))
        chans = text_chans + voice_chans

        embed = discord.Embed(description=desc)                \
            .set_author(name=f"About me, {bot.user}", url=me.avatar_url, icon_url=me.avatar_url) \
            .set_thumbnail(url=me.avatar_url)                                                    \
            .add_field(name="Developers", value=bot.config['devs'], inline=False)                \
            .add_field(name="With help from", value=bot.config['help_from'], inline=False)       \
            .add_field(name="Uptime", value=h_uptime_delta)                                      \
            .add_field(name="Programmed in", value="Python 3.8")                                 \
            .add_field(name='Library', value="discord.py")                                       \
            .add_field(name="Servers", value=len(bot.guilds))                                    \
            .add_field(name="Users", value=len(bot.users))                                       \
            .add_field(name="Total Channels", value=chans)                                       \
            .add_field(name="Text Channels", value=text_chans)                                   \
            .add_field(name="Voice Channels", value=voice_chans)                                 \
            .set_footer(
                text=f"Click the title for avatar URL | My ID: {me.id} | Happy to be alive! ^-^"
            )

        await ctx.send(embed=embed)


def setup(bot: commands.bot):
    bot.add_cog(Information(bot))
