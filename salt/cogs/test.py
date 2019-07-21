from discord.ext import commands
import discord

class Test(commands.Cog):
  @commands.Command()
  def test(self, ctx: commands.Context):
    ctx.send(content="Hey")