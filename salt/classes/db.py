import motor.motor_asyncio
import attr
from typing import (
    Generic, Type, TypeVar, List, Tuple, Optional, Dict, TypedDict, Sequence, Union, Any,
    overload, Callable
)
from constants import DB_PUNISHMENT_TYPES
from utils.funcs import make_partial_attrs_class, PARTIAL_MISSING, as_dict
# from dataclasses import dataclass, field, asdict, fields, make_dataclass


def set_op(data: Any):
    return {"$set": data}


class DBModel:
    """
    A generic DB Model.
    """
    # def __attrs_post_init__(self):  # this doesn't work.
    #     attrs: tuple = self.__attrs_attrs__
    #     for att in attrs:
    #         if getattr(self, att.name, None) == PARTIAL_MISSING:
    #             object.__delattr__(self, att.name)  # Remove PARTIAL_MISSING objects.
    #             new_attrs = list(attrs)
    #             new_attrs.pop(new_attrs.index(att))
    #             setattr(self, "__attrs_attrs__", tuple(new_attrs))

    def as_dict(self):
        return as_dict(self)


@attr.s(auto_attribs=True, frozen=False)
class ModsModel(DBModel):
    """
    Model for the mods collection of the Salt db. Manages stuff related to moderation permissions.

    Attributes
        guild_id: ID of guild

        moderator: (Optional) List of Saltmod roles configured for that guild (Default: [] or list())

        administrator: (Optional) List of Saltadmin roles configured for that guild (Default: [] or list())
    """
    guild_id: str
    moderator: List[str] = attr.Factory(list)
    administrator: List[str] = attr.Factory(list)


@attr.s(auto_attribs=True, frozen=False)
class PartialModsModel(ModsModel):
    """
    PARTIAL Model for the mods collection of the Salt db. Manages stuff related to moderation permissions.

    Attributes
        guild_id: (Optional)ID of guild

        moderator: (Optional) List of Saltmod roles configured for that guild (Default: [] or list())

        administrator: (Optional) List of Saltadmin roles configured for that guild (Default: [] or list())
    """
    guild_id: str = PARTIAL_MISSING
    moderator: List[str] = PARTIAL_MISSING
    administrator: List[str] = PARTIAL_MISSING


@attr.s(auto_attribs=True, frozen=False)
class MutesModel(DBModel):
    """
    Model for the mutes collection of the Salt db. Manages mute role.

    Attributes
        guild_id: ID of guild

        mute_role_id: (Optional) ID of guild's mute role (Default: None)
    """
    guild_id: str
    mute_role_id: str = None


@attr.s(auto_attribs=True, frozen=False)
class PartialMutesModel(MutesModel):
    """
    PARTIAL model for the mutes collection of the Salt db. Manages mute role.

    Attributes
        guild_id: (Optional) ID of guild

        mute_role_id: (Optional) ID of guild's mute role (Default: None)
    """
    guild_id: str = PARTIAL_MISSING
    mute_role_id: str = PARTIAL_MISSING


@attr.s(auto_attribs=True, frozen=False)
class ActiveMutesModel(DBModel):
    """
    Model for the activemutes collection of the Salt db. Stores currently muted people.
    Attributes
        guild_id: ID of guild

        user_id: ID of muted user

        timestamp: (Optional) When the mute expires, or None for never (see `permanent`)

        permanent: (Optional) Whether the mute is permanent, defaults to False
    """
    guild_id: str
    user_id: str
    timestamp: str = None
    permanent: bool = False


@attr.s(auto_attribs=True, frozen=False)
class PartialActiveMutesModel(ActiveMutesModel):
    """
    PARTIAL Model for the activemutes collection of the Salt db. Stores currently muted people.
    Attributes
        guild_id: (Optional) ID of guild

        user_id: (Optional) ID of muted user

        timestamp: (Optional) When the mute expires, or None for never (see `permanent`)

        permanent: (Optional) Whether the mute is permanent, defaults to False
    """
    guild_id: str = PARTIAL_MISSING
    user_id: str = PARTIAL_MISSING
    timestamp: str = PARTIAL_MISSING
    permanent: bool = PARTIAL_MISSING
    # the rest is already optional


@attr.s(auto_attribs=True, frozen=False)
class PrefixesModel(DBModel):
    """
    Model for the prefixes collection of the Salt db. Stores per-server prefixes.
    Attributes
        guild_id: ID of guild

        prefix: (Optional) Prefix string
    """
    guild_id: str
    prefix: str = "+"


@attr.s(auto_attribs=True, frozen=False)
class PartialPrefixesModel(PrefixesModel):
    """
    PARTIAL Model for the prefixes collection of the Salt db. Stores per-server prefixes.
    Attributes
        guild_id: (Optional) ID of guild

        prefix: (Optional) Prefix string
    """
    guild_id: str = PARTIAL_MISSING
    prefix: str = PARTIAL_MISSING


