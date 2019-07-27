import discord
import asyncio
import re
from utils.collectreact import collect_react, EmojiType
from utils.string import tag, normalize_equal, caseless_equal, caseless_contains
from utils.search import search_user_or_member, search_channel, search_role
from discord.ext import commands
from collections import namedtuple
from typing import (
    Sequence, Union, TypeVar, Optional, NamedTuple, Iterable, List, Tuple,
    TYPE_CHECKING, cast
)
from constants.numbers import DEFAULT_AMBIGUITY_TIMEOUT, DEFAULT_AMBIGUITY_CANCEL_NOTIFICATION_DELETE_DELAY
from constants.emoji import NUMBERS, RED_X
from constants.regex import AMBIGUITY_TWO_DIGITS, AMBIGUITY_CANCEL
from contextlib import suppress

if TYPE_CHECKING:
    from classes.scontext import SContext

T = TypeVar("T", discord.Member, discord.User, discord.abc.GuildChannel, discord.abc.PrivateChannel, discord.Role)

AmbiguityResponse = NamedTuple("AmbiguityResponse", [("chosen", Optional[T]), ("cancelled", bool)])


async def ambiguity_solve(
        ctx: "SContext", subjects: Sequence[T], *, type_name: str, timeout: int = DEFAULT_AMBIGUITY_TIMEOUT
):
    can_react = True
    if ctx.guild is not None and not cast(discord.Member, ctx.guild.me).permissions_in(ctx.channel).add_reactions:
        can_react = False
    text = f"Multiple {type_name}s have matched your search."
    end_text_m = f" Please specify one, either by writing it out or by specifying its number (on its left, see below; \
e.g.: `1`). This command will automatically expire in {timeout} seconds. Type `cancel` to cancel."
    end_text_r = f" Please specify one by reacting with its respective number, as seen below. This command will \
automatically expire in {timeout} seconds. React with {RED_X} to cancel."
    text += end_text_r if can_react else end_text_m
    text += f"\n**{type_name.title()}s matched:**"
    ind = 0
    for subject in subjects:
        text += "\n**{0}** {1} _(ID: {2.id})_".format(
            (NUMBERS[ind] + ":") if can_react else f"{ind}.",
            discord.utils.escape_markdown(discord.utils.escape_mentions(tag(subject))),
            subject
        )
        ind += 1
    cancelled_text = "Command cancelled."
    msg = await ctx.send(text)
    if can_react:
        emoji = tuple([RED_X]) + NUMBERS[:len(subjects)]

        def on_timeout(*_args):
            raise asyncio.TimeoutError

        with suppress(discord.HTTPException):
            try:
                reaction: discord.Reaction = await collect_react(
                    msg=msg, emoji=emoji, ctx=ctx, timeout=timeout, on_timeout=on_timeout, make_awaitable=True
                )
            except asyncio.TimeoutError:
                await ctx.send(cancelled_text)
                return AmbiguityResponse(chosen=None, cancelled=True)

            reacted_emj = str(reaction.emoji)

            if reacted_emj == RED_X or reacted_emj not in emoji:
                new_sent = await ctx.send(cancelled_text)
                if reacted_emj == RED_X:
                    await msg.delete()
                    await new_sent.delete(delay=DEFAULT_AMBIGUITY_CANCEL_NOTIFICATION_DELETE_DELAY)
                return AmbiguityResponse(chosen=None, cancelled=True)
            else:
                await msg.delete()
                return AmbiguityResponse(chosen=subjects[NUMBERS.index(reacted_emj)], cancelled=False)
    else:
        found: Tuple[T] = tuple()
        cancelled: bool = False

        def on_msg_check(new_msg: discord.Message):
            nonlocal found
            nonlocal cancelled
            is_same_user: bool = new_msg.channel == ctx.channel \
                                 and new_msg.author == ctx.author \
                                 and new_msg.author != ctx.bot.user
            if not is_same_user:
                return False
            content: str = new_msg.content
            if match := re.fullmatch(AMBIGUITY_TWO_DIGITS, content):
                as_int: int = int(match.group(1))
                if len(subjects) <= as_int <= 10:
                    ctx.bot.loop.create_task(ctx.send(
                        f"Invalid entry number! Must be between **0** and **{len(subjects)-1}**."
                    ))
                    return False
                elif as_int in range(len(subjects)):
                    found = tuple([subjects[as_int]])
                    return True

            if re.fullmatch(AMBIGUITY_CANCEL, content, re.RegexFlag.I):
                cancelled = True
                return True

            first_subj = subjects[0]
            if isinstance(first_subj, discord.abc.GuildChannel) or isinstance(first_subj, discord.abc.PrivateChannel):
                searcher = search_channel
            elif isinstance(first_subj, discord.abc.User):
                searcher = search_user_or_member
            elif isinstance(first_subj, discord.Role):
                searcher = search_role
            else:
                raise TypeError("Non-Discord object class given.")

            if len(found := searcher(content, subjects, operation=normalize_equal)) < 1       \
                and len(found := searcher(content, subjects, operation=caseless_equal)) < 1   \
                and len(found := searcher(content, subjects, operation=caseless_contains)) < 1: # from most to least
                fmt_str = "Could not find, within the given list, user {0!r}; try again."       # strict search.
                ctx.bot.loop.create_task(ctx.send(
                    fmt_str.format(content if len(content) + len(fmt_str) < 2000 else "<too big to display!>")
                ))
                return False

            if len(found) > 1:
                ctx.bot.loop.create_task(ctx.send(
                    "Your search matched multiple users; please be more specific."
                ))
                return False

            if len(found) == 1:
                return True

            return False

        try:
            with suppress(discord.HTTPException):
                await ctx.bot.wait_for("message", timeout=timeout, check=on_msg_check)
        except asyncio.TimeoutError:
            cancelled = True

        if cancelled or len(found) != 1:
            await ctx.send(cancelled_text)
            return AmbiguityResponse(chosen=None, cancelled=True)
        return AmbiguityResponse(chosen=found[0], cancelled=False)


