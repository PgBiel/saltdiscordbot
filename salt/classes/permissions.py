import typing
from typing import Union, Tuple, Sequence, Iterable, Optional
from utils.funcs import permission_tuple_to_literal, permission_literal_to_tuple


class SaltPermission:
    """
    Represents a Salt Permission.
    """

    def __init__(
            self, permission: Union[Iterable[str], str],
            *, is_cog: bool = False, is_custom: bool = False, is_negated: bool = False
    ):
        """
        Init the salt permission.

        :param permission: The salt permission, either in tuple form or string form.
        :param is_cog: (Optional bool) Whether or not this is a cog-wide permission; defaults to False.
        :param is_custom: (Optional bool) Whether or not this is a custom command permission; defaults to False.
        :param is_negated: (Optional bool) Whether or not this is a negated permission; defaults to False.
        """
        self.is_cog: bool = is_cog
        self.is_custom: bool = is_custom
        self.is_negated: bool = is_negated
        self._literal: Optional[str] = None
        self._tuple: Tuple[str, ...] = permission_literal_to_tuple(permission) if type(permission) == str \
            else tuple(permission)

    @property
    def literal(self):
        if self._literal:
            return self._literal

        self._literal = permission_tuple_to_literal(
            self._tuple, is_cog=self.is_cog, is_custom=self.is_custom, is_negated=self.is_negated
        )
        return self._literal

    @literal.setter
    def literal(self, new_val: str):
        self._tuple = permission_literal_to_tuple(new_val)

    @property
    def tuple(self):
        if self._tuple:
            return self._tuple

        return tuple([])  # empty tuple

    @tuple.setter
    def tuple(self, new_val: Iterable[str]):
        self._tuple = tuple(new_val)

    def clean_literal(self):
        return permission_tuple_to_literal(self.tuple, is_cog=False, is_custom=False, is_negated=False)
