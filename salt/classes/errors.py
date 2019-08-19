"""
Errors.
Error hierarchy:
SaltException
  +-- SaltCheckFailure
        +-- MissingSaltModRole
        +-- NoConfiguredSaltModRole
        +-- MissingSaltAdminRole
        +-- NoConfiguredSaltAdminRole
        +-- SaltMissingPermissions
            +-- MissingSaltPermissions
            +-- BotMissingThisChannelPermissions
            +-- BotMissingOneChannelPermissions
            +-- NoPermissions
  +-- SaltCommandException
        +-- SaltEvalException
             +-- MultilineEvalNoLastExprValue
  +-- SaltConversionError
        +-- AutoCancelledException


discord.ext.commands.CheckFailure            SaltException
                        +-- SaltCheckFailure --+

discord.ext.commands.ConversionError         SaltException
                        +-- SaltConversionError --+
"""
import discord
import typing
from discord.ext import commands


class SaltException(Exception):
    """
    Represents any custom Salt bot exceptions.
    """
    pass


class SaltCheckFailure(SaltException, commands.errors.CheckFailure):
    """
    Represents any custom Salt Check Failure exceptions.
    """
    pass


class MissingSaltModRole(SaltCheckFailure):
    """
    The user is missing the Salt Mod role.
    """
    pass


class NoConfiguredSaltModRole(SaltCheckFailure):
    """
    The server did not configure any Salt Moderator role in order to be able to check.
    """
    pass


class MissingSaltAdminRole(SaltCheckFailure):
    """
    The user is missing the Salt Admin role.
    """
    pass


class NoConfiguredSaltAdminRole(SaltCheckFailure):
    """
    The server did not configure any Salt Admin role in order to be able to check.
    """
    pass


class SaltMissingPermissions(SaltCheckFailure):
    """
    The user is missing some permissions.

    Attributes
        missing_perms: List of permissions missing, or None if unspecified.
    """
    missing_perms: typing.Optional[typing.List[str]]

    def __init__(
            self, message: typing.Optional[str] = None, *,
            missing_perms: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None
    ):
        super().__init__(message=message)
        self.missing_perms = list(missing_perms) if missing_perms else None


class MissingSaltPermissions(SaltMissingPermissions):
    """
    The user is missing the Saltperm(s).

    Attributes
        missing_perms: The list of saltperms the user is missing, or None if unknown/unspecified.
    """
    pass


class BotMissingThisChannelPermissions(SaltMissingPermissions):
    """
    The bot is missing permissions in the channel being spoken in.

    Attributes
        missing_perms: The list of permissions the bot is missing in this channel
    """


class BotMissingOneChannelPermissions(SaltMissingPermissions):
    """
    The bot is missing permissions in any of the channels in the guild. (Needs to have those permissions in at least 1)

    Attributes
        perm: The list of permissions the bot is missing in any of this guild's channels
    """


class NoPermissions(SaltMissingPermissions):
    """
    Occurs when there are missing permissions because you have absolutely none of the possible ways of using the cmd.
    """
    pass


class SaltCommandException(SaltException):
    """
    Parent for command-specific exceptions.
    """
    pass


class SaltEvalException(SaltCommandException):
    """
    Parent for `+eval`-specific exceptions.
    """
    pass


class MultilineEvalNoLastExprValue(SaltEvalException):
    """
    Represents error when the last information given to the +Eval cmd is not an expression.
    """
    pass


class SaltConversionError(SaltException, commands.ConversionError):
    """
    Related to custom Salt converters.
    """
    def __init__(self, converter: typing.Type[commands.Converter] = None, original: Exception = None):
        super().__init__(converter=converter, original=original)


class AutoCancelledException(SaltConversionError):
    """
    Occurs when the command was already cancelled and dealt with, and no further action is required.
    """
    pass
