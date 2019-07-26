"""
WIP
"""

import discord
from discord.ext import commands
from classes import SContext
import asyncio
import typing
from typing import Union, Optional, Callable, Sequence, Any, Coroutine
from constants.numbers import DEFAULT_REACTWAIT_TIMEOUT
from utils.callable import await_if_needed

EmojiType = Union[str, discord.Emoji]
GenericUser = Union[discord.Member, discord.User]
ReactionAddPredicate = Callable[[discord.Reaction, GenericUser], Union[bool, Coroutine[Any, Any, bool]]]
ReactionAddPredicateGen = Callable[
    [discord.Message, Sequence[EmojiType], SContext],
    Union[ReactionAddPredicate, Coroutine[Any, Any, ReactionAddPredicate]]
]
OnTimeoutCall = Callable[[discord.Message, Sequence[EmojiType], SContext], Any]
OnSuccessCall = Callable[[discord.Message, Sequence[EmojiType], SContext], Any]


def default_react_predicate_gen(
    message: discord.Message, emoji: Sequence[EmojiType], ctx: SContext
) -> ReactionAddPredicate:
    def default_react_predicate(reaction: discord.Reaction, user: GenericUser):
        cond = user.id != ctx.bot.user.id \
               and message.id == reaction.message.id \
               and message.channel == reaction.message.channel \
               and user == ctx.author

        for em in emoji:
            if em == str(reaction.emoji) or em == reaction.emoji:
                cond = cond and True
                return cond

        return False

    return default_react_predicate


async def default_on_timeout(
    message: discord.Message, emoji: Sequence[EmojiType], ctx: SContext
):
    for em in emoji:
        await message.remove_reaction(em, ctx.bot.user)


async def default_on_success(
    message: discord.Message, emoji: Sequence[EmojiType], ctx: SContext
):
    pass  # not much to do here


async def collect_react(
    msg: discord.Message, emoji: Sequence[EmojiType], ctx: SContext, *,
    timeout: float = float(DEFAULT_REACTWAIT_TIMEOUT),
    predicate_gen: Optional[ReactionAddPredicateGen] = default_react_predicate_gen,
    predicate: Optional[ReactionAddPredicate] = None,
    on_timeout: Optional[OnTimeoutCall] = default_on_timeout,
    on_success: Optional[OnSuccessCall] = default_on_success,
    make_awaitable: Optional[bool] = False
):
    """|coro|
    Collect reactions, as in a menu. This should be used until discord.ext.menu is released.

    :param msg: The message to which add reactions and make menu happen.
    :param emoji: List of emoji that are part of our menu.
    :param ctx: The context object.
    :param timeout: Max amount of time for the menu to be up, in seconds. 120 seconds (2 min) by default.
    :param predicate_gen: A predicate generator that uses the message, emoji and context to make the predicate. This is
        optional; passing predicate takes priority.
    :param predicate: The effective predicate that takes only Reaction and User, checks if we should consider that the
        user clicked something in our menu or not.
    :param on_timeout: What to do when the timeout rings, by default removes all bot-authored reactions.
    :param on_success: What to do when we successfully receive the reaction.
    :param make_awaitable: Whether the function should wait until either the reaction is clicked or the time passes;
        defaults to False.
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
    predicate_gen = predicate_gen or default_react_predicate_gen
    predicate_to_use: ReactionAddPredicate = predicate or (
        await await_if_needed(predicate_gen(msg, emoji, ctx))
    )
    for em in emoji:
        await msg.add_reaction(em)

    async def waiting_for():
        try:
            await ctx.bot.wait_for("reaction_add", timeout=timeout, check=predicate_to_use)
        except asyncio.TimeoutError:
            await await_if_needed(on_timeout(msg, emoji, ctx))
        else:
            await await_if_needed(on_success(msg, emoji, ctx))

    if make_awaitable:
        await waiting_for()
    else:
        ctx.bot.loop.create_task(waiting_for())
