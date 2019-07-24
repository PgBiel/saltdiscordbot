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
from classes.scontext import SContext


async def _get_predicates(
        func: Union[Callable[..., Any], commands.Command],
        *decorators: Union[Callable[..., Any], Coroutine[Any, Any, Callable[..., Any]]]
) -> List[Union[Callable[[SContext], bool], Callable[[SContext], Coroutine[Any, Any, bool]]]]:
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
            for role in ctx.author.roles:
                if int(role.id) == role_id:
                    return True

        return False

    return commands.check(do_check)


T = typing.TypeVar("T", Callable[..., Any], Callable[..., Any])


def or_checks(*decorators: Union[Callable[..., Any], Coroutine[Any, Any, Callable[..., Any]]]):
    """
    Do one check OR the other (any amount of checks - A or B or C or D or ... or Z)

    :param decorators: The checks. Note: **They must be called for this to work.**
    :return: The resulting check decorator.
    """
    def or_decorator(func: Union[Callable[..., Any], commands.Command]):
        loop = asyncio.get_event_loop()
        predicates = loop.run_until_complete(_get_predicates(func, *decorators))

        async def or_check(ctx: SContext) -> bool:
            cond = False

            for predicate in predicates:
                evaluated = predicate(ctx)
                if asyncio.iscoroutine(evaluated):
                    evaluated = await evaluated
                cond = cond or evaluated

            return cond

        return commands.check(or_check)(func)
    return or_decorator



