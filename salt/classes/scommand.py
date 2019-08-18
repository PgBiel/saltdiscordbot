from discord.ext import commands
from typing import Type, Any, Optional, Callable, List, cast, TYPE_CHECKING
from utils.funcs import get_bot
import inspect

if TYPE_CHECKING:
    from classes import SContext  # be able to use the "SContext" type


class SCommand(commands.Command):
    """
    Salt's customization of the Command class.
    """
    guild_only: bool = False
    dm_only: bool = False
    dev_only: bool = False
    saltmod_usable: bool = False
    saltadmin_usable: bool = False

    def __init__(self, func, *, no_super_init: bool = False, example: Optional[str] = None, **kwargs):
        """
        Init a SCommand.

        :param func: Function receiving the decorator.
        :param no_super_init: (Optional bool) Whether we should not init commands.Command; defaults to False.
        :param example: (Optional str) Example usage.
        :param kwargs: Other arguments to provide to command init, such as name, description etc.
        """
        if not no_super_init:
            super().__init__(func, **kwargs)
        self.guild_only = self.dm_only = self.dev_only = self.saltmod_usable = self.saltadmin_usable = False
        self.example: str = example

        if hasattr(func, "__scmd_attribs__"):
            attribs: dict = func.__scmd_attribs__
            self._load_attribs(**attribs)

    # async def can_run(self, ctx: "SContext"):  # activate this later
        # if ctx.author in ctx.bot.config['owners'] or ctx.author.id == ctx.bot.owner_id:
        #     return True

    def _load_attribs(self, **attribs):
        self.guild_only = attribs.get("guild_only", self.guild_only or False)
        self.dm_only = attribs.get("dm_only", self.dm_only or False)
        self.dev_only = attribs.get("dev_only", self.dev_only or False)
        self.saltmod_usable = attribs.get("saltmod_usable", self.saltmod_usable or False)
        self.saltadmin_usable = attribs.get("saltadmin_usable", self.saltadmin_usable or False)

    def _get_attribs(self):
        return dict(
            guild_only=self.guild_only, dm_only=self.dm_only, dev_only=self.dev_only,
            saltmod_usable=self.saltmod_usable, saltadmin_usable=self.saltadmin_usable
        )

    def _ensure_assignment_on_copy(self, other: "SCommand"):
        ret: "SCommand" = super()._ensure_assignment_on_copy(other)
        ret._load_attribs(**self._get_attribs())
        return ret


class SGroup(commands.Group, SCommand):
    """
    Salt's customization of the Group class.
    """

    def __init__(self, func, **kwargs):
        commands.Group.__init__(self, func, **kwargs)
        kwargs["no_super_init"] = True
        SCommand.__init__(self, func, **kwargs)

    def command(self, *args, **kwargs):
        """A shortcut decorator that invokes scommand and adds it to
        the internal command list via add_command.
        """

        def decorator(func):
            kwargs.setdefault('parent', self)
            result = scommand(*args, **kwargs)(func)
            self.add_command(result)
            return result

        return decorator

    def group(self, *args, **kwargs):
        """A shortcut decorator that invokes sgroup and adds it to
        the internal command list via add_command.
        """

        def decorator(func):
            kwargs.setdefault('parent', self)
            result = sgroup(*args, **kwargs)(func)
            self.add_command(result)
            return result

        return decorator


def scommand(name: str, *, cls: Optional[Type[Any]] = SCommand, **attrs) -> Callable[[Callable[..., Any]], SCommand]:
    return commands.command(name, cls=cls, **attrs)


def sgroup(name: str, *, cls: Optional[Type[Any]] = SGroup, **attrs) -> Callable[[Callable[..., Any]], SGroup]:
    return commands.group(name, cls=SGroup, **attrs)
