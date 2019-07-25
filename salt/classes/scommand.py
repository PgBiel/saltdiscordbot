from discord.ext import commands
from typing import Type, Any, Optional


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


def scommand(name: str, *, cls: Optional[Type[Any]] = SCommand, **attrs):
    return commands.command(name, cls=cls, **attrs)
