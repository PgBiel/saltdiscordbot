"""
Check things.
"""
import asyncio
import motor.motor_asyncio
import motor.core
import discord
import typing
from typing import Iterable, Any, Callable, List, Sized
from discord.ext import commands
from classes.scontext import SContext


def is_owner():

    def do_check(ctx: SContext) -> bool:
        return ctx.author.id == ctx.bot.config["owner"]

    return commands.check(do_check)


async def has_saltmod_role():
    def do_check(ctx: SContext) -> bool:
        if not ctx.guild:
            return False
        mondb = ctx.db
        mods: motor.motor_asyncio.AsyncIOMotorCollection = mondb.mods
        mods_entry_cursor: motor.motor_asyncio.AsyncIOMotorCursor = await mods.find_one({"guild_id": ctx.guild.id})
        role_ids: Iterable[int] = mods_entry_cursor["moderator"]
        for role_id in role_ids:
            for role in ctx.author.roles:
                if role.id == role_id:
                    return True

        return False

    return commands.check(do_check)


async def or_checks(*decorators: Callable[..., Any]):
    def or_decorator(func: Callable[..., Any]):
        predicates = []
        _decorator_res: List[Callable[..., Any]] = [decorator(func) for decorator in decorators]
        if isinstance(func, commands.Command):
            cmd: commands.Command = func
            checks: List[Callable[..., bool]] = cmd.checks
            predicates.extend(cmd.checks[len(checks) - len(decorators):len(checks)])
            del cmd.checks[len(checks) - len(decorators):len(checks)]
        else:
            checks: List[Callable[..., bool]] = func.__commands_checks__
            predicates.extend(func.__commands_checks__[len(checks) - len(decorators):len(checks)])
            del func.__commands_checks__[len(checks) - len(decorators):len(checks)]

        def or_check(ctx: SContext) -> bool:  # TODO: Separate into get_predicates(*decs)
            cond = False

            for pred in predicates:
                cond = cond or pred(ctx)

            return cond

        return commands.check(or_check)(func)
    return or_decorator