@attr.s(auto_attribs=True, frozen=False)
class ActionLogSettingsModel(DBModel):
    """
    Model for the `actionlogsettings` collection of the Salt db. Stores per-server action log settings.
    Attributes
        guild_id: ID of guild

        logs_channel_id: (Optional) ID of Logs Channel, or None if unset.

        logs_on: (Optional bool) Whether or not logs are on; default: False.

        latest_case: (Optional) Latest case number (Default=0)
    """
    guild_id: str
    logs_channel_id: Optional[str] = None
    logs_on: bool = False
    latest_case: int = 0


@attr.s(auto_attribs=True, frozen=False)
class PartialActionLogSettingsModel(ActionLogSettingsModel):
    """
    PARTIAL Model for the `actionlogsettings` collection of the Salt db. Stores per-server action log settings.
    Attributes
        guild_id: (Optional) ID of guild

        logs_channel_id: (Optional) ID of Logs Channel, or None if unset.

        logs_on: (Optional bool) Whether or not logs are on; default: False.

        latest_case: (Optional) Latest case number (Default=0)
    """
    guild_id: str = PARTIAL_MISSING
    logs_channel_id: Optional[str] = PARTIAL_MISSING
    logs_on: bool = PARTIAL_MISSING
    latest_case: int = PARTIAL_MISSING


@attr.s(auto_attribs=True, frozen=False)
class PunishmentsModel(DBModel):
    """
    Model for the `punishments` collection of the Salt db. Stores action log cases.

    Attributes
        guild_id: ID of guild the punishment occurred in.

        type: Type of punishment (one of "mute", "remute", "unban", "unmute", "kick", "ban" or "softban")

        target_id: ID of user that suffered the punishment.

        moderator_id: ID of user that executed the punishment.

        case: Case number in that guild.

        timestamp: When this case occurred.

        message_id: (Optional) ID of the message in the case channel, or None if removed.

        channel_id: (Optional) ID of the channel the message is in, or None if removed.

        thumb_on: (Optional bool) Whether the embed thumbnail is on or off; defaults to True (on).

        reason: (Optional) Reason given, or None, for the punishment.

        permanent_mute: (Optional bool) Whether or not this is a permanent mute; defaults to False.

        muted_until: (Optional) Until when is this user muted, as a stringified timestamp float, or None.

        deleted: (Optional bool) If this case was deleted or not. Defaults to False.

        thumbnail: (Optional) Compressed link to user's avatar, or None if none is available.

        thumb_is_avatar: (Optional bool) Whether the thumbnail represents a compressed avatar; defaults to True.
    """
    guild_id: str
    type: str = attr.ib(
        validator=lambda s, *_args, **_kwargs: s in DB_PUNISHMENT_TYPES
    )  # "mute"/"kick"/"ban"/"softban"/"remute"/"warn"/...
    target_id: str
    moderator_id: Optional[str]  # Optional in case it failed
    case: int  # case id
    timestamp: str
    message_id: Optional[str] = None
    channel_id: Optional[str] = None
    thumb_on: bool = True  # Whether the thumbnail is on or off. Defaults to on (True)
    reason: Optional[str] = None
    permanent_mute: bool = False
    muted_until: Optional[str] = None
    deleted: bool = False
    thumbnail: Optional[str] = None  # COMPRESSED AVATAR
    thumb_is_avatar: bool = True


@attr.s(auto_attribs=True, frozen=False)
class PartialPunishmentsModel(DBModel):
    """
    PARTIAL Model for the `punishments` collection of the Salt db. Stores action log cases.

    Attributes
        guild_id: (Optional) ID of guild the punishment occurred in.

        type: (Optional) Type of punishment (one of "mute", "kick", "ban" or "softban")

        target_id: (Optional) ID of user that suffered the punishment.

        moderator_id: (Optional) ID of user that executed the punishment.

        case: (Optional) Case number in that guild.

        timestamp: (Optional) When this case occurred.

        message_id: (Optional) ID of the message in the case channel, or None if removed.

        channel_id: (Optional) ID of the channel the message is in, or None if removed.

        thumb_on: (Optional bool) Whether the embed thumbnail is on or off; defaults to True (on).

        reason: (Optional) Reason given, or None, for the punishment.

        permanent_mute: (Optional bool) Whether or not this is a permanent mute; defaults to False.

        muted_until: (Optional) Until when is this user muted, as a stringified timestamp float, or None.

        deleted: (Optional bool) If this case was deleted or not. Defaults to False.

        thumbnail: (Optional) Compressed link to user's avatar, or None if none is available.

        thumb_is_avatar: (Optional bool) Whether the thumbnail represents a compressed avatar, defaults to True.
    """
    guild_id: str = PARTIAL_MISSING
    type: str = attr.ib(
        default=PARTIAL_MISSING,
        validator=lambda s, *_args, **_kwargs: s == PARTIAL_MISSING or s in DB_PUNISHMENT_TYPES
    )  # "mute"/"kick"/"ban"/"softban"/"warn"/...
    target_id: str = PARTIAL_MISSING
    moderator_id: str = PARTIAL_MISSING
    case: int = PARTIAL_MISSING  # case id
    timestamp: str = PARTIAL_MISSING
    message_id: Optional[str] = PARTIAL_MISSING
    channel_id: Optional[str] = PARTIAL_MISSING
    thumb_on: bool = PARTIAL_MISSING  # Whether the thumbnail is on or off. Defaults to on (True)
    reason: Optional[str] = PARTIAL_MISSING
    permanent_mute: bool = PARTIAL_MISSING
    muted_until: Optional[str] = PARTIAL_MISSING
    deleted: bool = PARTIAL_MISSING
    thumbnail: Optional[str] = PARTIAL_MISSING  # COMPRESSED AVATAR
    thumb_is_avatar: bool = PARTIAL_MISSING


