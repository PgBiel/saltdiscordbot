from typing import (
    Generic, Type, TypeVar, List, Tuple, Optional, Dict, TypedDict, Sequence, Union, Any,
    overload, Callable
)
from dataclasses import dataclass, field


@dataclass
class ModsModel:
    """
    Model for the mods collection of the Salt db. Manages stuff related to moderation permissions.

    Attributes
        guild_id: ID of guild

        moderator: List of Saltmod roles configured for that guild (Default: [] or list())

        administrator: List of Saltadmin roles configured for that guild (Default: [] or list())
    """
    guild_id: str
    moderator: List[str] = field(default_factory=list)
    administrator: List[str] = field(default_factory=list)


@dataclass
class MutesModel:
    """
    Model for the mutes collection of the Salt db. Manages mute role.

    Attributes
        guild_id: ID of guild

        mute_role_id: ID of guild's mute role (Default: None)
    """
    guild_id: str
    mute_role_id: str = None


@dataclass
class ActiveMutesModel:
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
