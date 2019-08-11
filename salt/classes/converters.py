"""
Custom Salt Converters.
"""
import discord
import re
import typing
from typing import List, Union, Optional, TypeVar, Type
from discord.ext import commands
from discord.ext.commands.converter import _get_from_guilds
from classes import SContext, AutoCancelledException
from constants.regex import USER_MENTION
from utils.funcs import caseless_contains, normalize_contains
from utils.advanced import match_id, search_user_or_member, ambiguity_solve, search_role, search_channel


class GetSContextAttr:
    def __init__(self, attr: str):
        self.attr = attr

    def get_from_context(self, ctx: SContext):
        return getattr(ctx, self.attr)


class AmbiguityCancelled:
    pass


class ConverterFailed:
    pass


AMBIG_CANCELLED = AmbiguityCancelled()  # Constant returned when ambiguity solve was cancelled
CONVERT_FAILED = ConverterFailed()  # Constant returned when converting failed


class AmbiguityMemberConverter(commands.MemberConverter):
    """
    Converter that searches for members and prompts the user in case of multiple matches.
    """
    def __init__(
            self, *, case_insensitive: bool = True,
            default: Optional[Union[discord.Member, GetSContextAttr]] = None,
            return_ambig_cancel: bool = False,
            return_convert_failed: bool = False
    ):
        """
        :param case_insensitive: Whether to have a case insensitive search, defaults to True.
        :param default: A default value to return if converting failed; 'None' makes it throw.
        :param return_ambig_cancel: Whether to return AMBIG_CANCELLED constant if ambiguity was cancelled. Default:
            False.
        :param return_convert_failed: Whether to reutrn CONVERT_FAILED constant if converting failed. Default: False.
        """
        super().__init__()
        self.case_insensitive: bool = case_insensitive
        self.default = default

        if return_convert_failed:
            self.default = CONVERT_FAILED

        self.return_ambig_cancel = return_ambig_cancel

    async def convert(self, ctx: SContext, argument: str):
        """
        Slightly modified MemberConverter#convert
        :param ctx: The context
        :param argument: The argument to convert.
        :return: The found member.
        :raises commands.BadArgument: if the member was not found.
        """
        guild = ctx.guild
        bot = ctx.bot
        result = None
        insensitive = self.case_insensitive
        if guild:
            matched_id = match_id(argument, mention_regex=USER_MENTION)
            if matched_id:
                result = guild.get_member(matched_id)
                if result:
                    return result
            members: List[discord.Member] = guild.members
            operation = caseless_contains if insensitive else normalize_contains
            possibilities = search_user_or_member(argument, members, operation=operation)

            if len(possibilities) == 1:
                return possibilities[0]

            if len(possibilities) > 1:
                if len(possibilities) > 11:
                    raise commands.BadArgument("Too many possibilities of members (>11), be more specific.")
                result, cancelled = await ambiguity_solve(
                    ctx=ctx, subjects=possibilities, type_name="member"
                )
                if cancelled:
                    if self.return_ambig_cancel:
                        return AMBIG_CANCELLED
                    elif self.default is not None:
                        if isinstance(self.default, GetSContextAttr):
                            return self.default.get_from_context(ctx)
                        else:
                            return self.default
                    else:
                        raise AutoCancelledException(converter=AmbiguityMemberConverter)
                return result
        else:
            if user_id := match_id(argument, mention_regex=USER_MENTION):
                result = _get_from_guilds(bot, 'get_member', user_id)
            else:
                result = _get_from_guilds(bot, 'get_member', user_id)

        if result is None:
            fmt = 'Member "{}" not found'
            text = fmt.format("<too big to display>" if 2000-len(fmt)-len(argument)+2 < 0 else argument)
            if self.default is not None:
                if isinstance(self.default, GetSContextAttr):
                    return self.default.get_from_context(ctx)
                else:
                    return self.default
            else:
                raise commands.BadArgument(text)

        return result


