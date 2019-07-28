"""
Operations using strings and/or returning strings.
"""
import unicodedata
import discord
from typing import Sequence, Optional, Union, TYPE_CHECKING
if TYPE_CHECKING:
    from classes import SContext


def humanize_perm(perm: str) -> str:
    """
    Humanize a Discord Permission. (e.g.: kick_members becomes Kick Members)

    :param perm: The discord permission, as a string.
    :return: The humanized string.
    """
    new_perm = perm.replace("_", " ").replace("guild", "server")
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