"""
Check things.
"""
import asyncio
import motor.motor_asyncio
import motor.core
import discord
import typing
from typing import Any, Callable, List, Union, Coroutine, Sequence
from discord.ext import commands
from utils.funcs import sync_await, permission_literal_to_tuple
from classes import PermsModel, PartialPermsModel, in_op, or_op
from classes.scommand import SCommand, SGroup
from classes.errors import (
    SaltCheckFailure, MissingSaltModRole, NoConfiguredSaltModRole, MissingSaltAdminRole, NoConfiguredSaltAdminRole,
    BotMissingOneChannelPermissions
)
from constants import DB_PERMISSION_TYPES

if typing.TYPE_CHECKING:
    from classes.scontext import SContext

B = typing.TypeVar("B", Callable, SCommand, commands.Command)
PredicateType = Union[Callable[["SContext"], bool], Callable[["SContext"], Coroutine[Any, Any, bool]]]
CmdFuncType = Union[Callable[..., Any], commands.Command, SCommand, commands.Group, SGroup]
# can be sync or async predicate


def _load_sattribs(func: CmdFuncType, **sattribs) -> None:
    if isinstance(func, SCommand):
        func._load_attribs(**sattribs)
    else:
        func.__scmd_attribs__ = sattribs


def scheck(predicate: PredicateType, **sattribs) -> Callable[[B], B]:
    """
    Our check decorator generator, entirely for the purpose of satisfying SCommand's needs.
    :param predicate: The predicate, as usual.
    :param sattribs: Any special data for SCommand.
    :return: Decorator.
    """
    def deco(func: B) -> B:
        if len(sattribs) > 0:
            if isinstance(func, SCommand):
                func._load_attribs(**sattribs)
            else:
                func.__scmd_attribs__ = sattribs
        return commands.check(predicate)(func)
    return deco


async def _get_predicates(
        func: Union[Callable[..., Any], commands.Command],
        *decorators: Union[Callable[..., Any], Coroutine[Any, Any, Callable[..., Any]]]  # supports decos and coros
) -> List[PredicateType]:  # preds be sync or async
    """
    Get the predicates from checks. (Specifically, their decorators - called checks)
    :param func: For decorator use, the function receiving it.
    :param decorators: The decorators that result from calling the check.
    :return: The predicates, or condition functions.
    """
    predicates: List[Callable[["SContext"], bool]] = []
    for decorator in decorators:
        deco = decorator
        if asyncio.iscoroutine(deco):
            deco = await deco
        deco(func)
    if isinstance(func, commands.Command):
        cmd: commands.Command = func
        checks: List[Callable[["SContext"], bool]] = cmd.checks
        predicates.extend(cmd.checks[len(checks) - len(decorators):len(checks)])
        del cmd.checks[len(checks) - len(decorators):len(checks)]
    else:
        checks: List[Callable[["SContext"], bool]] = func.__commands_checks__
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

    def or_decorator(func: CmdFuncType):
        predicates = []

        async def or_check(ctx: "SContext") -> bool:
            nonlocal predicates
            if len(predicates) < 1:
                predicates = await _get_predicates(func, *decorators)
            cond = False

            for predicate in predicates:
                evaluated = False
                try:
                    evaluated = predicate(ctx)
                    if asyncio.iscoroutine(evaluated) or asyncio.isfuture(evaluated):
                        evaluated = await evaluated
                except (commands.errors.CheckFailure, SaltCheckFailure) as _err:
                    evaluated = False
                cond = cond or evaluated

            if not cond and exception is not None:
                raise exception

            return cond

        return commands.check(or_check)(func)
    return or_decorator


def has_saltrole(saltrole: str = "moderator"):
    """
    Check if the member has the Salt Mod role.
    :return: Check decorator.
    """
    true_type = "moderator" if saltrole.startswith("m") else "administrator"

    generic_main_error = "Server did not configure {} role."
    generic_missing_error = "Member does not have any of the server's configured {} role(s)."
    if true_type == "moderator":
        main_error = NoConfiguredSaltModRole(generic_main_error.format("SaltMod"))
        missing_error = MissingSaltModRole(generic_missing_error.format("SaltMod"))
    else:
        main_error = NoConfiguredSaltAdminRole(generic_main_error.format("SaltAdmin"))
        missing_error = MissingSaltAdminRole(generic_missing_error.format("SaltAdmin"))

    async def do_check(ctx: "SContext") -> bool:
        if not ctx.guild:
            return False
        mondb = ctx.db
        mods: motor.motor_asyncio.AsyncIOMotorCollection = mondb.mods
        mods_entry_cursor: motor.motor_asyncio.AsyncIOMotorCursor = await (
            mods.find_one({"guild_id": str(ctx.guild.id)})
        )
        if mods_entry_cursor is None:
            raise main_error

        role_ids: Sequence[str] = mods_entry_cursor[true_type]

        if role_ids is None or len(role_ids) == 0:
            raise main_error

        for role_id in role_ids:
            if discord.utils.get(ctx.author.roles, id=int(role_id)):
                return True

        raise missing_error
        # return False

    if true_type == 'moderator':
        return scheck(do_check, saltmod_usable=True)
    else:
        return scheck(do_check, saltadmin_usable=True)


def has_saltmod_role():
    """
    Check if the member has the Salt Mod role.
    :return: Check decorator.
    """
    return has_saltrole(saltrole="moderator")


