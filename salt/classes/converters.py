"""
Custom Salt Converters.
"""
import discord
import re
import typing
from typing import List, Union
from discord.ext import commands
from discord.ext.commands.converter import _get_from_guilds
from classes import SContext, AutoCancelledException
from constants.regex import USER_MENTION
from utils.funcs import caseless_contains, normalize_contains
from utils.advanced import match_id, search_user_or_member, ambiguity_solve, search_role, search_channel


class AmbiguityMemberConverter(commands.MemberConverter):
    """
    Converter that searches for members and prompts the user in case of multiple matches.
    """
    def __init__(self, *, case_insensitive: bool = True):
        super().__init__()
        self.case_insensitive: bool = case_insensitive

    async def convert(self, ctx: SContext, argument: str) -> Union[discord.Member, discord.User]:
        """
        Slightly modified MemberConverter#convert
        :param ctx: The context
        :param argument: The argument to convert.
        :return: The found member.
        :raises: commands.BadArgument: if the member was not found.
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
            raise commands.BadArgument(text)

        return result


class AmbiguityUserOrMemberConverter(AmbiguityMemberConverter):
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

    async def convert(self, ctx: SContext, argument: str):
        results = search_role(argument, ctx.guild.roles)
        fmt = 'Role "{}" not found.'
        text = fmt.format("<too big to display>" if 2000-len(fmt)-len(argument)+2 < 0 else argument)
        if results is None or len(results) == 0:
            raise commands.BadArgument(text)
        if len(results) == 1:
            return results[0]
        if len(results) > 1:
            if len(results) > 11:
                raise commands.BadArgument("Too many possibilities of roles (>11), be more specific.")
            result, cancelled = await ambiguity_solve(
                ctx=ctx, subjects=results, type_name="role"
            )
            if cancelled:
                raise AutoCancelledException(converter=self.__class__)
            return result
        raise commands.BadArgument(text)

# class InsensitiveMemberConverter(commands.MemberConverter):
#     async def convert(self, ctx: SContext, argument: str):  # TODO: Decide what to do with this


# class SearchableMember(commands.MemberConverter):
#     async def convert(self, ctx: SContext, argument: str):
#         try:
#             return await super().convert(ctx, argument)
#         except commands.BadArgument as err:
#             pass # TODO: Integrate as search= argument in Ambiguity.
