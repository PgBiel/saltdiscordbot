import typing
import discord
import codecs
import re
import datetime
from dateutil.relativedelta import relativedelta
from constants import DELTA_COMPRESSION_MAP, DELTA_DECOMPRESSION_MAP


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

    return codecs.decode(text, "hex").decode("utf-8")


def decompress(string: typing.Union[str, bytes]) -> str:
    """
    Decompresses a compress()ed string.

    :param string: Compressed string.
    :return: Decompressed.
    """
    if len(string) == 1:
        return string
    result: str = codecs.encode(bytes(string, "ascii") if not isinstance(string, bytes) else string, "hex") \
        .decode("utf-8")
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
    elif ".webm" in string:
        string = "w+" + string
    return string


def avatar_decompress(compressed: str, *, user_id: str, ext: str = "webp", size: int = 1024) -> str:
    """
    Decompress a previously compressed avatar string.

    :param compressed: The compressed string.
    :param user_id: ID of user who was using this avatar. If include_id was set to True, this is ignored.
    :param ext: The extension when it's an immobile (non-animated) avatar. Defaults to "webp"
    :param size: (int) Size of the image in pixels (px  x  px). Defaults to 1024.
    :return: The avatar URL.
    """
    string = str(compressed)
    origin = 'https://cdn.discordapp.com/avatars/'
    if "g+" in string or "a_" in string:  # animated avatar
        ext = "gif"
    elif "w+" in string:
        ext = "webm"

    string = string.replace("g+", "").replace("w+", "")
    if "/" in string:  # means we used include_id=True
        origin += string + f".{ext}"
    else:
        origin += str(user_id) + f"/{string}.{ext}"

    if size:
        origin += f"?size={size}"

    return origin


def delta_compress(delta: typing.Union[datetime.timedelta, relativedelta], *, include_micro=False) -> str:
    if not isinstance(delta, datetime.timedelta) and not isinstance(delta, relativedelta):
        return ""

    string = ""
    for k in DELTA_COMPRESSION_MAP:
        if not include_micro and k == "microseconds":
            continue

        if not include_micro and k == "milliseconds":
            string += f"{DELTA_COMPRESSION_MAP[k]}{delta.microseconds // 1000}"

        if hasattr(delta, k) and (val := getattr(delta, k)):  # has the time subdivision as attribute and it's non-zero
            if float(int(val)) == float(val):  # if this is a float that is actually an integer -- x.0
                val = int(val)

            string += f"{DELTA_COMPRESSION_MAP[k]}{val}"

    return string


DeltaClass = typing.TypeVar("DeltaClass", datetime.timedelta, relativedelta)


def delta_decompress(compressed: str, *, cls: typing.Type[DeltaClass] = relativedelta) -> DeltaClass:
    string = ""
    match: typing.List[str] = re.findall(r'[a-z]+[\d.]+', str(compressed), flags=re.RegexFlag.I)
    result: DeltaClass = cls()
    if not match:
        return result

    for part in match:
        typeof = part[0]
        try:
            true_type = DELTA_DECOMPRESSION_MAP[typeof]
        except KeyError:
            continue

        if cls == datetime.timedelta and true_type not in ('days', 'seconds', 'milliseconds', 'microseconds'):
            continue  # timedelta only supports days, seconds and microseconds.

        num_str = part[1:]
        try:
            if true_type in ('years', 'months'):
                num = int(num_str)
            else:
                num = float(num_str)
        except ValueError:
            continue
        if not num:  # == 0
            continue

        if true_type == 'milliseconds':
            true_type = "microseconds"
            num *= 1000

        setattr(result, true_type, num)

    return result
