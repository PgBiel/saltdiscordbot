import typing
import discord
import codecs
import re


def compress(string: typing.Union[str, int]) -> str:
    """
    Compresses a number or a hex-like string.

    :param string: To compress.
    :return: Compressed. (Use decompress() to decompress)
    """
    text: str = str(string)
    if len(text) == 1:
        return text

    if len(text) % 2 != 0:  # odd length
        text = "0" + text

    return codecs.decode(text, "hex").decode("ascii")


def decompress(string: typing.Union[str, bytes]) -> str:
    """
    Decompresses a compress()ed string.

    :param string: Compressed string.
    :return: Decompressed.
    """
    if len(string) == 1:
        return string
    result: str = codecs.encode(bytes(string, "ascii") if not isinstance(string, bytes) else string, "hex") \
        .decode("ascii")
    if result[0] == '0':
        result = result[1:]
    return result


def avatar_compress(url: typing.Union[str, discord.Asset], include_id: bool = False) -> str:
    """
    Compress an avatar.

    :param url: Avatar URL to compress
    :param include_id: (Default=False) Whether or not to include the user ID in the compressed link. Defaults to false,
        and assumes there is stored a reference to the original user already.
    :return: Compressed string.
    """
    string = str(url)
    regex = r'(?P<avatar>\w+)\.[a-z]+(?:\?size=\d+)?$'
    if include_id:
        regex = r'(?P<id>\d+/)' + regex
    match = re.search(regex, string, re.RegexFlag.I)  # get the avatar
    if not match:
        return string
    string = match.group("id") + match.group("avatar") if include_id else match.group("avatar")
    if ".gif" in string or "a_" in string:
        string = "g+" + string
    if ".webm" in string:
        string = "w+" + string
    return string


def avatar_decompress(compressed: str, *, user_id: str = "", ext: str = "png") -> str:
    """
    Decompress a previously compressed avatar string.

    :param compressed: The compressed string.
    :param user_id: ID of user who was using this avatar. If include_id was set to True, this is ignored.
    :param ext: The extension when it's an immobile (non-animated) avatar. Defaults to "png"
    :return: The avatar URL.
    """
    origin = 'https://cdn.discordapp.com/avatars/'
    if "g+" in compressed or "a_" in compressed:
        ext = "gif"
    elif "w+" in compressed:
        ext = "webm"
    compressed = compressed.replace("g+", "").replace("w+", "")
    if "/" in compressed:  # means we used include_id=True
        origin += compressed + f".{ext}"
        return origin
    else:
        origin += user_id + f"/{compressed}.{ext}"
        return origin
