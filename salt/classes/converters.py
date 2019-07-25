"""
Custom Salt Converters.
"""
from discord.ext import commands
from classes import SContext


class SMemberConverter(commands.MemberConverter):  # WIP
    async def convert(self, ctx: SContext, argument: str):
        try:
            return await super().convert(ctx, argument)
        except commands.BadArgument:
            pass # TODO: Finish this
