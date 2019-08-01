import unicodedata
import datetime
import re
import discord
from discord.ext import commands
from classes import scommand, SContext
from typing import List, Union, Optional, cast


def get_now():
    return datetime.datetime.now()


class Utility(commands.Cog):

    @scommand(name="len", aliases=["length"], description="Tells you the length of your message.")
    async def len(self, ctx: SContext, *, text: str):
        await ctx.send(f"Your text is **{len(text)} chars** long.")  # Self-explanatory

    @scommand(name="char", aliases=["character"], description="Provides info about a unicode character.")
    async def char(self, ctx: SContext, *, characters: str):
        char_list: List[str] = list(characters.replace("\n", ""))[:10]  # Max length: 10
        text = ""
        for char in char_list:  # let's check each char
            try:
                name = unicodedata.name(char)  # Get the char name
            except ValueError:
                name = None
            digit = "{0:x}".format(ord(char))  # Get the unicode digit in hex
            text += "``{0} {1} `` - {2} {3} - \\U{4:0>8}\n".format(
                "\u200b " if name in ("GRAVE ACCENT", "SPACE") else "", char, name or "(no name)",
                " " if name == "COMBINING ENCLOSING KEYCAP" else "",
                digit  # If is grave accent or space, the `` thing doesn't form properly.
            )

        await ctx.send(text[:2000], deletable=True)

    @commands.cooldown(2, 1, commands.BucketType.member)
    @scommand(name="ping", description="Check the bot's connection to Discord.")
    async def ping(self, ctx: SContext):
        before = get_now()  # Test ping. Before
        msg = await ctx.trigger_typing()  # Do some random action to test ping
        after = get_now()   # After random action.
        ping_delta = after-before  # Subtract to get delay.
        ping: int = int(  # Now let's calculate it like for real.
            ping_delta.days * 24 * 60 * 60 * 1000 + ping_delta.seconds * 1000 + ping_delta.microseconds / 1000
        )
        if ping <= 0:  # Ratings
            rating: str = "IMPOSSIBLE to be achieved..."
        elif 0 < ping <= 50:
            rating: str = "extremely fast!"
        elif 50 < ping <= 100:
            rating: str = "very, very fast!"
        elif 100 < ping <= 200:
            rating: str = "quite fast."
        elif 200 < ping <= 300:
            rating: str = "sort of fast."
        elif 300 < ping <= 400:
            rating: str = "sort of slow."
        elif 400 < ping <= 500:
            rating: str = "pretty slow."
        elif 500 < ping <= 750:
            rating: str = "very slow."
        else:
            rating: str = "extremely slow."

        await ctx.send("Pong! The ping is {0}ms. I'd say it is {1}".format(
            ping, rating
        ))


def setup(bot: commands.bot):
    bot.add_cog(Utility(bot))
