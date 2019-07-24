"""
WIP
"""

# import discord
# from discord.ext import commands
# from classes import SContext
# import asyncio
# import typing

# async def collectreact(
#   emoji: typing.Union[str, discord.Emoji], ctx: SContext, msg: discord.Message, *, timeout: float,
#   check: typing.Optional[typing.Callable[..., bool]]
# ) -> bool:
#   """|coro|
#   Collect reactions."""
#   # WIP
#   def reaccheck(reaction: discord.Reaction, user: discord.User):
#     return user == ctx.author and reaction.emoji == emoji # WASTEBASKET
#   
#   try:
#     await msg.add_reaction(emoji)
#   except discord.Forbidden as e:
#     return msg
#   
#   try:
#     reaction, user = await ctx.bot.wait_for("reaction_add", timeout=timeout, check=check)
#   except asyncio.TimeoutError as e:
#     # ...
