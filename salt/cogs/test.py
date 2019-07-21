from discord.ext import commands
import discord
import asyncio

class Test(commands.Cog):
  @commands.command(pass_context=True, name="test")
  async def test(self, ctx: commands.Context) -> None:
    await ctx.send(content="Hey")

def setup(bot: commands.Bot) -> None:
  bot.add_cog(Test(bot))