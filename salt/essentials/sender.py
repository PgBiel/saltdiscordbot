"""
The custom sender.
"""
import asyncio
import typing
import discord
import attr
from discord_components.button import Button, ButtonStyle
from discord_components.interaction import Interaction, InteractionType
from constants.numbers.delays import (
    DELETABLE_REACTWAIT_TIMEOUT as DELE_TIMEOUT, PAGINATE_REACTWAIT_TIMEOUT as PAGE_TIMEOUT
)
from constants.emoji.default_emoji import (
    WASTEBASKET, DEL_PAGINATE_EMOJIS, PAGINATE_EMOJIS, RED_X, TRACK_PREVIOUS, TRACK_NEXT,
    ARROW_FORWARD, ARROW_BACKWARD
)
from essentials.collectinteract import default_interact_predicate_gen, collect_interact, default_on_timeout
from utils.funcs import clamp
from discord_components import Component

if typing.TYPE_CHECKING:
    from classes import SContext  # for typing purposes, but this isn't actually imported


@attr.s(auto_attribs=True)
class PaginateOptions:
    """
    Options for pagination.

    Attributes:

        do_message_edit: Async function that edits the message for every page change.

        current_page: (Optional=1) The current page, which is changed when the user clicks the reaction to change pages.

        min_page: (Optional=1) Smallest page number, default of 1.

        max_page: (Optional=None) Maximum page, or None for unlimited pages.

        deletable: (Optional bool=True) Whether or not the user should be able to delete the message on button click.

        auto_empty_cache: (Optional bool=True) Whether or not the cache should be automatically cleared when pagination
            is over.

        cache: A list that can cache anything that is needed only for the duration of pagination. Can also be set to
            a dict.
        
        page_component_ids: The list of IDs of the pagination buttons.
    """
    do_message_edit: typing.Callable[
        ["PaginateOptions", discord.Message, "SContext", Interaction],
        typing.Coroutine
    ]
    current_page: int = 1
    min_page: int = 1
    max_page: typing.Optional[int] = None
    deletable: bool = True
    auto_empty_cache: bool = True
    old_page: int = 1                    # this shouldn't be set
    cache: typing.Union[list, dict] = attr.ib(factory=list)  # this shouldn't be set
    page_component_ids: typing.List[str] = attr.ib(factory=list)  # this shouldn't be set

    async def respond(self, *, interaction: Interaction, **kwargs):
        del_emj, relevant_emjs = self.emojis_considering_page()
        
        comps = ([Button(emoji=del_emj, style=ButtonStyle.red)] if del_emj else []) + [
            Button(emoji=emj, style=ButtonStyle.gray) for emj in relevant_emjs
        ]
        self.page_component_ids.clear()
        self.page_component_ids.extend(map(lambda b: b.id, comps))  # for collect_interact to detect

        kwargs["components"] = [comps] + (kwargs.get("components", None) or [])
        return await interaction.respond(type=InteractionType.UpdateMessage, **kwargs)
    
    def emojis_considering_page(self):
        page_emjs = self.page_emojis
        del_emj = self.page_emojis[0] if self.deletable else None
        relevant_emjs = page_emjs[1:] if self.deletable else page_emjs[:]
        if self.current_page >= self.max_page:
            relevant_emjs = relevant_emjs[:2]
        elif self.current_page <= self.min_page:
            relevant_emjs = relevant_emjs[2:]
        else:
            if self.current_page == self.max_page - 1:
                relevant_emjs = relevant_emjs[:3]
            if self.current_page == self.min_page + 1:
                relevant_emjs = relevant_emjs[1:]

        return (del_emj, relevant_emjs)

    def empty_cache(self):
        """
        Empties the cache.
        """
        self.cache = type(self.cache)()
    
    @property
    def page_emojis(self):
        return DEL_PAGINATE_EMOJIS if self.deletable else PAGINATE_EMOJIS


