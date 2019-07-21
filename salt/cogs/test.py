from discord.ext import commands
import discord
import asyncio

class Test(commands.Cog):
  @commands.command(pass_context=True, name="test")
  async def test(self, ctx: commands.Context):
    await ctx.send(content="Hey")

def setup(bot):
  bot.add_cog(Test(bot))