import motor.motor_asyncio
import attr
from typing import (
    Generic, Type, TypeVar, List, Tuple, Optional, Dict, TypedDict, Sequence, Union, Any,
    overload, Callable
)
from utils.funcs import make_partial_attrs_class, PARTIAL_MISSING, as_dict
# from dataclasses import dataclass, field, asdict, fields, make_dataclass


def set_op(data: Any):
    return {"$set": data}


class DBModel:
    """
    A generic DB Model.
    """
    def __attrs_post_init__(self):
        attrs: tuple = self.__attrs_attrs__
        for att in attrs:
            if getattr(self, att.name, None) == PARTIAL_MISSING:
                object.__delattr__(self, att.name)  # Remove PARTIAL_MISSING objects.
                new_attrs = list(attrs)
                new_attrs.pop(new_attrs.index(att))
                setattr(self, "__attrs_attrs__", tuple(new_attrs))

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
    guild_id: str = None


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
class ActionLogSettings(DBModel):
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
class PartialActionLogSettings(ActionLogSettings):
    """
    Model for the `actionlogsettings` collection of the Salt db. Stores per-server action log settings.
    Attributes
        guild_id: ID of guild

        logs_channel_id: (Optional) ID of Logs Channel, or None if unset.

        logs_on: (Optional bool) Whether or not logs are on; default: False.

        latest_case: (Optional) Latest case number (Default=0)
    """
    guild_id: str = PARTIAL_MISSING
    logs_channel_id: Optional[str] = PARTIAL_MISSING
    logs_on: bool = PARTIAL_MISSING
    latest_case: int = PARTIAL_MISSING