@attr.s(auto_attribs=True)
class WarnsModel(DBModel):
    """
    Model for the `warns` collection of the Salt DB.

    Attributes
        guild_id: Guild where this warn happened in.
        user_id: User warned.
        moderator_id: Author of warn.
        warned_at: When this warn happened.
        case: (Optional int) Case number, if any.
    """
    guild_id: str
    user_id: str
    moderator_id: str
    warned_at: str
    case: Optional[int] = None


@attr.s(auto_attribs=True)
class PartialWarnsModel(DBModel):
    """
    PARTIAL Model for the `warns` collection of the Salt DB.

    Attributes
        guild_id: Guild where this warn happened in.

        user_id: User warned.

        moderator_id: Author of warn.

        case: Case number.

        warned_at: When this warn happened.
    """
    guild_id: str = PARTIAL_MISSING
    user_id: str = PARTIAL_MISSING
    moderator_id: str = PARTIAL_MISSING
    case: int = PARTIAL_MISSING
    warned_at: str = PARTIAL_MISSING


@attr.s(auto_attribs=True)
class WarnLimitsModel(DBModel):
    """
    Model for the `warnlimits` collection of the Salt DB. Regulates each of the warn limits of a server.

    Attributes
        guild_id: ($ index) ID of the guild where this warn limit has effect in.

        amount: Amount of warns at which this warn limit is activated and emits a punishment.

        punishment: The type of punishment emitted by the warn limit.

        mute_time: (Optional str) If mute, the duration of the mute as a compressed delta.

        permanent_mute: (Optional bool) Whether or not this is a permanent mute, defaults to False.
    """
    guild_id: str
    amount: int
    punishment: str = attr.ib(
        validator=lambda s, *_args, **_kwargs: s in DB_PUNISHMENT_TYPES
    )  # "mute"/"kick"/"ban"/"softban"/"remute"/"warn"/...
    mute_time: Optional[str] = None  # COMPRESSED DELTA
    permanent_mute: bool = False


@attr.s(auto_attribs=True)
class PartialWarnLimitsModel(DBModel):
    """
    PARTIAL Model for the `warnlimits` collection of the Salt DB. Regulates each of the warn limits of a server.

    Attributes
        guild_id: ($ index) ID of the guild where this warn limit has effect in.

        amount: Amount of warns at which this warn limit is activated and emits a punishment.

        punishment: The type of punishment emitted by the warn limit.

        mute_time: (Optional str) If mute, the duration of the mute as a compressed delta.

        permanent_mute: (Optional bool) Whether or not this is a permanent mute, defaults to False.
    """
    guild_id: str = PARTIAL_MISSING
    amount: int = PARTIAL_MISSING
    punishment: str = attr.ib(
        default=PARTIAL_MISSING,
        validator=lambda s, *_args, **_kwargs: s == PARTIAL_MISSING or s in DB_PUNISHMENT_TYPES
    )  # "mute"/"kick"/"ban"/"softban"/"warn"/...
    mute_time: Optional[str] = PARTIAL_MISSING  # COMPRESSED DELTA
    permanent_mute: bool = PARTIAL_MISSING


@attr.s(auto_attribs=True)
class WarnExpiresModel(DBModel):
    """
    Model for the `warnexpires` collection of the Salt DB. Stores each server's +warnxepire results.

    Attributes
        guild_id: Guild whose warns are affected by this setting.
        expires: (Optional str) Interval of how much time should the warn expire after.
    """
    guild_id: str
    expires: Optional[str] = None  # COMPRESSED DELTA


@attr.s(auto_attribs=True)
class PartialWarnExpiresModel(DBModel):
    """
    Model for the `warnexpires` collection of the Salt DB. Stores each server's +warnxepire results.

    Attributes
        guild_id: Guild whose warns are affected by this setting.
        expires: (Optional str) Interval of how much time should the warn expire after.
    """
    guild_id: str = PARTIAL_MISSING
    expires: Optional[str] = PARTIAL_MISSING # COMPRESSED DELTA
