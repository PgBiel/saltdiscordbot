from copy import deepcopy
import dataclasses as dc
import attr
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

    def __repr__(self) -> str:
        return "PARTIAL_MISSING"

    def __bool__(self) -> bool:
        return False


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


def as_dict(self: Any) -> dict:
    """
    Get a dict representation of a dataclass or attr class INSTANCE.

    :param self: The dataclass or attr class instance.
    :return: The dict.
    """
    formed_dict: dict = dict()
    try:
        formed_dict = dc.asdict(self)
    except TypeError:
        formed_dict = attr.asdict(self)

    if not formed_dict:
        return formed_dict

    new_dict = {  # Filter out PARTIAL_MISSING
        k: v for k, v in formed_dict.items() if v is not PARTIAL_MISSING and not isinstance(v, _PartialMissingType)
    }

    return new_dict


ACls = TypeVar("ACls", type, type)


def make_partial_attrs_class(cls: ACls, **kwargs) -> ACls:
    """
    Make a partial 'attr' class.

    :param cls: The class.
    :param kwargs: Any options to pass into make_class.
    :return: The Partial class.
    """
    attrs: tuple = cls.__attrs_attrs__
    field_dict = dict()
    for att in attrs:
        slots = att.__slots__
        params_dict = {}
        for slot in slots:
            params_dict[slot] = getattr(att, slot)
        params_dict['default'] = PARTIAL_MISSING
        field_dict[att.name] = attr.ib(**params_dict)

    return attr.make_class(
        f'Partial{cls.__name__}', attrs=field_dict, bases=cls.__bases__,
        **kwargs
    )
