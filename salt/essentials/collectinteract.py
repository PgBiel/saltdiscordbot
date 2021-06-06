"""
Collect reactions, for a menu.
"""

import discord
import asyncio
import typing
from typing import Union, Optional, Callable, Sequence, Any, Coroutine, TYPE_CHECKING
from discord.member import Member
from discord_components import component
from discord_components.button import Button

from discord_components.interaction import Interaction
from discord_components.select import Option, Select
from constants.numbers import DEFAULT_REACTWAIT_TIMEOUT
from utils.funcs.callable import await_if_needed

if TYPE_CHECKING:
    from classes import SContext

# EmojiType = Union[str, discord.Emoji]
GenericUser = Union[discord.Member, discord.User]
InteractedPredicate = Callable[[Interaction], bool]  # can only be sync!
InteractedPredicateGen = Callable[
    [discord.Message, Sequence[str], "SContext"],
    Union[InteractedPredicate, Coroutine[Any, Any, InteractedPredicate]]
]
OnTimeoutCall = Union[Callable[[discord.Message, "SContext"], Any], Callable[[], Any]]
OnSuccessCall = Union[
    Callable[[discord.Message, "SContext", Interaction], Any], Callable[[], Any]
]


def default_interact_predicate_gen(
    message: discord.Message, check_ids: Sequence[str], ctx: "SContext"
) -> InteractedPredicate:
    """Generates a predicate for checking valid interactions - i.e., filtering listened interactions
    that were done on this message and by the command invoker.

    Parameters
    ----------
    message : discord.Message
        Message receiving the interaction(s).
    check_ids : Sequence[:class:`str`]
        Valid interaction IDs.
        
        Note: For :class:`~.Option`, this is compared against its `value` attribute.
    ctx : SContext
        Context of the command.

    Returns
    -------
    Callable[[:class:`~.Interaction`, Union[:class:`discord.User`, :class:`discord.Member`]], :class:`bool`]
        [description]
    """
    def default_interact_predicate(interaction: Interaction):
        if interaction.is_ephemeral:
            return False

        user = interaction.user
        if ctx.guild:
            user = ctx.guild.get_member(interaction.user.id) or interaction.user
            
        cond = user.id != ctx.bot.user.id \
                and message.id == interaction.message.id \
                and message.channel == interaction.message.channel \
                and (
                    user == ctx.author
                    or isinstance(user, Member) and user.permissions_in(message.channel).manage_messages
                )

        id_or_value = ""
        if isinstance(interaction.component, (Button, Select)):
            id_or_value = str(interaction.component.id)
        elif isinstance(interaction.component, Option):
            id_or_value = str(interaction.component.value)
        else:
            raise TypeError(f"Invalid interaction type received: {type(interaction)}")

        for id in check_ids:
            if id == id_or_value:
                cond = cond and True
                return cond

        return False

    return default_interact_predicate


async def default_on_timeout(
    message: discord.Message, ctx: "SContext"
):
    """Default function for timeout after interaction collection attempt.
    By default, all components in the message are cleared.

    Parameters
    ----------
    message : discord.Message
        Message with the interactions.
    ctx : SContext
        Context of the command.
    """
    await ctx.edit(message, components=[])


async def default_on_success(
    *args
):
    pass  # not much to do here


@typing.overload
async def collect_interact(
    msg: discord.Message, component_ids: Sequence[str], ctx: "SContext", *,
    interaction_event: typing.Union[typing.Literal["button_click"], typing.Literal["select_option"]] = "button_click",
    timeout: float = float(DEFAULT_REACTWAIT_TIMEOUT),
    predicate_gen: Optional[InteractedPredicateGen] = default_interact_predicate_gen,
    predicate: Optional[InteractedPredicate] = None,
    on_timeout: Optional[OnTimeoutCall] = default_on_timeout,
    on_success: Optional[OnSuccessCall] = default_on_success,
    make_awaitable: Optional[typing.Literal[True]],
    keep_going: bool = False
) -> Interaction:
    pass


