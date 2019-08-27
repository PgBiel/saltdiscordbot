"""
Check things.
"""
import asyncio
import motor.motor_asyncio
import motor.core
import discord
import typing
from pymongo import ASCENDING, DESCENDING
from typing import Any, Callable, List, Union, Coroutine, Sequence
from discord.ext import commands
from utils.funcs import sync_await, permission_literal_to_tuple, dict_except, get_bot
from classes import PermsModel, PartialPermsModel, in_op, or_op
from classes.scommand import SCommand, SGroup
from classes.errors import (
    SaltCheckFailure, MissingSaltModRole, NoConfiguredSaltModRole, MissingSaltAdminRole, NoConfiguredSaltAdminRole,
    BotMissingOneChannelPermissions, MissingSaltPermissions
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
        curr_attribs = getattr(func, "__scmd_attribs__", dict())
        conflict_solver = dict()  # some properties add up instead of being set
        if "perms_used" in sattribs:
            conflict_solver["perms_used"] = curr_attribs.get("perms_used", []) + sattribs["perms_used"]

        curr_attribs.update(sattribs)
        curr_attribs.update(conflict_solver)
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
        checks: List[Callable[["SContext"], bool]] = getattr(func, "__commands_checks__", [])
        predicates.extend(checks[len(checks) - len(decorators):len(checks)])
        if checks:
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


IDABLE_TYPE = Union[
    discord.User, discord.Member, discord.abc.PrivateChannel, discord.abc.GuildChannel, discord.Role, discord.Guild,
    discord.Object, discord.abc.Snowflake  # anything that has a .id
]


async def has_permission(
        ctx: "SContext",
        idable: IDABLE_TYPE, permission: Union[str, typing.Tuple[str, ...]],
        *, obj_type: typing.Optional[str] = None, default: bool = False,
        cog_name: typing.Optional[str] = None,
        user_check_context: bool = False
) -> bool:  # TODO: Finish this; make perm check that adds to bot perms array; make perm command and stuff
    """
    Check if something has a salt permission.
    Hierarchy, if user_check_context is True:

    - User (highest priority)
    - Role
    - Channel
    - Guild (lowest priority)

    e.g. Permission  comm sub subsub subsubsub  will be affected by, in order:

    - all
    - comm all
    - comm sub all
    - comm sub subsub all
    - comm sub subsub subsubsub

    :param ctx: Context in which to check.
    :param idable: Anything that has a id; preferably a User, Member, Channel, Role or Guild object.
    :param permission: The permission literal or the tuple.
    :param obj_type: (Optional str) One of "member", "channel", "role" or "guild", if idable is not
        one of those objects.
    :param default: (Optional bool=False) Whether or not the object can use this command by default.
    :param cog_name: (Optional str) The cog the command is in to check for cog-wide overrides.
    :param user_check_context: (Optional bool) Whether or not we should recursively check for permissions in the
        hierarchy (user -> role -> channel -> guild) - Default is only returned after we check for guild.
    :return: (bool) Whether or not it has permission.
    :raises TypeError: If a non-User/Member/Channel/Role/Guild object was passed in `idable` and no valid `obj_type`
        was passed to help identify which type it is.
    """
    if not ctx.guild:
        return True  # you can do whatever you want!
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

    if obj_type == 'member' and (id_n in ctx.bot.config["owners"] or id_n == ctx.bot.owner_id):
        return True

    if type(permission) == str:
        permission = permission_literal_to_tuple(permission)

    is_cog: bool = False
    is_custom: bool = False
    if permission[0] in ('cog', '-cog'):
        permission = permission[1:]
        if cog_name:
            is_cog = True

    elif permission[0] in ('custom', '-custom'):  # can't be custom command and cog at the same time, right???
        permission = permission[1:]
        is_custom = True

    def in_or_all(*names: str):
        return in_op([*names, "all", "*"])

    command = permission[0]
    extra = permission[1] if len(permission) >= 2 else None
    extrax = permission[2] if len(permission) >= 3 else None
    extraxx = permission[3] if len(permission) >= 4 else None

    basic = PartialPermsModel(
        guild_id=str(ctx.guild.id), id=str(id_n), type=obj_type,
        is_custom=is_custom,
        command=command, is_cog=is_cog if is_cog else False,
        extra=None, extrax=None, extraxx=None
    )

    def b_copy_as_dict(**attrs):
        copied = basic.copy()
        for k, v in attrs.items():
            setattr(copied, k, v)

        return copied.as_dict()

    # is_cog if is_cog else ({"$in": [True, False]} if cog_name else False - Saving for later
    matched_cursor: motor.motor_asyncio.AsyncIOMotorCursor = ctx.db['perms'].find(
        or_op([
            b_copy_as_dict(command=("all" if extra else in_or_all(command))),
            *([b_copy_as_dict(command=cog_name, is_cog=True, is_custom=False)] if cog_name else []),
            *([b_copy_as_dict(extra=("all" if extrax else extra))] if extra else []),
            *([b_copy_as_dict(extra=extra, extrax=("all" if extraxx else extrax))] if extrax else []),
            *([b_copy_as_dict(extra=extra, extrax=extrax, extraxx=in_or_all(extraxx))] if extraxx else []),
        ]),
        sort=[('command', ASCENDING), ('extra', ASCENDING), ('extrax', ASCENDING), ('extraxx', ASCENDING)]
    )
    matched: List[dict] = await matched_cursor.to_list(5)  # max amount of documents this can have is 5.

    if len(matched) == 0:
        if user_check_context and obj_type != "guild":  # after guild we stop looking for permissions
            NEXT = dict(
                member="role",
                role="channel",
                channel="guild",
                guild=None
            )
            next = NEXT.get(obj_type)
            if next:
                new_idable: IDABLE_TYPE
                if next == 'role':
                    new_idable = idable.top_role
                elif next == 'channel':
                    new_idable = ctx.channel
                elif next == 'guild':
                    new_idable = ctx.guild
                return await has_permission(
                    ctx, new_idable, permission, obj_type=next, default=default,
                    cog_name=cog_name, user_check_context=True
                )
        else:
            return bool(default or False)

    def sorting_key(perm_dict) -> str:
        perm_model = PartialPermsModel(**dict_except(perm_dict, "_id"))
        space_num = 10 if perm_model.command == 'all' else (
            7 if perm_model.is_cog else (
                5 if perm_model.extra == 'all' else (
                    4 if perm_model.extrax == 'all' else (
                        3 if perm_model.extraxx == 'all' else 0
                    )
                )
            )
        )
        space = " "  # gotta prefix spaces to ensure correct sorting (all goes first, then ... all, then   and so on
        indent = space * space_num
        return f"{indent}{perm_model.to_literal().strip()}"

    in_order = sorted(matched, key=sorting_key)
    highest_priority_override = in_order[0]
    return not highest_priority_override.get("is_negated", False)

    # command = typing.cast(str, in_op(or_all(permission[0]))),
    # ** (dict(extra=in_op(or_all(permission[1]))) if permission[1] else dict()),
    # ** (dict(extrax=in_op(or_all(permission[1]))) if permission[1] else dict()),
    # ** (dict(extraxx=in_op(or_all(permission[1]))) if permission[1] else dict()),


def require_salt_permission(
        perm: Union[str, typing.Tuple[str, ...]],
        *, default: bool = False, also_uses: typing.Tuple[str, ...] = tuple(),
        just_check_if_negated: bool = False
):
    """
    Require the user to have certain permissions.
    :param perm: Permission required. (Permission literal or tuple)
    :param default: (Optional bool=False) Whether or not the member has this permission by default.
    :param also_uses: (Optional tuple) List of extra permissions that the command may check for but are not
        required for the execution of the command. This is used so that the bot can have an updated list of
        permissions.
    :param just_check_if_negated: (Optional bool=False) Whether or not we're just checking for negation. If True,
        the `default` parameter is ignored and set to `True`.
    :return: The decorator.
    """
    async def predicate(ctx: "SContext"):
        can_use = await has_permission(
            ctx, ctx.author, permission=perm, obj_type="member", default=True if just_check_if_negated else default,
            cog_name=ctx.cog.__class__.__name__ if ctx.cog else None, user_check_context=True
        )
        if not can_use:
            raise MissingSaltPermissions(missing_perms=[perm])

        return True

    perms_used = [perm, *(also_uses or [])]
    bot = get_bot()
    if bot:
        for prm in perms_used:
            if type(prm) == str:
                prm = permission_literal_to_tuple(prm)

            if prm not in bot.saved_permissions:
                bot.saved_permissions.append(prm)
    else:
        print("(BOT NOT FOUND ON PERM CHECK.)")

    return scheck(predicate, **(dict(perms_used=perms_used) if not just_check_if_negated else dict()))


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
