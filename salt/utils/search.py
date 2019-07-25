import discord
import re
from typing import Iterable, TypeVar, Optional, List, Tuple, Callable, Pattern, Match
from utils import caseless_contains
from constants.regex import ANY_MENTION, ID_MATCH

T = TypeVar("T")


def match_id(
        text: str, *, mention_regex: Optional[Pattern[str]] = re.compile(ANY_MENTION)
) -> Optional[int]:
    match: Match[str] = re.match(ID_MATCH, text) or re.match(mention_regex, text)
    if match:
        return int(match.group(1))


def search_in_group(
        text: str, group: Iterable[T], *attrs, **operation: Callable[[str, str], bool]
) -> Tuple[T]:
    """
    Search an element in a group of same type elements.

    :param text: The text to search.
    :param group: The group to search in.
    :param attrs: All attributes to compare. (e.g. "nick" and "name")
    :param operation: The comparison function to execute between two strings. Default: caseless_contains
    :return: The found elements in the group, if any.
    :raises: TypeError: If missing attributes.
    """
    if len(attrs) < 1:
        raise TypeError("Missing attributes.")

    operation_to_use: Callable[[str, str], bool] = operation.pop("operation", caseless_contains)
    found: List[T] = []
    for el in group:
        for attr in attrs:
            val: str = getattr(el, attr)
            if operation_to_use(val, text):
                found.append(el)
                break
    return tuple(found)

