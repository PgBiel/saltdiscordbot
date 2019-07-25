"""
Some testing commands.
"""
import asyncio
from discord.ext import commands
from classes import scommand


class Test(commands.Cog):
    """
    The Test cog.
    """
    @scommand(pass_context=True, name="test")
    async def test(self, ctx: commands.Context) -> None:
        """
        Just testin'
        """
        await ctx.send(content="Hey")


def setup(bot: commands.Bot) -> None:
    """
    Setup the cog to the bot
    """
    bot.add_cog(Test(bot))