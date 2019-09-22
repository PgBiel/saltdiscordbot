"""
The custom sender.
"""
import asyncio
import typing
import discord
import attr
from constants.numbers.delays import (
    DELETABLE_REACTWAIT_TIMEOUT as DELE_TIMEOUT, PAGINATE_REACTWAIT_TIMEOUT as PAGE_TIMEOUT
)
from constants.emoji.default_emoji import (
    WASTEBASKET, DEL_PAGINATE_EMOJIS, PAGINATE_EMOJIS, RED_X, TRACK_PREVIOUS, TRACK_NEXT, ARROW_FORWARD, ARROW_BACKWARD
)
from utils.funcs import clamp
from essentials.collectreact import collect_react

if typing.TYPE_CHECKING:
    from classes import SContext  # for typing purposes, but this isn't actually imported


@attr.s(auto_attribs=True)
class PaginateOptions:
    do_message_edit: typing.Callable[
        ["PaginateOptions", discord.Message, typing.Sequence[discord.Emoji], "SContext", discord.Reaction],
        typing.Coroutine
    ]
    current_page: int = 1
    min_page: int = 1
    max_page: typing.Optional[int] = None
    deletable: bool = True
    auto_empty_cache: bool = True
    old_page: int = 1                    # this shouldn't be set
    cache: typing.Union[list, dict] = attr.ib(factory=list)  # this shouldn't be set

    def empty_cache(self):
        self.cache = type(self.cache)()


async def send(
    ctx: "SContext", content: str = None, *,
    deletable: bool = False, paginate: typing.Optional[PaginateOptions] = None, allow_everyone: bool = False,
    sender: typing.Callable[
        ..., typing.Coroutine[typing.Any, typing.Any, discord.Message]
    ] = None,
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
    paginate: :class:`PaginateOptions`
      (Customized, added by Pg) If provided, specify pagination options.
    allow_everyone: :class:`bool`
        If should allow @ everyone or @ here mentions in the message. Default is False (prevents those pings).
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
    if isinstance(content, discord.Embed):
        kwargs["embed"] = content
        content = None

    elif content and not allow_everyone:
        content = content.replace("@everyone", "@\u200beveryone").replace("@here", "@\u200bhere")
    msg: discord.Message = await sender(content, **kwargs)
    myperms: discord.Permissions = ctx.guild.me.permissions_in(ctx.channel) if ctx.guild is not None else None
    if (
        paginate and (True if ctx.guild is None else (myperms.add_reactions and myperms.read_message_history))
        and paginate.max_page != paginate.min_page  # must have at least two pages
    ):
        reac_emojis = DEL_PAGINATE_EMOJIS if paginate.deletable else PAGINATE_EMOJIS

        async def on_success(
            messg: discord.Message, emj: typing.Sequence[discord.Emoji], ctx: "SContext", react: discord.Reaction
        ):
            if not react:
                return
            if str(react.emoji) in (RED_X, WASTEBASKET):
                await messg.delete()
                if paginate.auto_empty_cache:
                    paginate.empty_cache()
                raise asyncio.TimeoutError()

            new_page: int = paginate.current_page
            if str(react.emoji) == TRACK_PREVIOUS:
                new_page = paginate.min_page
            elif str(react.emoji) == ARROW_BACKWARD:
                new_page -= 1
            elif str(react.emoji) == ARROW_FORWARD:
                new_page += 1
            elif str(react.emoji) == TRACK_NEXT:
                new_page = paginate.max_page

            new_page = clamp(new_page, paginate.min_page, paginate.max_page)
            if new_page is not None and paginate.current_page != new_page:
                paginate.old_page = paginate.current_page
                paginate.current_page = new_page
                await paginate.do_message_edit(paginate, messg, emj, ctx, react)

        async def on_timeout(messg: discord.Message, emj, _c):
            if paginate.auto_empty_cache:
                paginate.empty_cache()
            try:
                await messg.clear_reactions()
            except discord.Forbidden:
                for em in emj:
                    await messg.remove_reaction(em, ctx.bot.user)

        try:
            await collect_react(
                msg, reac_emojis, ctx, timeout=PAGE_TIMEOUT, on_success=on_success, on_timeout=on_timeout,
                make_awaitable=False, wait_for_remove=True, keep_going=True
            )
        except (discord.Forbidden, asyncio.TimeoutError):
            return msg

    elif deletable and (True if ctx.guild is None else (myperms.add_reactions and myperms.read_message_history)):

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
                msg, (WASTEBASKET,), ctx, timeout=DELE_TIMEOUT, predicate=delcheck, on_success=msg.delete,
                make_awaitable=False
            )
        except discord.Forbidden as _e:
            return msg

    return msg
