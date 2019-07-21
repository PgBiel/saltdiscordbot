from discord.ext import commands
import discord
import asyncio

class Test(commands.Cog):
  @commands.Command()
  async def test(self, ctx: commands.Context):
    await ctx.send(content="Hey")