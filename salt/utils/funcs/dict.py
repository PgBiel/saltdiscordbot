from typing import TypeVar
T = TypeVar("T", dict, dict)


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
