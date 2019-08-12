import typing
import datetime
import discord
from discord.ext import commands
from copy import copy
from typing import Optional, Union, Dict, Any, cast
from essentials import send
from constants import PUNISH_COLOR_MAP, DB_PUNISHMENT_TYPES
from utils.funcs import discord_sanitize, humanize_delta, avatar_compress, avatar_decompress
from dateutil.relativedelta import relativedelta
from classes import PunishmentsModel
if typing.TYPE_CHECKING:
    from classes import SContext

discord.Embed

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
        muted_until=muted_until, permanent_mute=permanent_mute, thumb_on=True, thumbnail=target.avatar_url,
        thumb_is_avatar=False
    )

    try:
        msg = await send(ctx, embed=embed, sender=log_chan.send)  # gotta use custom sender :)
    except discord.HTTPException:
        msg = None
    punish_entry = PunishmentsModel(  # cant use model :(
        target_id=str(target.id), guild_id=str(ctx.guild.id), moderator_id=str(moderator.id),
        type=punish_type,
        message_id=str(msg.id) if msg else None, case=new_case, timestamp=str(now.timestamp()),
        channel_id=str(log_chan.id), thumb_on=True, reason=reason,
        muted_until=str(muted_until.timestamp()) if muted_until else None,
        permanent_mute=permanent_mute,
        deleted=msg is None, thumbnail=avatar_compress(target.avatar_url),
        thumb_is_avatar=True
    )

    await ctx.db['punishments'].insert_one(punish_entry.as_dict())  # add to DB :)


def generate_actionlog_embed(
        *, punish_type: str, target: Union[discord.Member, discord.User],
        moderator: Union[discord.Member, discord.User],
        punished_at: datetime.datetime, case: int, reason: Optional[str] = None,
        permanent_mute: Optional[bool] = False, muted_until: Optional[datetime.datetime] = None,
        thumb_on: bool = True, thumbnail: Optional[str] = None,
        thumb_is_avatar: bool = True
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
    :param thumb_is_avatar: Whether the thumbnail represents a compressed avatar; defaults to True
    :return: The generated embed.
    """
    sanitized_m = discord_sanitize(str(target))  # sanitized name, avoid markdown loopholes
    verb = punish_type  # verb to use, e.g. "ban {x}"
    alt_verb = verb + "ned" if verb.endswith("ban") else (verb + "d" if verb.endswith("e") else verb + "ed")
    # "banned" vs "muted" vs "kicked"  - past tense

    emb_desc = f"**{sanitized_m}** was {alt_verb}"

    thumb_to_use = None if not thumb_on else (
        str(target.avatar_url) if not thumbnail else (
            avatar_decompress(thumbnail, user_id=target.id, size=0, ext="png") if thumb_is_avatar else thumbnail
        )
    )
    embed = discord.Embed(
        color=PUNISH_COLOR_MAP[punish_type], description=emb_desc,
        title=f"Action Log #{case}", timestamp=punished_at
    ) \
        .add_field(name="Author", value=f"{moderator.mention} ({str(moderator)})", inline=True) \
        .set_footer(text=f"Target's ID: {target.id}")

    if thumb_on and thumbnail and thumb_to_use:
        embed.set_thumbnail(url=thumb_to_use)

    if "mute" in punish_type and punish_type != "unmute":
        embed.add_field(
            name="Muted For", value="Forever" if permanent_mute else humanize_delta(
                relativedelta(muted_until, punished_at)
            ) or "0 seconds",
            inline=True
        )

    embed.add_field(name="Reason", value=reason or "None", inline=False)

    return embed


async def generate_actionlog_embed_from_entry(
        ctx: "SContext", entry: Union[dict, PunishmentsModel], *, attempt_to_fetch: bool = False
):
    """|coro|
    Generate an actionlog embed from a database entry.

    :param ctx: The context.
    :param entry: The entry.
    :param attempt_to_fetch: (Optional bool) Whether we should attempt to fetch the embed from the log channel. Default:
        False.
    :return: The embed, or None if there was an invalid user.
    :raises discord.NotFound: If the user was not found.
    """
    found: PunishmentsModel = entry
    if not isinstance(found, PunishmentsModel):
        provide_dict = copy(entry)
        if provide_dict.get('_id', None):
            del provide_dict['_id']
        found = PunishmentsModel(**provide_dict)

    if attempt_to_fetch:
        try:
            if (
                    found.channel_id and (chan := ctx.bot.get_channel(int(found.channel_id)))
                    and found.message_id
                    and (msg := await cast(discord.TextChannel, chan).fetch_message(int(found.message_id)))
                    and msg.embeds and len(msg.embeds) > 0
            ):
                return msg.embeds[0]
        except discord.NotFound:
            pass
    target_id = int(found.target_id)
    moderator_id = int(found.moderator_id)
    number = found.case
    user: Union[discord.User, discord.Member] = cast(discord.User, None)
    mod: Union[discord.User, discord.Member] = cast(discord.User, None)
    if (
        (
            (user := ctx.guild.get_member(target_id) if ctx.guild else None)
            or (user := ctx.bot.get_user(target_id))
            or (user := await ctx.bot.fetch_user(target_id))
        )
        and (
            (mod := ctx.guild.get_member(moderator_id) if ctx.guild else None)
            or (mod := ctx.bot.get_user(moderator_id))
            or (mod := await ctx.bot.fetch_user(moderator_id))
        )
    ):
        return generate_actionlog_embed(
            punish_type=found.type, target=user, moderator=mod,
            punished_at=datetime.datetime.fromtimestamp(float(found.timestamp)), case=number,
            reason=found.reason, permanent_mute=found.permanent_mute,
            muted_until=datetime.datetime.fromtimestamp(
                float(found.muted_until)
            ) if found.muted_until else None,
            thumb_on=found.thumb_on, thumbnail=found.thumbnail, thumb_is_avatar=found.thumb_is_avatar
        )
