import discord
import re
import asyncio
from typing import Optional, Callable, Any, NamedTuple, Union, Coroutine, TYPE_CHECKING
from constants.numbers import DEFAULT_PROMPT_TIMEOUT
from constants.regex import PROMPT_CANCEL, PROMPT_SKIP, PROMPT_CONFIRMATION
from utils.funcs.callable import await_if_needed

if TYPE_CHECKING:
    from classes import SContext

PromptPredicate = Callable[[discord.Message], bool]  # can only be sync, not async.
PromptPredicateGen = Callable[['SContext'], Union[PromptPredicate, Coroutine[Any, Any, PromptPredicate]]] # sync or async!
PromptResponse = NamedTuple(
    "PromptResponse", [("message", Optional[discord.Message]), ("cancelled", bool), ("skipped", bool)]
)


def default_predicate_gen(ctx: 'SContext') -> PromptPredicate:
    def default_predicate(msg: discord.Message):
        return msg.author == ctx.author    \
            and msg.author != ctx.bot.user

    return default_predicate


def confirmation_predicate_gen(ctx: 'SContext') -> PromptPredicate:
    """
    For asking the user to confirm an action. Accepts y/yes/ok and n/no/nah. Reacts if the user passes an invalid param.
    :param ctx: The context.
    :return: Predicate itself. (msg: discord.Message) -> bool
    """
    def confirmation_predicate(msg: discord.Message):
        is_same = msg.author == ctx.author    \
            and msg.author != ctx.bot.user
        if is_same:
            confirming = re.fullmatch(PROMPT_CONFIRMATION, msg.content, re.RegexFlag.I)
            if not confirming:
                ctx.bot.loop.create_task(ctx.send("Please respond __y__es or __n__o."))
                return False
            return True
        return False

    return confirmation_predicate


async def prompt(
        question: Optional[str] = "", *, ctx: 'SContext', embed: Optional[discord.Embed] = None,
        already_asked: Optional[bool] = False, timeout: Optional[float] = float(DEFAULT_PROMPT_TIMEOUT),
        predicate_gen: Optional[PromptPredicateGen] = default_predicate_gen,
        predicate: Optional[PromptPredicate] = None,
        cancellable: Optional[bool] = True, skippable: Optional[bool] = False,
        partial_question: Optional[bool] = False
):
    """
    Prompt for message responses from the user.

    :param question: The question being asked, ignored if `already_asked` is True.
    :param ctx: The context of the command.
    :param embed: Optionally an embed to add to the question message, ignored if `already_asked` is True.
    :param already_asked: If the question was already asked/question msg was already sent prior to this prompt call.
            Defaults to False.
    :param timeout: Time (float) in seconds in which the command expires; default is 25.0 seconds.
    :param predicate_gen: A predicate generator, if using the context is necessary. Ignored if `predicate` is given.
    :param predicate: Predicate to use to validate messages.
    :param cancellable: If the user is able to cancel the command by writing `cancel`. Defaults to True.
    :param skippable: If the user is able to skip this step by writing `skip`. Defaults to False.
    :param partial_question: If the question parameter given doesn't account for the "This command will expire in x
        seconds. Type `cancel` to cancel, and `skip` to skip." warning, and should receive it on demand. Ignored if
        `already_asked` is True. This defaults to False.
    :return: PromptResponse - A NamedTuple with `message` for the message that was received as response, if any;
        `cancelled`, a bool of whether the command was cancelled either manually (by the user) or
        automatically (by timeout or error); and `skipped`, bool of whether the command was manually skipped by the
        user.
    """
    if not already_asked:
        if partial_question:
            question += "{0}This command will expire in {1} seconds.{2}{3}".format(
                "" if question.endswith(" ") else " ", timeout,
                "Type `cancel` to cancel{}".format("" if skippable else ".") if cancellable else "",
                "{} `skip` to skip this part.".format(
                    ", and" if cancellable else "Type"
                ) if skippable else ""
            )
        await ctx.send(question, embed=embed)

    cancelled: bool = False
    skipped: bool = False
    given_predicate: PromptPredicate = predicate or (await await_if_needed(predicate_gen(ctx)))

    def check(msg: discord.Message):
        nonlocal cancelled, skipped
        if msg.author == ctx.author:
            if cancellable and re.fullmatch(PROMPT_CANCEL, msg.content, flags=re.RegexFlag.I):
                cancelled = True
                return True

            if skippable and re.fullmatch(PROMPT_SKIP, msg.content, flags=re.RegexFlag.I):
                skipped = True
                return True

        return given_predicate(msg)

    msg_received: Optional[discord.Message] = None
    try:
        msg_received = await ctx.bot.wait_for("message", check=check, timeout=timeout)
    except asyncio.TimeoutError:
        return PromptResponse(message=None, cancelled=True, skipped=False)
    else:
        if msg_received is not None:
            return PromptResponse(message=msg_received, cancelled=cancelled, skipped=skipped)
        else:
            return PromptResponse(message=None, cancelled=True, skipped=False)
