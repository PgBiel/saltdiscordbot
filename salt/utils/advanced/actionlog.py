import typing
import datetime
import discord
from discord.ext import commands
from typing import Optional, Union, Dict, Any
from essentials import send
from constants import PUNISH_COLOR_MAP, DB_PUNISHMENT_TYPES
from utils.funcs import discord_sanitize, humanize_delta, avatar_compress
from dateutil.relativedelta import relativedelta

if typing.TYPE_CHECKING:
    from classes import SContext


async def actionlog(
        ctx: "SContext", punish_type: str, *, target: Union[discord.User, discord.Member], moderator: discord.Member,
        reason: Optional[str] = None, permanent_mute: Optional[bool] = False,
        punished_at: Optional[datetime.datetime] = None, muted_until: Optional[datetime.datetime] = None
):
    """
    Log a moderator action.

    :param ctx: The context.
    :param punish_type: The type. One of "mute", "kick", "ban", "softban", "unmute", "unban"
    :param target: The target user or member.
    :param moderator: The moderator member that punished.
    :param reason: The reason for punishing, or None.
    :param punished_at: Optionally specify when the punishment occurred, in order to achieve maximum precision.
    :param permanent_mute: If this is a mute, whether or not the user is muted permanently.
    :param muted_until: Until when is the user muted.
    :raises TypeError: Invalid punishment type.
    """
    if not ctx.guild:
        return

    act_settings: Dict[str, Any] = await ctx.db['actionlogsettings'].find_one(dict(guild_id=str(ctx.guild.id)))
    if not act_settings:
        return  # Action logs not configured.

    if not act_settings['logs_channel_id'] or not act_settings['logs_on']:
        return  # Logs off or action logs not configured.

    chan_id = int(act_settings['logs_channel_id'])
    log_chan: discord.TextChannel = ctx.guild.get_channel(chan_id)

    now = punished_at or datetime.datetime.utcnow()  # for 'timestamp' property
    punish_type = punish_type.lower()
    if punish_type not in DB_PUNISHMENT_TYPES:
        raise TypeError("[ACTIONLOG] Invalid punishment type.")

    new_case = act_settings['latest_case'] + 1
    await ctx.db['actionlogsettings'].update_one(
        dict(_id=act_settings['_id']),
        {"$set": dict(latest_case=new_case)}  # Update case number to +1 / add 1
    )
    embed = generate_actionlog_embed(
        punish_type=punish_type, target=target, moderator=moderator, punished_at=now, case=new_case, reason=reason,
        muted_until=muted_until, permanent_mute=permanent_mute, thumb_on=True, thumbnail=target.avatar_url
    )

    try:
        msg = await send(ctx, embed=embed, sender=log_chan.send)  # gotta use custom sender :)
    except discord.HTTPException:
        msg = None
    punish_entry = dict(  # cant use model :(
        target_id=str(target.id), guild_id=str(ctx.guild.id), moderator_id=str(moderator.id),
        type=punish_type,
        message_id=str(msg.id) if msg else None, case=new_case, timestamp=str(now.timestamp()),
        channel_id=str(log_chan.id), thumb_on=True, reason=reason,
        muted_until=str(muted_until.timestamp()) if muted_until else None,
        deleted=msg is None, thumbnail=avatar_compress(target.avatar_url)
    )

    await ctx.db['punishments'].insert_one(punish_entry)  # add to DB :)


def generate_actionlog_embed(
        *, punish_type: str, target: Union[discord.Member, discord.User],
        moderator: Union[discord.Member, discord.User],
        punished_at: datetime.datetime, case: int, reason: Optional[str] = None,
        permanent_mute: Optional[bool] = False, muted_until: Optional[datetime.datetime] = None,
        thumb_on: bool = True, thumbnail: Optional[str] = None
) -> discord.Embed:
    """
    Generate an actionlog embed.

    :param punish_type: The type. One of "mute", "kick", "ban", "softban", "unmute", "unban"
    :param target: The target user or member.
    :param moderator: The moderator member that punished.
    :param reason: The reason for punishing, or None.
    :param punished_at: Optionally specify when the punishment occurred, in order to achieve maximum precision.
    :param case: The case number for which this embed is being generated.
    :param thumb_on: Whether or not to use thumbnail, defaults to True.
    :param thumbnail: If thumb_on, then the link to the thumbnail. (In general, the punished user's avatar.)
    :param permanent_mute: If this is a mute, whether or not the user is muted permanently.
    :param muted_until: Until when is the user muted.
    :return: The generated embed.
    """
    sanitized_m = discord_sanitize(str(target))  # sanitized name, avoid markdown loopholes
    verb = punish_type  # verb to use, e.g. "ban {x}"
    alt_verb = verb + "ned" if verb.endswith("ban") else (verb + "d" if verb.endswith("e") else verb + "ed")
    # "banned" vs "muted" vs "kicked"  - past tense

    emb_desc = f"**{sanitized_m}** was {alt_verb}"

    embed = discord.Embed(
        color=PUNISH_COLOR_MAP[punish_type], thumbnail=target.avatar_url, description=emb_desc,
        title=f"Action Log #{case}", timestamp=punished_at
    ) \
        .add_field(name="Author", value=f"{moderator.mention} ({str(moderator)})", inline=True) \
        .set_footer(text=f"Target's ID: {target.id}")

    if "mute" in punish_type and punish_type != "unmute":
        embed.add_field(
            name="Muted For", value="Forever" if permanent_mute else humanize_delta(
                relativedelta(muted_until, punished_at)
            ) or "0 seconds",
            inline=True
        )

    if thumb_on and thumbnail:
        embed.set_thumbnail(url=thumbnail)

    embed.add_field(name="Reason", value=reason or "None", inline=False)

    return embed
