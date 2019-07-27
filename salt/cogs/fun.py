from discord.ext import commands
from classes import scommand, SContext


class Fun(commands.Cog):

    @scommand(name="len", aliases=["length"], description="Tells you the length of your message.")
    async def len(self, ctx: SContext, *, text: str):
        await ctx.send(f"Your text is **{len(text)} chars** long.")


def setup(bot: commands.bot):
    bot.add_cog(Fun(bot))