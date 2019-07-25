"""
Operations using strings and/or returning strings.
"""
import unicodedata
from typing import Sequence, Optional


def humanize_perm(perm: str) -> str:
    """
    Humanize a Discord Permission. (e.g.: kick_members becomes Kick Members)

    :param perm: The discord permission, as a string.
    :return: The humanized string.
    """
    new_perm = str.replace("_", " ").replace("guild", "server")
    return new_perm.title()


def humanize_list(target_list: Sequence, *, no_and: bool = False, connector: str = "and") -> str:
    """
    Humanize a list or tuple (e.g.: ["John", "Pepper", "Mint"] becomes "John, Pepper and Mint")

    :param target_list: The list or tuple to humanize.
    :param no_and: [Default=False] If should not add the "and" at the end (and therefore just "John, Pepper, Mint")
    :param connector: [Default='and'] The connector between the last element and its predecessor. ("and" in "A and B")
    :return: The resulting string.
    """
    target_list = [str(el) for el in target_list]
    if len(target_list) < 2 or no_and or connector is None or connector == "":
        return ", ".join(target_list)  # just one element or have no connector "And" or anything at the end
    else:
        return "{0}{1} {2} {3}".format(
            ", ".join(target_list[:-1]), connector or "and",
            "," if len(target_list) > 2 else "", target_list[-1]
        )


def normalize(text: str, *, method: Optional[str] = "NFKD") -> str:
    """
    Normalize possibly unicode text.
    :param text: String to be normalized.
    :param method: Method of normalization (Default: "NFKD").
    :return: Normalized text.
    """
    return unicodedata.normalize(method or "NFKD", text)


def normalize_caseless(text: str) -> str:
    """
    Normalize and convert to caseless (generally lowercase) a possibly unicode string.

    :param text: String to be normalized
    :return: Normalized caseless string.
    """
    return normalize(text.casefold())


def caseless_equal(left: str, right: str) -> bool:
    """
    Do a case-insensitive unicode-supported comparison between two strings.
    :param left: String 1 to compare.
    :param right: String 2 to compare.
    :return: Whether both are equal.
    """
    return normalize_caseless(left) == normalize_caseless(right)