@typing.overload
async def collect_interact(
    msg: discord.Message, component_ids: Sequence[str], ctx: "SContext", *,
    interaction_event: typing.Union[typing.Literal["button_click"], typing.Literal["select_option"]] = "button_click",
    timeout: float = float(DEFAULT_REACTWAIT_TIMEOUT),
    predicate_gen: Optional[InteractedPredicateGen] = default_interact_predicate_gen,
    predicate: Optional[InteractedPredicate] = None,
    on_timeout: Optional[OnTimeoutCall] = default_on_timeout,
    on_success: Optional[OnSuccessCall] = default_on_success,
    make_awaitable: typing.Literal[False],
    keep_going: bool = False
) -> None:
    pass


async def collect_interact(
    msg: discord.Message, component_ids: Sequence[str], ctx: "SContext", *,
    interaction_event: typing.Union[typing.Literal["button_click"], typing.Literal["select_option"]] = "button_click",
    timeout: float = float(DEFAULT_REACTWAIT_TIMEOUT),
    predicate_gen: Optional[InteractedPredicateGen] = default_interact_predicate_gen,
    predicate: Optional[InteractedPredicate] = None,
    on_timeout: Optional[OnTimeoutCall] = default_on_timeout,
    on_success: Optional[OnSuccessCall] = default_on_success,
    make_awaitable: bool = True,
    keep_going: bool = False
):
    """|coro|
    Collect interactions, as in a menu. This should be used until discord.ext.menu is released.

    :param msg: The message to whose interactions should be checked.
    :param component_ids: List of valid component IDs receiving interactions.
    :param ctx: The context object.
    :param interaction_event: "button_click" or "select_option" (defaults to "button_click").
    :param timeout: Max amount of time for the menu to be up, in seconds. 120 seconds (2 min) by default.
    :param predicate_gen: A predicate generator that uses the message, component IDs and context to make the predicate. This is
        optional; passing predicate takes priority.
    :param predicate: The effective predicate that takes only Interaction and User, checks if we should consider that the
        user clicked something in our menu or not.
    :param on_timeout: What to do when the timeout rings, by default removes all components.
        Takes 2 parameters: msg (discord.Message) and ctx (SContext).
    :param on_success: What to do when we successfully receive the reaction.
        Takes 3 parameters(!): msg (discord.Message), ctx (SContext) and interaction
        (Interaction).
    :param make_awaitable: Whether the function should wait until either an interaction occurs or the time passes;
        defaults to True.
    :param keep_going: Whether to keep waiting even after an interaction was received; defaults to False.
    """
    # WIP
    # def reaccheck(reaction: discord.Reaction, user: discord.User):
    #     return user == ctx.author and reaction.emoji == emoji # WASTEBASKET
    #
    # try:
    #     await msg.add_reaction(emoji)
    # except discord.Forbidden as e:
    #     return msg
    #
    # try:
    #     reaction, user = await ctx.bot.wait_for("reaction_add", timeout=timeout, check=check)
    # except asyncio.TimeoutError as e:
    #      pass
    predicate_gen = predicate_gen or default_interact_predicate_gen
    predicate_to_use: InteractedPredicate = predicate or (
        await await_if_needed(predicate_gen(msg, component_ids, ctx))
    )
    errored_in_task = False

    # async def add_reaction(emj):
    #     nonlocal errored_in_task
    #     if errored_in_task:
    #         return
    #     try:
    #         return await msg.add_reaction(emj)
    #     except (discord.HTTPException, discord.NotFound):
    #         errored_in_task = True

    # for em in emoji:
    #     ctx.bot.loop.create_task(add_reaction(em))
    #     if errored_in_task:
    #         break

    async def waiting_for():
        nonlocal keep_going
        interacted: Optional[Interaction] = None
        try:
            interacted = await ctx.bot.wait_for(
                interaction_event or "button_click", timeout=timeout, check=predicate_to_use
            )
        except asyncio.TimeoutError:
            if on_timeout and callable(on_timeout):
                call = None
                try:
                    call = on_timeout(msg, ctx)
                except TypeError:
                    call = on_timeout()
                await await_if_needed(call)
        else:
            try:
                if on_success and callable(on_success):
                    call = None
                    try:
                        call = on_success(msg, ctx, interacted)
                    except TypeError:
                        call = on_success()
                    await await_if_needed(call)
            except asyncio.TimeoutError:
                keep_going = False

            if keep_going:  # never give up
                return await waiting_for()
        return interacted

    if make_awaitable:
        return await waiting_for()
    else:
        ctx.bot.loop.create_task(waiting_for())
