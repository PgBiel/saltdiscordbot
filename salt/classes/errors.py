"""
Errors.
Error hierarchy:
SaltException
  +-- SaltCheckFailure
        +-- MissingSaltModRole
        +-- MissingSaltAdminRole
        +-- MissingSaltPermissions


CheckFailure            SaltException
  +-- SaltCheckFailure --+
        +-- MissingSaltModRole
        +-- MissingSaltAdminRole
        +-- MissingSaltPermissions
"""
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


class MissingSaltAdminRole(SaltCheckFailure):
    """
    The user is missing the Salt Admin role.
    """
    pass


class MissingSaltPermissions(SaltCheckFailure):
    """
    The user missing the Saltperm.
    """
    pass


class NoPermissions(SaltCheckFailure):
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
