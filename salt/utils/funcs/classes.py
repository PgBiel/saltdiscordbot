from copy import deepcopy
import dataclasses as dc
from typing import TypeVar, Optional, Type, Any

Cls = TypeVar("Cls", Type[Any], Type[Any])

# This type hint is a dirty lie to make autocomplete and static
# analyzers give more useful results. Crazy the stuff you can do
# with python...


def copy_class(cls: Cls, prefix: Optional[str] = "") -> Cls:
    """
    Deep copy a class.

    :param cls: The class to copy.
    :param prefix: (Optional) Prefix to add to the copied class's name.
    :return:
    """
    copy_cls = type(f'{prefix}{cls.__name__}', cls.__bases__, dict(cls.__dict__))
    for name, attr in cls.__dict__.items():
        try:
            hash(attr)
        except TypeError:
            # Assume lack of __hash__ implies mutability. This is NOT
            # a bullet proof assumption but good in many cases.
            setattr(copy_cls, name, deepcopy(attr))
    return copy_cls


class _PartialMissingType:
    pass


PARTIAL_MISSING = _PartialMissingType()


# class PartialDataclass:
#     """
#     A partial dataclass.
#     """
#     def __post_init__(self):
#         for tfield in fields(self):
#             name = tfield.name
#             if (
#                     hasattr(self, name)
#                     and (
#                         getattr(self, tfield.name, PARTIAL_MISSING) is PARTIAL_MISSING
#                         or isinstance(getattr(self, tfield.name, PARTIAL_MISSING), _PartialMissingType)
#                     )
#             ):
#                 delattr(self, name)


def partial_dataclass(cls, *args, **kwargs):
    """
    Makes a partial dataclass, whose attributes are all optional.

    :param cls: Original class. (Must NOT be a Dataclass.)
    :param args: Args to pass to dataclass()
    :param kwargs: Kwargs to pass to dataclass()
    :return: The formed dataclass. (PartialX)
    """
    ncls = copy_class(cls, prefix="Partial")
    # def p_init(self):
    #     PartialDataclass.__post_init__(self)
    #
    # ncls.__post_init__ = p_init
    for k in ncls.__annotations__:
        setattr(ncls, str(k), PARTIAL_MISSING)
    return dc.dataclass(ncls, **kwargs)


def as_dict(d_cls: Type[Any]) -> dict:
    """
    Get a dict representation of a dataclass.

    :param d_cls:
    :return: The dict.
    """
    formed_dict = dc.asdict(d_cls)
    new_dict = dict()
    for k in formed_dict:
        if k is not PARTIAL_MISSING and not isinstance(k, _PartialMissingType):
            new_dict[k] = formed_dict[k]

    return new_dict
