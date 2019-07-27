from discord.ext import commands
from typing import Type, Any, Optional, Callable


class SCommand(commands.Command):
    """
    Salt's customization of the Command class.
    """
    guild_only: bool = False
    dm_only: bool = False
    dev_only: bool = False
    saltmod_usable: bool = False
    saltadmin_usable: bool = False

    def __init__(self, func, **kwargs):
        if not kwargs.pop("no_super_init", False):
            super().__init__(func, **kwargs)
        self.guild_only = self.dm_only = self.dev_only = self.saltmod_usable = self.saltadmin_usable = False

        if hasattr(func, "__scmd_attribs__"):
            attribs: dict = func.__scmd_attribs__
            self._load_attribs(**attribs)

    def _load_attribs(self, **attribs):
        self.guild_only = attribs.get("guild_only", self.guild_only or False)
        self.dm_only = attribs.get("dm_only", self.dm_only or False)
        self.dev_only = attribs.get("dev_only", self.dev_only or False)
        self.saltmod_usable = attribs.get("saltmod_usable", self.saltmod_usable or False)
        self.saltadmin_usable = attribs.get("saltadmin_usable", self.saltadmin_usable or False)


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
