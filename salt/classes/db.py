from typing import (
    Generic, Type, TypeVar, List, Tuple, Optional, Dict, TypedDict, Sequence, Union, Any,
    overload
)
from dataclasses import dataclass, field

C = TypeVar("C")
D = TypeVar("D")
E = TypeVar("E")
F = TypeVar("F")
G = TypeVar("G", dict, dict)


class Field(Generic[C, F]):
    """
    Any field in the Database.

    :param typeof: The type of the field.
    :param parent: (Optional) If this type is contained within any sort of container, this will be the container.(E.g.:\
        list in a ListField)
    """
    def __init__(self, typeof: Type[C], default_val: Optional[C] = None, *, parent: Optional[Type[F]] = None):
        self.typeof = typeof
        self.parent = parent
        self.default_val = default_val


class ListField(Field[List[D]]):
    """
    Any list-based field in the Database. (Sets `parent` to list)
    """
    def __init__(self, typeof: Type[D], default_val: Optional[List[D]] = None):
        super().__init__(typeof, parent=list, default_val=default_val or [])


# class TupleField(Field[Tuple[E]]):  # not supported by mongo
#     """
#     Any tuple-based field in the Database
#     """
#     def __init__(self, typeof: Type[E], default_val: Optional[Tuple[D]] = None):
#         super().__init__(typeof, parent=tuple, default_val=default_val or [])


class DBModel(dict, Generic[G]):
    """
    Any model of collection.
    Used to shape objects to make sure we are consistent when writing to database.
    """

    @overload
    def __init__(self, field_dict: G):
        pass

    @overload
    def __init__(self, **fields):
        pass

    def __init__(self, field_dict: Optional[G], **fields):
        super().__init__()
        self.fields = self.fields or {}
        self.load_fields(**(field_dict or fields))

    @overload
    def load_fields(self, field_dict: G):
        pass

    @overload
    def load_fields(self, **fields):
        pass

    def load_fields(self, field_dict: Optional[G], **fields):
        for (field, f_obj) in self._fields:
            val = (field_dict or fields).pop(field, f_obj.default_val)
            self[field] = val


@dataclass
class ModsDict:
    guild_id: str = field(default="")
    moderator: List[str] = field(default_factory=list)
    administrator: List[str] = field(default_factory=list)


class ModsModel(DBModel[ModsDict]):
    """
    Mods collection in the Salt db.
    Documents have the following type:

    {
       "guild_id": str,

       "moderator": List[str],

       "administrator": List[str]
    }
    """
    _fields = {
        "guild_id": Field(str, ""),          # guild's id
        "moderator": ListField(str, []),     # list of saltmod roles' ids
        "administrator": ListField(str, [])  # list of saltadmin roles' ids
    }


class MutesDict(TypedDict):
    guild_id: str
    mute_role_id: str


class MutesModel(DBModel):
    """
    Mutes collection in the Salt db, just stores the mute role id.
    Structure:

    {
        "guild_id": str,

        "mute_role_id": str
    }
    """
    _fields = {
        "guild_id": Field(str, ""),
        "mute_role_id": Field(str, None)
    }

