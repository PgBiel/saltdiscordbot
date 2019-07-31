"""
Operations using strings and/or returning strings.
"""
import unicodedata
import discord
import datetime
import re
from typing import Sequence, Optional, Union, TYPE_CHECKING, List, Iterable, overload, TypeVar
from utils.funcs import clean_falsy_values, extract_delta
from math import floor
if TYPE_CHECKING:
    from classes import SContext

T = TypeVar("T", Iterable, Iterable)


def humanize_perm(perm: str) -> str:
    """
    Humanize a Discord Permission. (e.g.: kick_members becomes Kick Members)

    :param perm: The discord permission, as a string.
    :return: The humanized string.
    """
    new_perm = perm.replace("_", " ").replace("guild", "server")
    return new_perm.title()


@overload
def humanize_discord_syntax(inputs: str) -> str:
    pass


@overload
def humanize_discord_syntax(inputs: Iterable[str]) -> List[str]:
    pass


def humanize_discord_syntax(inputs: Union[str, Iterable[str]]) -> Union[str, List[str]]:
    """
    Used for humanizing any kind of Discord syntax for things.
    :param inputs: Any input or inputs to humanize.
    :return: The humanized input (if one was given) or list of inputs (if more than one was given).
    """
    fixed = []
    for inp in ([inputs] if type(inputs) == str else list(inputs)):
        split = re.split(r'[_-]+', inp)
        text = ''
        for part in split:
            if text:
                text += " "
            if part in ('vip', 'eu', 'us', 'url'):
                text += part.upper()
            elif part == 'southafrica':
                text += "South Africa"
            else:
                text += part.title()
        fixed.append(text)

    return fixed[0] if type(inputs) == str else fixed


def humanize_voice_region(voice_region: discord.VoiceRegion) -> str:
    """
    Humanize a Voice Region.
    :param voice_region: Voice Region to humanize.
    :return: Humanized Voice Region string.
    """
    return humanize_discord_syntax(str(voice_region))


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
        return "{0}{1} {2}".format(
            ", ".join(target_list[:-1]), f" {connector or 'and'}",
            target_list[-1]
        )


def humanize_delta(
        delta: datetime.timedelta, *, no_and: bool = False, connector: str = "and",
        scale: bool = False,
        **kwargs
) -> str:  # TODO: Support relativedelta
    """
    Humanize a time delta.

    :param delta: The timedelta object.
    :param no_and: (humanize_list param) (bool) Whether should remove the "and" at the end of the string; default=False
    :param connector: (humanize_list param) (str) Connector to be used at the end of the string; default='and'
    :param scale: (bool=False) Whether to automatically choose which measures should be included in the string. If True,
        all the other time measure params (years, months, ...) are ignored.
    :param years: (bool, default=True) Whether to include years in the string.
    :param months: (bool, default=True) Whether to include months in the string.
    :param weeks: (bool, default=True) Whether to include weeks in the string.
    :param days: (bool, default=True) Whether to include days in the string.
    :param hours: (bool, default=True) Whether to include hours in the string.
    :param minutes: (bool, default=True) Whether to include minutes in the string.
    :param seconds: (bool, default=True) Whether to include seconds in the string.
    :return: Humanized delta.
    """
    included: List[str] = []
    extracted = extract_delta(delta)
    if scale:
        if delta.days > 0:
            if not extracted['years'] and not extracted['months'] and extracted['weeks']:
                included.extend(('weeks', 'days'))
            else:
                extracted = extract_delta(delta, ignore_week=True)  # don't want to get an imprecise result
                included.extend(('years', 'months', 'days'))
        elif extracted['hours'] or extracted['minutes']:
            included.extend(('hours', 'minutes'))
        else:
            included.extend(['seconds'])
    list_strs: List[str] = []
    for name in extracted:
        if (scale and name in included) or (not scale and kwargs.pop(name, True)):
            v = extracted[name]
            if v:
                list_strs.append(f"{v} {re.sub(r's$', '', name) if v == 1 else name}")
    return humanize_list(list_strs, no_and=no_and, connector=connector)


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


def normalize_equal(left: str, right: str) -> bool:
    """
    A simple, case-sensitive unicode-supported equality comparison between two strings.

    :param left: String 1 to compare.
    :param right: String 2 to compare.
    :return: Whether both are equal.
    """
    return normalize(left) == normalize(right)


def normalize_contains(container: str, contained: str) -> bool:
    """
    Do a simple, case-sensitive unicode-supported "contains" operation between two strings.

    :param container: The string that could contain the other.
    :param contained: The string that could be contained in the first.
    :return: Whether the container contains the contained.
    """
    return normalize(contained) in normalize(container)


def caseless_equal(left: str, right: str) -> bool:
    """
    Do a case-insensitive unicode-supported equality comparison between two strings.

    :param left: String 1 to compare.
    :param right: String 2 to compare.
    :return: Whether both are equal.
    """
    return normalize_caseless(left) == normalize_caseless(right)


def caseless_contains(container: str, contained: str) -> bool:
    """
    Do a case-insensitive unicode-supported "contains" operation between two strings.

    :param container: The string that could contain the other.
    :param contained: The string that could be contained in the first.
    :return: Whether the container contains the contained.
    """
    return normalize_caseless(contained) in normalize_caseless(container)


def privacy_sanitize(text: str, ctx: "SContext") -> str:
    """
    Remove private info from a string.

    :param text: String to remove private info from.
    :param ctx: The context, in order to determine which private info to remove.
    :return: The sanitized string.
    """
    return text.replace(ctx.bot.config["token"], "[DATA EXPUNGED]")


def tag(
        subject: Union[discord.abc.User, discord.abc.GuildChannel, discord.abc.PrivateChannel, discord.Role]
) -> str:
    """
    Get the appearance of the subject (member/user/channel/role) when shown.
    :param subject: What to show.
    :return: The string form.
    """
    if isinstance(subject, discord.abc.User):
        return "{0}#{1}".format(subject.name, subject.discriminator)
    if isinstance(subject, discord.TextChannel):
        return f"#{subject.name}"
    return subject.name


def discord_sanitize(text: str) -> str:
    """
    Sanitize text for use in Discord. (Escape Markdown and mentions)
    :param text: The text to sanitize.
    :return: The sanitized, properly escaped text.
    """
    return discord.utils.escape_markdown(discord.utils.escape_mentions(text))