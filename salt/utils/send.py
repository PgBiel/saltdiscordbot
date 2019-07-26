"""
The custom sender.
"""
import asyncio
import typing
import discord
from discord.ext import commands
from constants.numbers.delays import DELETABLE_REACTWAIT_TIMEOUT as DELE_TIMEOUT
from constants.emoji.default_emoji import WASTEBASKET
from utils.collectreact import collect_react

if typing.TYPE_CHECKING:
    from classes import SContext  # for typing purposes, but this isn't actually imported


async def send(
    ctx: "SContext", content: str = None, *,
    deletable: bool = False, sender: typing.Callable[..., discord.Message] = None,
    **kwargs
) -> discord.Message:
    """|coro|
    Sends a message to the destination with the content given.
    The content must be a type that can convert to a string through ``str(content)``.
    If the content is set to ``None`` (the default), then the ``embed`` parameter must
    be provided.
    To upload a single file, the ``file`` parameter should be used with a
    single :class:`~discord.File` object. To upload multiple files, the ``files``
    parameter should be used with a :class:`list` of :class:`~discord.File` objects.
    **Specifying both parameters will lead to an exception**.
    If the ``embed`` parameter is provided, it must be of type :class:`~discord.Embed` and
    it must be a rich embed type.
    Parameters
    ------------
    ctx: :class:`SContext`
      The context.
    content: :class:`str`
      The content of the message to send.
    tts: :class:`bool`
      Indicates if the message should be sent using text-to-speech.
    embed: :class:`~discord.Embed`
      The rich embed for the content.
    file: :class:`~discord.File`
      The file to upload.
    files: List[:class:`~discord.File`]
      A list of files to upload. Must be a maximum of 10.
    nonce: :class:`int`
      The nonce to use for sending this message. If the message was successfully sent,
      then the message will have a nonce with this value.
    delete_after: :class:`float`
      If provided, the number of seconds to wait in the background
      before deleting the message we just sent. If the deletion fails,
      then it is silently ignored.
    deletable: :class:`bool`
      (Customized, added by Pg) If provided, add a trash can reaction on the message to be
      deleted by the member on click (if they called the command or they have Manage Messages).
    sender:
      Sends the message.
    Raises
    --------
    ~discord.HTTPException
      Sending the message failed.
    ~discord.Forbidden
      You do not have the proper permissions to send the message.
    ~discord.InvalidArgument
      The ``files`` list is not of the appropriate size or
      you specified both ``file`` and ``files``.
    Returns
    ---------
    :class:`~discord.Message`
      The message that was sent.
    """
    sender = sender or ctx.send
    msg: discord.Message = await sender(content, **kwargs)
    myperms: discord.Permissions = ctx.guild.me.permissions_in(ctx.channel) if ctx.guild is not None else None
    if deletable and (True if ctx.guild is None else (myperms.add_reactions and myperms.read_message_history)):
        def delcheck(reaction: discord.Reaction, member: typing.Union[discord.Member, discord.User]):
            return member.id != ctx.bot.user.id \
                   and msg.id == reaction.message.id \
                   and msg.channel == reaction.message.channel \
                   and (
                               member == ctx.author or
                               (member.permissions_in(ctx.channel).manage_messages if ctx.guild is not None else False)
                       ) \
                   and str(reaction.emoji) == WASTEBASKET

        try:
            await collect_react(
                msg, (WASTEBASKET,), ctx, timeout=DELE_TIMEOUT, predicate=delcheck, on_success=msg.delete
            )
        except discord.Forbidden as _e:
            return msg

    return msg