import discord
import re
from typing import Iterable, TypeVar, Optional, List, Tuple, Callable, Pattern, Match, Union, Sequence, cast
from utils.funcs import caseless_contains
from constants.regex import ANY_MENTION, ID_MATCH, USER_MENTION, ROLE_MENTION, CHANNEL_MENTION, TEST_NAME_AND_DISCRIM

T = TypeVar("T")
G = TypeVar("G")
N = TypeVar("N", discord.User, discord.Member)
ChannelType = Union[
    discord.TextChannel, discord.DMChannel, discord.GroupChannel, discord.VoiceChannel, discord.CategoryChannel
]

# class SearchOpType:
#     pass
#
#
# OP_OR = SearchOpType()
# OP_AND = SearchOpType()


def match_id(
    text: str, *, mention_regex: Optional[Union[Pattern[str], str]] = re.compile(ANY_MENTION)
) -> Optional[int]:
    match: Match[str] = re.match(ID_MATCH, text) or re.match(mention_regex, text)
    if match:
        return int(match.group(1))


def search_id(
    text: str, group: Iterable[G], *, mention_regex: Optional[Union[Pattern[str], str]] = re.compile(ANY_MENTION)
) -> Optional[G]:
    matched_id: int = match_id(text, mention_regex=mention_regex)
    if matched_id:
        return discord.utils.get(group, id=matched_id)


def search_name_and_discrim(
    text: str, group: Iterable[N]
) -> Optional[N]:
    # if len(text) > 5 and text[-5] == '#':  # check if a name and discrim was specified
    if re.match(TEST_NAME_AND_DISCRIM, text):
        # The 5 length is checking to see if #0000 is in the string,
        # as a#0000 has a length of 6, the minimum for a potential
        # discriminator lookup.
        potential_discriminator = text[-4:]

        # do the actual lookup and return if found
        # if it isn't found then we'll do a full name lookup below.
        res = discord.utils.get(
            group,
            name=text[:-5],
            discriminator=potential_discriminator
        )
        return res  # (can be None)


def search_in_group(
    text: str, group: Iterable[T], *attrs, **kwargs: [Callable[[str, str], bool], int]
) -> Tuple[T]:
    """
    Search an element in a group of same type elements.

    :param text: The text to search.
    :param group: The group to search in.
    :param attrs: All attributes to compare. (e.g. "nick" and "name")
    :param operation: The comparison function to execute between two strings. Default: caseless_contains
    :param limit: Max length of the resulting tuple. Default: 12 (to be able to check for >11)
    :return: The found elements in the group, if any.
    :raises: TypeError: If missing attributes.
    """
    if len(attrs) < 1:
        raise TypeError("Missing attributes.")

    operation_to_use: Callable[[str, str], bool] = kwargs.pop("operation", caseless_contains)
    limit: int = kwargs.pop("limit", 12)
    found: List[T] = []
    for el in group:
        for attr in attrs:
            val: str = getattr(el, attr)
            if val and operation_to_use(val, text):
                found.append(el)
                break
        if len(found) >= limit:
            break

    return tuple(found)


M = TypeVar("M", discord.User, discord.Member)


def search_user_or_member(
    text: str, group: Sequence[M], *, operation: Optional[Callable[[str, str], bool]] = caseless_contains,
    limit: int = 12
) -> Tuple[M]:
    searched_id = search_id(text, group, mention_regex=USER_MENTION)
    if searched_id is not None:  # first, we try searching for id
        return tuple([cast(M, searched_id)])

    searched_name_and_discrim = search_name_and_discrim(text, group)
    if searched_name_and_discrim is not None:  # then, for name#discrim
        return tuple([cast(M, searched_name_and_discrim)])

    is_member = isinstance(group[0], discord.Member)  # finally, let's look through every single member.
    attrs_to_compare = ["name"]
    if is_member:
        attrs_to_compare.append("nick")
    return search_in_group(text, group, *attrs_to_compare, operation=operation, limit=limit)


def search_role(
    text: str, group: Iterable[discord.Role], *, operation: Optional[Callable[[str, str], bool]] = caseless_contains,
    limit: int = 12
) -> Tuple[discord.Role]:
    searched_id = search_id(text, group, mention_regex=ROLE_MENTION)
    if searched_id:
        return tuple([searched_id])

    return search_in_group(text, group, "name", operation=operation, limit=limit)


def search_channel(
    text: str, group: Iterable[ChannelType], *, operation: Optional[Callable[[str, str], bool]] = caseless_contains,
    limit: int = 12
) -> Tuple[ChannelType]:
    searched_id = search_id(text, group, mention_regex=CHANNEL_MENTION)
    if searched_id:
        return tuple([searched_id])

    return search_in_group(text, group, "name", operation=operation, limit=limit)
