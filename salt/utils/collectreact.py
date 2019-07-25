"""
WIP
"""

import discord
from discord.ext import commands
from classes import SContext
import asyncio
import typing
from typing import Union, Optional, Callable, Sequence

async def collectreact(
  emoji: Sequence[Union[str, discord.Emoji]], ctx: SContext, msg: discord.Message, *, timeout: float,
  check: Optional[Callable[..., bool]]
) -> bool:
    """|coro|
    Collect reactions."""
    # WIP
    # def reaccheck(reaction: discord.Reaction, user: discord.User):
    #     return user == ctx.author and reaction.emoji == emoji # WASTEBASKET
    #
    # try:
    #     await msg.add_reaction(emoji)
    # except discord.Forbidden as e:
    #     return msg
    #
    # try:
    #     reaction, user = await ctx.bot.wait_for("reaction_add", timeout=timeout, check=check)
    # except asyncio.TimeoutError as e:
    #      pass
     def delcheck(reaction: discord.Reaction, member: Union[discord.Member, discord.User]):
         return member.id != ctx.bot.user.id \
                and msg.id == reaction.message.id \
                and msg.channel == reaction.message.channel \
                and (
                            member == ctx.author or
                            (member.permissions_in(ctx.channel).manage_messages if ctx.guild != None else False)
                    ) \
                and str(reaction.emoji) == WASTEBASKET

     try:
         await msg.add_reaction(WASTEBASKET)
     except discord.Forbidden as _e:
         return msg

     async def waiting_for():
         try:
             await ctx.bot.wait_for("reaction_add", timeout=DELE_TIMEOUT, check=delcheck)
         except asyncio.TimeoutError:
             await msg.remove_reaction(WASTEBASKET, ctx.me)
         else:
             await msg.delete()

     ctx.bot.loop.create_task(waiting_for())
