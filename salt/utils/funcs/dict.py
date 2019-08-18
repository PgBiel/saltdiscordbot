from typing import TypeVar
T = TypeVar("T", dict, dict)
L = TypeVar("L", dict, dict)


def clean_none_values(dicti: T) -> T:
    """
    Remove None values from a dictionary.

    :param dicti: Dictionary to modify.
    :return: Modified dictionary.
    """
    new_dict = type(dicti)()
    for k in dicti:
        if (v := dicti[k]) is not None:
            new_dict[k] = v
    return new_dict


def clean_falsy_values(dicti: T) -> T:
    """
    Remove falsy values from a dictionary.

    :param dicti: Dictionary to modify.
    :return: Modified dictionary.
    """
    new_dict = type(dicti)()
    for k in dicti:
        if v := dicti[k]:
            new_dict[k] = v
    return new_dict


def dict_except(dicti: L, *keys: str) -> L:
    """
    Have a dict except some keys.

    :param dicti: Dict to modify.
    :param keys: Keys to not include.
    :return: The modified dict.
    """
    return {k: v for k, v in dicti.items() if k not in keys}
