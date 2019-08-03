from typing import (
    Generic, Type, TypeVar, List, Tuple, Optional, Dict, TypedDict, Sequence, Union, Any,
    overload, Callable
)
from utils.funcs import partial_dataclass
from dataclasses import dataclass, field, asdict, fields, make_dataclass


class DBModel:
    """
    A generic DB Model.
    """

    def asdict(self):
        """
        Returns the dict representation of the dataclass.
        :return: Dataclass as dict
        """
        return self.__dict__()

    def __dict__(self):
        return asdict(self)

    def __call__(self, *args, **kwargs):
        return self.__dict__()

    # def change_field(f):
    #     f.default = PARTIAL_MISSING
    #     return (f.name, f.type, f)
    #
    # def p_init(self):
    #     for tfield in fields(self):
    #         if hasattr(self, tfield) and getattr(self, tfield) == PARTIAL_MISSING:
    #             delattr(self, tfield)
    # given_fields = fields(cls)
    # new_cls = make_dataclass(
    #     cls,
    #     [change_field(f) for f in given_fields],
    #     *args,
    #     **kwargs
    # )
    # new_cls.__post_init__ = p_init
    # return new_cls


@dataclass
class ModsModel(DBModel):
    """
    Model for the mods collection of the Salt db. Manages stuff related to moderation permissions.

    Attributes
        guild_id: ID of guild

        moderator: (Optional) List of Saltmod roles configured for that guild (Default: [] or list())

        administrator: (Optional) List of Saltadmin roles configured for that guild (Default: [] or list())
    """
    guild_id: str
    moderator: List[str] = field(default_factory=list)
    administrator: List[str] = field(default_factory=list)


@dataclass
class PartialModsModel(ModsModel):
    """
    PARTIAL Model for the mods collection of the Salt db. Manages stuff related to moderation permissions.

    Attributes
        guild_id: (Optional)ID of guild

        moderator: (Optional) List of Saltmod roles configured for that guild (Default: [] or list())

        administrator: (Optional) List of Saltadmin roles configured for that guild (Default: [] or list())
    """
    guild_id: str = None


@dataclass
class MutesModel(DBModel):
    """
    Model for the mutes collection of the Salt db. Manages mute role.

    Attributes
        guild_id: ID of guild

        mute_role_id: (Optional) ID of guild's mute role (Default: None)
    """
    guild_id: str
    mute_role_id: str = None


@dataclass
class PartialMutesModel(MutesModel):
    """
    PARTIAL model for the mutes collection of the Salt db. Manages mute role.

    Attributes
        guild_id: (Optional) ID of guild

        mute_role_id: (Optional) ID of guild's mute role (Default: None)
    """
    guild_id: str = None
    mute_role_id: str = None


@dataclass
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


@dataclass
class PartialActiveMutesModel(ActiveMutesModel):
    """
    PARTIAL Model for the activemutes collection of the Salt db. Stores currently muted people.
    Attributes
        guild_id: (Optional) ID of guild

        user_id: (Optional) ID of muted user

        timestamp: (Optional) When the mute expires, or None for never (see `permanent`)

        permanent: (Optional) Whether the mute is permanent, defaults to False
    """
    guild_id: str = None
    user_id: str = None
    permanent: bool = False
    # the rest is already optional


@dataclass
class PrefixesModel(DBModel):
    """
    Model for the prefixes collection of the Salt db. Stores per-server prefixes.
    Attributes
        guild_id: ID of guild

        prefix: (Optional) Prefix string
    """
    guild_id: str
    prefix: str = "+"


@dataclass
class PartialPrefixesModel(PrefixesModel):
    """
    PARTIAL Model for the prefixes collection of the Salt db. Stores per-server prefixes.
    Attributes
        guild_id: (Optional) ID of guild

        prefix: (Optional) Prefix string
    """
    guild_id: str = None
