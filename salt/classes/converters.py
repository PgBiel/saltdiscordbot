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
from utils import caseless_equal, normalize


class AmbiguityMemberConverter(commands.MemberConverter):
    def __init__(self, *, case_insensitive: bool = True):
        super().__init__()
        self.case_insensitive: bool = case_insensitive

    async def convert(self, ctx: SContext, argument: str, insensitive: bool = False):
        """
        Slightly modified MemberConverter#convert
        :param ctx: The context
        :param argument: The argument to convert.
        :param insensitive: Whether it should be case
        :return:
        """
        bot = ctx.bot
        match = self._get_id_match(argument) or re.match(r'<@!?([0-9]+)>$', argument)
        guild = ctx.guild
        result = None
        if match is None:
            # not a mention...
            if guild:  # here come the changes
                if len(argument) > 5 and argument[-5] == '#':  # check if a name and discrim was specified
                    # The 5 length is checking to see if #0000 is in the string,
                    # as a#0000 has a length of 6, the minimum for a potential
                    # discriminator lookup.
                    potential_discriminator = argument[-4:]

                    # do the actual lookup and return if found
                    # if it isn't found then we'll do a full name lookup below.
                    res = discord.utils.get(
                        guild.members,
                        name=argument[:-5],
                        discriminator=potential_discriminator
                    )
                    if res is not None:
                        return res

                possibilities: List[discord.Member] = []
                norm_arg: str = normalize(argument)
                for member in guild.members:
                    member: discord.Member = member
                    nick: str = member.nick
                    name: str = member.name
                    if self.case_insensitive:
                        if caseless_equal(nick, argument) or caseless_equal(name, argument):
                            possibilities.append(member)
                    else:
                        if normalize(nick) == norm_arg or normalize(name) == norm_arg:
                            possibilities.append(member)
                if len(possibilities) > 0:
                    if len(possibilities) < 2:
                        return possibilities[0]
                    # TODO: Add ambiguity solve menu.
            else:
                result = _get_from_guilds(bot, 'get_member_named', argument)
        else:
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