class AmbiguityUserOrMemberConverter(AmbiguityMemberConverter):
    """
    Search for users that aren't in the guild necessarily, allowing an ambiguity solve.
    """
    def __init__(
            self, *, case_insensitive: bool = True,
            default: Optional[Union[discord.Member, discord.User, GetSContextAttr]] = None,
            return_ambig_cancel: bool = False,
            return_convert_failed: bool = False
    ):
        """
        :param case_insensitive: Whether to have a case insensitive search, defaults to True.
        :param default: A default value to return if converting failed; 'None' makes it throw.
        :param return_ambig_cancel: Whether to return AMBIG_CANCELLED constant if ambiguity was cancelled. Default:
            False.
        :param return_convert_failed: Whether to reutrn CONVERT_FAILED constant if converting failed. Default: False.
        """
        super().__init__(case_insensitive=case_insensitive, return_ambig_cancel=return_ambig_cancel)
        self.default = default
        if return_convert_failed:
            self.default = CONVERT_FAILED

    async def convert(self, ctx: SContext, argument: str) -> Union[discord.Member, discord.User]:
        matched_id = match_id(argument, mention_regex=USER_MENTION)
        if matched_id:
            got_member = None
            if ctx.guild is not None and (got_member := ctx.guild.get_member(matched_id)):
                return got_member
            if found_user := ctx.bot.get_user(matched_id):
                return found_user
            try:
                if fetched_user := (await ctx.bot.fetch_user(matched_id)):
                    return fetched_user
            except discord.HTTPException:
                pass
        return await super().convert(ctx=ctx, argument=argument)


class AmbiguityRoleConverter(commands.RoleConverter):
    """
    Search for a role in a guild, allowing an ambiguity solve.
    """
    def __init__(
        self, *, default: Optional[Union[discord.Role, GetSContextAttr]] = None,
        return_ambig_cancel: bool = False,
        return_convert_failed: bool = False
    ):
        """
        :param default: A default value to return if converting failed; 'None' makes it throw.
        :param return_ambig_cancel: Whether to return AMBIG_CANCELLED constant if ambiguity was cancelled. Default:
            False.
        :param return_convert_failed: Whether to reutrn CONVERT_FAILED constant if converting failed. Default: False.
        """
        super().__init__()
        self.default = default
        if return_convert_failed:
            self.default = CONVERT_FAILED
        self.return_ambig_cancel = return_ambig_cancel

    async def convert(self, ctx: SContext, argument: str):
        results = search_role(argument, ctx.guild.roles)
        fmt = 'Role "{}" not found.'
        text = fmt.format("<too big to display>" if 2000-len(fmt)-len(argument)+2 < 0 else argument)

        def return_or_raise():  # if there is a default, return it, otherwise throw role not found error
            if self.default is not None:
                if isinstance(self.default, GetSContextAttr):
                    return self.default.get_from_context(ctx)
                else:
                    return self.default
            else:
                raise commands.BadArgument(text)

        if results is None or len(results) == 0:
            return return_or_raise()  # no role was found
        if len(results) == 1:
            return results[0]
        if len(results) > 1:
            if len(results) > 11:
                raise commands.BadArgument("Too many possibilities of roles (>11), be more specific.")
            result, cancelled = await ambiguity_solve(
                ctx=ctx, subjects=results, type_name="role"
            )
            if cancelled:
                if self.return_ambig_cancel:
                    return AMBIG_CANCELLED
                elif self.default is not None:
                    return return_or_raise()
                else:
                    raise AutoCancelledException(converter=self.__class__)
            return result
        # if we reached this point, means no role was found.
        return return_or_raise()

# class InsensitiveMemberConverter(commands.MemberConverter):
#     async def convert(self, ctx: SContext, argument: str):  # TODO: Decide what to do with this


# class SearchableMember(commands.MemberConverter):
#     async def convert(self, ctx: SContext, argument: str):
#         try:
#             return await super().convert(ctx, argument)
#         except commands.BadArgument as err:
#             pass # TODO: Integrate as search= argument in Ambiguity.
