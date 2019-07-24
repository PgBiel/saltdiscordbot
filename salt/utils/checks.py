"""
Check things.
"""
import asyncio
import motor.motor_asyncio
import motor.core
import discord
import typing
from typing import Iterable, Any, Callable, List, Union, Coroutine
from discord.ext import commands
from classes import SContext
from classes.errors import SaltCheckFailure, MissingSaltModRole


async def _get_predicates(
        func: Union[Callable[..., Any], commands.Command],
        *decorators: Union[Callable[..., Any], Coroutine[Any, Any, Callable[..., Any]]]  # supports decos and coros
) -> List[Union[Callable[[SContext], bool], Callable[[SContext], Coroutine[Any, Any, bool]]]]:  # preds be sync or async
    """
    Get the predicates from checks. (Specifically, their decorators - called checks)
    :param func: For decorator use, the function receiving it.
    :param decorators: The decorators that result from calling the check.
    :return: The predicates, or condition functions.
    """
    predicates: List[Callable[[SContext], bool]] = []
    for decorator in decorators:
        deco = decorator
        if asyncio.iscoroutine(deco):
            deco = await deco
        deco(func)
    if isinstance(func, commands.Command):
        cmd: commands.Command = func
        checks: List[Callable[[SContext], bool]] = cmd.checks
        predicates.extend(cmd.checks[len(checks) - len(decorators):len(checks)])
        del cmd.checks[len(checks) - len(decorators):len(checks)]
    else:
        checks: List[Callable[[SContext], bool]] = func.__commands_checks__
        predicates.extend(func.__commands_checks__[len(checks) - len(decorators):len(checks)])
        del func.__commands_checks__[len(checks) - len(decorators):len(checks)]
    return predicates


def or_checks(
        *decorators: Union[Callable[..., Any], Coroutine[Any, Any, Callable[..., Any]]],
        **error: typing.Optional[BaseException]
):
    """
    Do one check OR the other (any amount of checks - A or B or C or D or ... or Z)

    :param decorators: (REQUIRED) The checks. Note: **They must be called for this to work.**
    :param error: The error to be thrown when this or_check throws. Default: CheckFailure
    :return: The resulting check decorator.
    """
    if len(decorators) < 1:
        raise TypeError("or_checks() missing required positional argument(s) *decorators.")

    exception = error.pop("error", commands.errors.CheckFailure)

    def or_decorator(func: Union[Callable[..., Any], commands.Command]):
        loop = asyncio.get_event_loop()
        predicates = loop.run_until_complete(_get_predicates(func, *decorators))

        async def or_check(ctx: SContext) -> bool:
            cond = False

            for predicate in predicates:
                evaluated = False
                try:
                    evaluated = predicate(ctx)
                    if asyncio.iscoroutine(evaluated):
                        evaluated = await evaluated
                except (commands.errors.CheckFailure, SaltCheckFailure) as _err:
                    evaluated = False
                print("[OR] Evaluated: {0} / Old Cond: {1}".format(evaluated, cond))
                cond = cond or evaluated
                print(f"[OR] New Cond: {cond}")

            if not cond and exception is not None:
                raise exception

            return cond

        return commands.check(or_check)(func)
    return or_decorator


def is_owner():
    """
    Check if the user is the bot's application owner.
    :return: Check decorator.
    """
    def do_check(ctx: SContext) -> bool:
        return ctx.author.id == ctx.bot.config["owner"]

    return commands.check(do_check)


async def has_saltmod_role():
    """
    Check if the member has the Salt Mod role.
    :return: Check decorator.
    """
    async def do_check(ctx: SContext) -> bool:
        if not ctx.guild:
            return False
        mondb = ctx.db
        mods: motor.motor_asyncio.AsyncIOMotorCollection = mondb.mods
        mods_entry_cursor: motor.motor_asyncio.AsyncIOMotorCursor = await mods.find_one({"guild_id": str(ctx.guild.id)})
        role_ids: Iterable[str] = mods_entry_cursor["moderator"]
        for role_id in role_ids:
            if discord.utils.get(ctx.author.roles, id=int(role_id)):
                return True

        raise MissingSaltModRole
        # return False

    return commands.check(do_check)





