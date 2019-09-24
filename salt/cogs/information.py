import re
import discord
import datetime
from essentials.sender import PaginateOptions
from discord.ext import commands
from discord.ext.commands.converter import _get_from_guilds
from dateutil.relativedelta import relativedelta
from utils.funcs import (
    humanize_delta, humanize_list, humanize_voice_region, humanize_discord_syntax, discord_sanitize,
    pagify_list, i_pagify_list, normalize_caseless
)
from utils.advanced import sguild_only, require_salt_permission
from classes import (
    scommand, sgroup, SContext, AmbiguityUserOrMemberConverter, AmbiguityRoleConverter, CONVERT_FAILED,
    GetSContextAttr, AmbiguityChannelConverter, AmbiguityMemberConverter, PositiveIntConverter
)
from constants import (
    DATETIME_DEFAULT_FORMAT, PAIR_STATUS_EMOJI, EMBED_FIELD_VALUE_LIMIT,
    INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, INFO_TEXT_THUMB_URL, INFO_TEXT_NSFW_THUMB_URL,
    INFO_VOICE_THUMB_URL, INFO_CATEGORY_THUMB_URL
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
    @require_salt_permission("info user", default=True)  # v User or member. Defaults to author
    @info.command(
        name="user", description="View info about an user, or, if not specified, yourself.",
        example=(
            "{p}info user\n"
            "{p}info user Member"
        )
    )
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
    @info.command(name='role', description='View info about a role.', example="{p}info role My Role")
    async def info_role(self, ctx: SContext, *, role_name: AmbiguityRoleConverter):
        role: discord.Role = cast(discord.Role, role_name)  # Typing purposes

        created_at = role.created_at  # When was the role created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"  # Formatted for humans
        desc = "Created at {0}\n({1} ago)".format(  # Description value
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)
        )

        members = role.members                          # List of members in this role
        members.sort(key=lambda m: m.display_name)   # Sort by name/nickname
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
    @info.command(
        name='server', aliases=['guild'], description="View info about the current server.",
        example="{p}info server"
    )
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
        members_val = f"{len(online_members)} online, {total_members} total"  # X Online / Y Total

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
    @info.command(name='bot', aliases=['stats'], description="View info about the bot.", example="{p}info bot")
    async def info_bot(self, ctx: SContext):
        bot = ctx.bot
        me = bot.user
        created_at = me.created_at  # When I was created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(  # format it in our embed desc
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)  # human-friendly diff.
        )

        uptime_delta = relativedelta(datetime.datetime.utcnow(), bot.uptime)
        h_uptime_delta = humanize_delta(uptime_delta, scale=True)

        text_voice_chans = map(lambda g: (len(g.text_channels), len(g.voice_channels)), bot.guilds)
        text_chans_z, voice_chans_z = zip(*text_voice_chans)
        text_chans = sum(text_chans_z)
        voice_chans = sum(voice_chans_z)
        chans = text_chans + voice_chans

        embed = (discord.Embed(description=desc)
                        .set_author(name=f"About me, {bot.user}", url=me.avatar_url, icon_url=me.avatar_url)
                        .set_thumbnail(url=me.avatar_url)
                        .add_field(name="Developers", value=bot.config['devs'], inline=False)
                        .add_field(name="With help from", value=bot.config['help_from'], inline=False)
                        .add_field(name="Uptime", value=h_uptime_delta)
                        .add_field(name="Programmed in", value="Python (3.8)")
                        .add_field(name='Library', value="discord.py")
                        .add_field(name="Servers", value=len(bot.guilds))
                        .add_field(name="Users", value=len(bot.users))
                        .add_field(name="Total Channels", value=chans)
                        .add_field(name="Text Channels", value=text_chans)
                        .add_field(name="Voice Channels", value=voice_chans)
                        .set_footer(text=f"Click the title for avatar URL | My ID: {me.id} | Happy to be alive! ^-^"))

        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info channel", default=True)
    @info.command(
        name='channel', aliases=['textchannel', 'text'], description="View info about a text channel.",
        example=(
            "{p}info channel\n"
            "{p}info channel #text-channel"
        )
    )
    async def info_channel(
        self, ctx: SContext,
        channel: AmbiguityChannelConverter(channel_types=["text"]) = GetSContextAttr("channel")
    ):
        channel: discord.TextChannel = channel.get_from_context(ctx) if isinstance(channel, GetSContextAttr) \
            else channel

        created_at = channel.created_at  # When channel was created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(  # format it in our embed desc
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)  # human-friendly diff.
        )

        is_nsfw = channel.is_nsfw()
        thumb = INFO_TEXT_NSFW_THUMB_URL if is_nsfw else INFO_TEXT_THUMB_URL
        title = f"Info about Text Channel #{channel.name}{' (NSFW)' if is_nsfw else ''}"
        ctg = discord_sanitize(channel.category.name) if channel.category else "None"

        webhooks = len(await channel.webhooks()) if channel.permissions_for(ctx.me).manage_webhooks \
            else "(I cannot view)"

        members = channel.members  # List of members who can view this channel
        members.sort(key=lambda m: m.display_name)  # Sort by name/nickname
        member_count = len(members)
        member_mentions = [member.mention for member in members]  # @pal's
        extra_members: int = 0  # Amount of members we can't display cuz val too big
        extra_str = "...(+{})"  # <- but formatted
        is_all_members = member_count == ctx.guild.member_count                   # v If we trespassed field val limit:
        if not is_all_members and len(", ".join(member_mentions)) > EMBED_FIELD_VALUE_LIMIT:
            while len(", ".join(member_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_str) + 1):  # (Gotta fit '...')
                member_mentions.pop()  # Let's keep removing members from list until it fits
                extra_members += 1  # But also display how many we removed

        extra_str = extra_str.format(extra_members)
        members_title = f"Members who can read this channel ({member_count})"
        members_value = "All members" if is_all_members else (  # Final field value.
            ", ".join(member_mentions) + (extra_str if extra_members else "")
        ) if member_count > 0 else "None"

        slowmode = humanize_delta(relativedelta(seconds=channel.slowmode_delay)) if channel.slowmode_delay else "None"

        embed = (discord.Embed(description=desc)
                        .set_author(name=title, icon_url=thumb)
                        .set_thumbnail(url=thumb)
                        .add_field(name="Relative Position", value=str(channel.position))
                        .add_field(name="Permission Overwrites", value=str(len(channel.overwrites)))
                        .add_field(name="Category", value=ctg)
                        .add_field(name="Slowmode", value=slowmode)
                        .add_field(name="Webhook Amount", value=str(webhooks))
                        .add_field(name="Topic", value=discord_sanitize(str(channel.topic)) or "None")
                        .add_field(name=members_title, value=members_value, inline=False)
                        .set_footer(text=f"Channel ID: {channel.id}")
                 )

        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info channel", default=True)
    @info.command(
        name='voicechannel', aliases=['voice'], description="View info about a voice channel.",
        example="{p}info voicechannel Music"
    )
    async def info_voicechannel(
            self, ctx: SContext,
            channel: AmbiguityChannelConverter(channel_types=["voice"])
    ):
        channel: discord.VoiceChannel = channel

        created_at = channel.created_at  # When channel was created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(  # format it in our embed desc
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)  # human-friendly diff.
        )

        thumb = INFO_VOICE_THUMB_URL
        title = f'Info about Voice Channel "{channel.name}"'
        ctg = discord_sanitize(channel.category.name) if channel.category else "None"

        members = channel.members  # List of members who are connected to this channel
        members.sort(key=lambda m: m.display_name)  # Sort by name/nickname
        member_count = len(members)
        member_mentions = [member.mention for member in members]  # @pal's
        extra_members: int = 0  # Amount of members we can't display cuz val too big
        extra_str = "...(+{})"  # <- but formatted
        is_all_members = member_count == ctx.guild.member_count  # v If we trespassed field val limit:
        if not is_all_members and len(", ".join(member_mentions)) > EMBED_FIELD_VALUE_LIMIT:
            while len(", ".join(member_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_str) + 1):  # (Gotta fit '...')
                member_mentions.pop()  # Let's keep removing members from list until it fits
                extra_members += 1  # But also display how many we removed

        extra_str = extra_str.format(extra_members)
        members_title = f"Members Connected ({member_count})"
        members_value = "All members" if is_all_members else (  # Final field value.
                ", ".join(member_mentions) + (extra_str if extra_members else "")
        ) if member_count > 0 else "None"

        bitrate = f"{channel.bitrate // 1000} kbps" if channel.bitrate > 1000 else f"{channel.bitrate} bps"
        user_limit = channel.user_limit

        embed = (discord.Embed(description=desc)
                 .set_author(name=title, icon_url=thumb)
                 .set_thumbnail(url=thumb)
                 .add_field(name="Relative Position", value=str(channel.position))
                 .add_field(name="Permission Overwrites", value=str(len(channel.overwrites)))
                 .add_field(name="Category", value=ctg)
                 .add_field(name="Bitrate", value=bitrate)
                 .add_field(name="User Limit", value=user_limit or "Unlimited")
                 .add_field(name="Is full", value="Yes" if user_limit and member_count >= user_limit else "No")
                 .add_field(name=members_title, value=members_value, inline=False)
                 .set_footer(text=f"Channel ID: {channel.id}")
                 )

        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info channel", default=True)
    @info.command(
        name='category', aliases=['ctg', 'categorychannel'], description="View info about a category.",
        example="{p}info category Channels"
    )
    async def info_category(
            self, ctx: SContext,
            category: AmbiguityChannelConverter(channel_types=["category"]) = None
    ):
        ctg: discord.CategoryChannel = category
        if not ctg:
            ctg = cast(discord.TextChannel, ctx.channel).category
            if not ctg:
                await ctx.send("This channel is not in any category, so please specify one!")
                return

        created_at = ctg.created_at  # When channel was created, in UTC
        formatted_created_at = created_at.strftime(DATETIME_DEFAULT_FORMAT) + " UTC"
        desc = "Created at {0}\n({1} ago)".format(  # format it in our embed desc
            formatted_created_at,
            humanize_delta(relativedelta(datetime.datetime.utcnow(), created_at), scale=True)  # human-friendly diff.
        )

        thumb = INFO_CATEGORY_THUMB_URL
        title = f'Info about Category "{ctg.name}"{" (NSFW)" if ctg.is_nsfw() else ""}'

        t_channels_in = ctg.text_channels  # List of channels in this category
        t_channels_in.sort(key=lambda m: m.name)  # Sort by name/nickname
        t_channel_count = len(t_channels_in)
        t_chan_mentions = [channel_in.mention for channel_in in t_channels_in]  # @pal's
        extra_t_channels: int = 0  # Amount of members we can't display cuz val too big
        extra_t_str = "...(+{})"  # <- but formatted
        is_all_t_channels = t_channel_count == len(ctx.guild.text_channels)  # v If we trespassed field val limit:
        if not is_all_t_channels and len(", ".join(t_chan_mentions)) > EMBED_FIELD_VALUE_LIMIT:
            while len(", ".join(t_chan_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_t_str) + 1):
                t_chan_mentions.pop()  # Let's keep removing members from list until it fits    # ^ (Gotta fit '...')
                extra_t_channels += 1  # But also display how many we removed

        extra_t_str = extra_t_str.format(extra_t_channels)
        t_channels_title = f"Text Channels Within ({t_channel_count})"
        t_channels_value = "All text channels" if is_all_t_channels else (  # Final field value.
                ", ".join(t_chan_mentions) + (extra_t_str if extra_t_channels else "")
        ) if t_channel_count > 0 else "None"

        v_channels_in = ctg.voice_channels  # List of channels in this category
        v_channels_in.sort(key=lambda m: m.name)  # Sort by name/nickname
        v_channel_count = len(v_channels_in)
        v_chan_mentions = [channel_in.mention for channel_in in v_channels_in]  # @pal's
        extra_v_channels: int = 0  # Amount of members we can't display cuz val too big
        extra_t_str = "...(+{})"  # <- but formatted
        is_all_v_channels = v_channel_count == len(ctx.guild.voice_channels)  # v If we trespassed field val limit:
        if not is_all_v_channels and len(", ".join(v_chan_mentions)) > EMBED_FIELD_VALUE_LIMIT:
            while len(", ".join(v_chan_mentions)) > (EMBED_FIELD_VALUE_LIMIT + len(extra_t_str) + 1):
                v_chan_mentions.pop()  # Let's keep removing members from list until it fits    # ^ (Gotta fit '...')
                extra_v_channels += 1  # But also display how many we removed

        extra_t_str = extra_t_str.format(extra_v_channels)
        v_channels_title = f"Voice Channels Within ({v_channel_count})"
        v_channels_value = "All voice channels" if is_all_v_channels else (  # Final field value.
                ", ".join(v_chan_mentions) + (extra_t_str if extra_v_channels else "")
        ) if v_channel_count > 0 else "None"

        embed = (discord.Embed(description=desc)
                 .set_author(name=title, icon_url=thumb)
                 .set_thumbnail(url=thumb)
                 .add_field(name="Position", value=str(ctg.position))
                 .add_field(name="Permission Overwrites", value=str(len(ctg.overwrites)))
                 .add_field(name=t_channels_title, value=t_channels_value, inline=False)
                 .add_field(name=v_channels_title, value=v_channels_value, inline=False)
                 .set_footer(text=f"Category ID: {ctg.id}")
                 )

        await ctx.send(embed=embed, deletable=True)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info roles", default=True)
    @info.command(
        name='roles',
        description="View the list of roles in the server or, if specified, of a member. Note that specifying \
a number under 1000 after `info roles` indicates the page you are seeing (otherwise it searches for member). \
See examples for reference - first example is all roles in server; second example is page 2 of that; third example \
lists roles that Member has; and fourth example shows the 3rd page of that Member's role list.",
        example=(
            "{p}info roles\n"
            "{p}info roles 2\n"
            "{p}info roles Member\n"
            "{p}info roles Member 3"
        )
    )
    async def info_roles(
        self, ctx: SContext,
        member: Optional[str] = None,
        page: PositiveIntConverter = None
    ):
        if member and not page:
            if member.isnumeric() and len(member) <= 3:
                page: int = int(cast(str, member))
                member = cast(discord.Member, None)
            else:
                member: discord.Member = await AmbiguityMemberConverter().convert(ctx, member)
                page = 1
        elif not member:
            page = 1

        roles: List[discord.Role] = list(sorted(
            cast(discord.Member, member).roles if member else ctx.guild.roles, key=lambda r: r.position,
            reverse=True
        ))
        roles = roles[:-1]  # exclude @everyone role
        if not roles:
            await ctx.send(f"{'That member' if member else 'The server'} has no roles (other than the default)!")
            return

        ii = 0
        pages = pagify_list(
            [
                f"**`{r.position}.`\
{' Highest:' if (ii := ii + 1) == 1 else (' Lowest:' if ii == len(roles) else '')}** {r.mention} (ID: {r.id})"
                for r in roles
            ]
        )
        p_amnt = len(pages)

        if page > p_amnt:
            await ctx.send(f"Invalid page! Minimum is 1 and maximum is {p_amnt}.")

        origin_title = (f"{member}'s" if member else "All") + f" Roles"
        title = f"{origin_title}{f' (Page {page}/{p_amnt})' if p_amnt > 1 else ''}"
        embed = discord.Embed(title=title, description="\n".join(pages[page - 1]))

        if p_amnt > 1:
            embed.set_footer(text=f"To change pages, you can use {ctx.prefix}info roles <?> <page here>.")

        async def update_page(pag: PaginateOptions, msg: discord.Message, _e, _c, _r):
            if (curr_page := pag.current_page) <= p_amnt:
                embed.description = "\n".join(pages[curr_page - 1])
                embed.title = f"{origin_title} (Page {curr_page}/{p_amnt})"

                await msg.edit(embed=embed)

        p_options = PaginateOptions(
            update_page, page, max_page=p_amnt
        )

        await ctx.send(f"{origin_title} ({len(roles)})", embed=embed, paginate=p_options)

    @commands.cooldown(INFO_DEFAULT_COOLDOWN_PER, INFO_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("info members", default=True)
    @info.command(
        name='members',
        description="View the list of members in the server or, if specified, of a role. Note that specifying \
a number under 1000 after `info members` indicates the page you are seeing (otherwise it searches for role). \
See examples for reference - first example is all members in server; second example is page 2 of that; third example \
lists members that Role has; and fourth example shows the 3rd page of that Role's member list.",
        example=(
            "{p}info members\n"
            "{p}info members 2\n"
            "{p}info members Role\n"
            "{p}info members Role 3"
        )
    )
    async def info_members(
        self, ctx: SContext,
        role: Optional[str] = None,
        page: PositiveIntConverter = None
    ):
        if role and not page:
            if role.isnumeric() and len(role) <= 3:
                page: int = int(cast(str, role))
                role = cast(discord.Member, None)
            else:
                role: discord.Member = await AmbiguityRoleConverter().convert(ctx, role)
                page = 1
        elif not role:
            page = 1

        def key_sort(member: discord.Member):
            memb_hoisted = list(reversed([r for r in member.roles if r.hoist or r.position == 0]))
            online_sort = 1 if str(member.status) == "offline" else 0
            position_rev_sort = (len(ctx.guild.roles) - memb_hoisted[0].position) if not role and not online_sort else 0
            name_sort = normalize_caseless(member.display_name)

            return online_sort, position_rev_sort, name_sort

        members: List[discord.Member] = list(sorted(
            cast(discord.Role, role).members if role else ctx.guild.members,
            key=key_sort,
            reverse=False
        ))
        if not members:
            await ctx.send(f"{'That role' if role else 'The server'} has no members!")
            return

        ii = 0
        pages = pagify_list(
            [
                f"• {m.mention} (ID: {m.id})"
                for m in members
            ]
        )
        p_amnt = len(pages)

        if page > p_amnt:
            await ctx.send(f"Invalid page! Minimum is 1 and maximum is {p_amnt}.")

        origin_title = (f"{role}'s" if role else "All") + f" Members"
        title = f"{origin_title}{f' (Page {page}/{p_amnt})' if p_amnt > 1 else ''}"
        embed = discord.Embed(title=title, description="\n".join(pages[page - 1]))

        if p_amnt > 1:
            embed.set_footer(text=f"To change pages, you can use {ctx.prefix}info members <?> <page here>.")

        async def update_page(pag: PaginateOptions, msg: discord.Message, _e, _c, _r):
            if (curr_page := pag.current_page) <= p_amnt:
                embed.description = "\n".join(pages[curr_page - 1])
                embed.title = f"{origin_title} (Page {curr_page}/{p_amnt})"

                await msg.edit(embed=embed)

        p_options = PaginateOptions(
            update_page, page, max_page=p_amnt
        )

        await ctx.send(f"{origin_title} ({len(members)})", embed=embed, paginate=p_options)


def setup(bot: commands.bot):
    bot.add_cog(Information(bot))