async def send(
    ctx: "SContext", content: str = None, *,
    deletable: bool = False, paginate: typing.Optional[PaginateOptions] = None, allow_everyone: bool = False,
    sender: typing.Callable[
        ..., typing.Coroutine[typing.Any, typing.Any, discord.Message]
    ] = None,
    components: typing.List[typing.Union[Component, typing.List[Component]]] = None,
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
    # sender = sender or ctx.send
    if not sender:
        def artificial_sender(content, **kwargs):
            return ctx.bot.comps_instance.send_component_msg(ctx.channel, content, **kwargs)
        sender = artificial_sender
    
    if isinstance(content, discord.Embed):
        kwargs["embed"] = content
        content = None

    elif content and not allow_everyone:
        content = content.replace("@everyone", "@\u200beveryone").replace("@here", "@\u200bhere")
    
    myperms: discord.Permissions = ctx.guild.me.permissions_in(ctx.channel) if ctx.guild is not None else None
    delete_comp: Button = None
    pag_comps: typing.List[Button] = []
    if (
        paginate and (True if ctx.guild is None else (myperms.add_reactions and myperms.read_message_history))
        and paginate.max_page != paginate.min_page  # must have at least two pages
    ):
        del_pag_emj, relevant_pag_emjs = paginate.emojis_considering_page()
        
        pag_comps = ([Button(emoji=del_pag_emj, style=ButtonStyle.red)] if del_pag_emj else []) + [
            Button(emoji=emj, style=ButtonStyle.gray) for emj in relevant_pag_emjs
        ]
        components = [pag_comps] + (components or [])  # note: pag_comps has to go inside a [] for the buttons to be aligned in a single row
    elif deletable and (True if ctx.guild is None else (myperms.read_message_history)):
        components = [delete_comp := Button(emoji=WASTEBASKET, style=ButtonStyle.red)] + (components or [])
    if components:
        kwargs["components"] = components

    
    msg: discord.Message = await sender(content, **kwargs)
    if pag_comps:
        async def on_success(
            messg: discord.Message, ctx: "SContext", interaction: Interaction
        ):
            if not interaction or not isinstance(interaction.component, Button):
                return
            chosen_emj = interaction.component.emoji
            if str(chosen_emj) in (RED_X, WASTEBASKET):
                await messg.delete()
                if paginate.auto_empty_cache:
                    paginate.empty_cache()
                raise asyncio.TimeoutError()

            new_page: int = paginate.current_page
            if str(chosen_emj) == TRACK_PREVIOUS:
                new_page = paginate.min_page
            elif str(chosen_emj) == ARROW_BACKWARD:
                new_page -= 1
            elif str(chosen_emj) == ARROW_FORWARD:
                new_page += 1
            elif str(chosen_emj) == TRACK_NEXT:
                new_page = paginate.max_page

            new_page = clamp(new_page, paginate.min_page, paginate.max_page)
            if new_page is not None and paginate.current_page != new_page:
                paginate.old_page = paginate.current_page
                paginate.current_page = new_page
                await paginate.do_message_edit(paginate, messg, ctx, interaction)

        async def on_timeout(messg: discord.Message, c):
            if paginate.auto_empty_cache:
                paginate.empty_cache()
            return await default_on_timeout(messg, c)
            # try:
            #     await messg.clear_reactions()
            # except discord.Forbidden:
            #     for em in emj:
            #         await messg.remove_reaction(em, ctx.bot.user)

        paginate.page_component_ids = list(map(lambda b: b.id, pag_comps))
        try:
            await collect_interact(
                msg, paginate.page_component_ids, ctx, interaction_event="button_click",
                timeout=PAGE_TIMEOUT, on_success=on_success, on_timeout=on_timeout,
                make_awaitable=False, keep_going=True
            )
        except (discord.Forbidden, asyncio.TimeoutError):
            return msg

    elif delete_comp: # deletable and (True if ctx.guild is None else (myperms.read_message_history)):
        
        delcheck = default_interact_predicate_gen(msg, [delete_comp.id], ctx)

        try:
            await collect_interact(
                msg, (delete_comp.id,), ctx, timeout=DELE_TIMEOUT, predicate=delcheck,
                on_success=msg.delete,
                make_awaitable=False
            )
        except discord.Forbidden as _e:
            return msg

    return msg
