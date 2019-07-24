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
    pass


class SaltCheckFailure(SaltException, commands.errors.CheckFailure):
    pass


class MissingSaltModRole(SaltCheckFailure):
    pass


class MissingSaltAdminRole(SaltCheckFailure):
    pass


class MissingSaltPermissions(SaltCheckFailure):
    pass


class NoPermissions(SaltCheckFailure):
    """
    Occurs when there are missing permissions because you have absolutely no permission!
    """
    pass
