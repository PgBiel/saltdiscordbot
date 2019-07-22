"""
Check things.
"""
# import discord
from discord.ext import commands

def is_owner() -> bool:
  def do_check(ctx: commands.Context) -> bool:
    return ctx.author.id == ctx.bot.config["owner"]
  
  return commands.check(do_check)