def has_saltadmin_role():
    """
    Check if the member has the Salt Mod role.
    :return: Check decorator.
    """
    return has_saltrole(saltrole="administrator")


def sguild_only():
    """
    Make sure the command is only able to be executed in guilds. (Custom Salt version)
    :return: Check decorator.
    """
    def sguild_deco(func: CmdFuncType):
        _load_sattribs(func, guild_only=True)
        return commands.guild_only()(func)

    return sguild_deco


def sdev_only():
    """
    Make sure the command is only able to be executed by the developers/owners of the bot.
    :return: Check decorator.
    """
    def predicate(ctx: "SContext"):
        if ctx.author.id in ctx.bot.config["owners"] or ctx.author.id == ctx.bot.owner_id:
            return True
        raise commands.NotOwner()

    return scheck(predicate, dev_only=True)


async def has_permission(
        ctx: "SContext",
        idable: Union[
            discord.abc.User, discord.abc.PrivateChannel, discord.abc.GuildChannel, discord.Role, discord.Guild,
            discord.Object, discord.abc.Snowflake  # anything that has a .id
        ], permission: Union[str, typing.Tuple[str, ...]],
        *, obj_type: typing.Optional[str] = None, default: bool = False,
        cog_name: typing.Optional[str] = None
) -> bool:  # TODO: Finish this; make perm check that adds to bot perms array; make perm command and stuff
    """
    Check if something has a salt permission.

    :param ctx: Context in which to check.
    :param idable: Anything that has a id; preferably a User, Member, Channel, Role or Guild object.
    :param permission: The permission literal or the tuple.
    :param obj_type: (Optional str) One of "member", "channel", "role" or "guild", if idable is not
        one of those objects.
    :param default: (Optional bool=False) Whether or not the object can use this command by default.
    :param cog_name: (Optional str) The cog the command is in to check for cog-wide overrides.
    :return: (bool) Whether or not it has permission.
    :raises TypeError: If a non-User/Member/Channel/Role/Guild object was passed in `idable` and no valid `obj_type`
        was passed to help identify which type it is.
    """
    id_n = idable.id
    if isinstance(idable, discord.abc.User):
        obj_type = 'member'
    elif isinstance(idable, discord.Role):
        obj_type = 'role'
    elif isinstance(idable, discord.Guild):
        obj_type = 'guild'
    elif isinstance(idable, discord.abc.GuildChannel) or isinstance(idable, discord.abc.PrivateChannel):
        obj_type = 'channel'
    elif not obj_type or obj_type not in DB_PERMISSION_TYPES:
        raise TypeError("Invalid type specified for obj_type.")

    if type(permission) == str:
        permission = permission_literal_to_tuple(permission)

    is_cog: bool = False
    is_custom: bool = False
    if permission[0] == 'cog':
        permission = permission[1:]
        if cog_name:
            is_cog = True

    elif permission[0] == 'custom':
        permission = permission[1:]
        is_custom = True

    def or_all(*names: str):
        return [*names, "all", "*"]

    command = permission[0]
    extra = permission[1] if len(permission) >= 2 else None
    extrax = permission[2] if len(permission) >= 3 else None
    extraxx = permission[3] if len(permission) >= 4 else None

    basic = PartialPermsModel(
        command=command, is_cog=is_cog if is_cog else False
    )

    def b_copy_as_dict(**attrs):
        copied = basic.copy()
        for k, v in attrs.items():
            setattr(copied, k, v)

        return copied.as_dict()

    # is_cog if is_cog else ({"$in": [True, False]} if cog_name else False - Saving for later
    await ctx.db['perms'].find_one(
        {
            **PartialPermsModel(
                id=str(id_n), type=obj_type,
                is_custom=is_custom
            ).as_dict(),
            **or_op([
                b_copy_as_dict(command=("all" if extra else command)),
                *([b_copy_as_dict(extra=("all" if extrax else extra))] if extra else []),
                *([b_copy_as_dict(extra=extra, extrax=("all" if extraxx else extrax))] if extrax else []),
                *([b_copy_as_dict(extra=extra, extrax=extrax, extraxx=extraxx)] if extraxx else [])
            ])
        }
    )
    # command = typing.cast(str, in_op(or_all(permission[0]))),
    # ** (dict(extra=in_op(or_all(permission[1]))) if permission[1] else dict()),
    # ** (dict(extrax=in_op(or_all(permission[1]))) if permission[1] else dict()),
    # ** (dict(extraxx=in_op(or_all(permission[1]))) if permission[1] else dict()),


def is_owner():
    """
    Check if the user is the bot's application owner.
    :return: Check decorator.
    """
    return sdev_only()


def bot_has_this_channel_permissions(**perms):
    return commands.bot_has_permissions(**perms)  # is same thing


def bot_has_one_channel_permissions(**perms):
    """
    Ensure that the bot has certain permissions in at least one of the channels of the server.
    :param perms: The permissions to check.
    :return: The check decorator.
    """
    def predicate(ctx: "SContext"):
        missing = list(perms.keys())
        for channel in ctx.guild.channels:
            perm_l: discord.Permissions = channel.permissions_for(ctx.me)
            for perm, val in perms:
                if getattr(perm_l, perm) == val and perm in missing:
                    missing.remove(perm)
        if len(missing) < 1:
            raise BotMissingOneChannelPermissions(missing_perms=missing)
        return True

    return commands.check(predicate)
