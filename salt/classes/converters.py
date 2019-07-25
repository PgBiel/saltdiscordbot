"""
Custom Salt Converters.
"""
import discord
import re
import typing
from typing import List
from discord.ext import commands
from discord.ext.commands.converter import _get_from_guilds
from classes import SContext
from constants.regex import USER_MENTION
from utils import caseless_equal, normalize_equal, match_id, search_user_or_member


class AmbiguityMemberConverter(commands.MemberConverter):
    def __init__(self, *, case_insensitive: bool = True):
        super().__init__()
        self.case_insensitive: bool = case_insensitive

    async def convert(self, ctx: SContext, argument: str, insensitive: bool = False):
        """
        Slightly modified MemberConverter#convert
        :param ctx: The context
        :param argument: The argument to convert.
        :param insensitive: Whether it should be case-insensitive.
        :return:
        """
        guild = ctx.guild
        result = None
        if guild:
            matched_id = match_id(argument, mention_regex=USER_MENTION)
            if matched_id:
                result = guild.get_member(matched_id)
                if result:
                    return result
            members: List[discord.Member] = guild.members
            possibilities = search_user_or_member(argument, members)

            if len(possibilities) == 1:
                return possibilities[0]

            if len(possibilities) > 1:
                if len(possibilities) > 11:
                    raise commands.BadArgument("Too many possibilities of members (>11), be more specific.")
                # ...
            # TODO: Add ambiguity solve menu.
            else:
                result = _get_from_guilds(bot, 'get_member_named', argument)
        else:
            # WIP
            user_id = int(match.group(1))
            if guild:
                result = guild.get_member(user_id)

            else:
                result = _get_from_guilds(bot, 'get_member', user_id)

        if result is None:
            raise commands.BadArgument('Member "{}" not found'.format(argument))

        return result

# class InsensitiveMemberConverter(commands.MemberConverter):
#     async def convert(self, ctx: SContext, argument: str):  # TODO: Decide what to do with this


class SearchableMember(commands.MemberConverter):
    async def convert(self, ctx: SContext, argument: str):
        try:
            return await super().convert(ctx, argument)
        except commands.BadArgument as err:
            pass # TODO: Integrate as search= argument in Ambiguity.