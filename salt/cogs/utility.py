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
        await ctx.send(f"Your text is **{len(text)} chars** long.")

    @scommand(name="char", aliases=["character"], description="Provides info about a unicode character.")
    async def char(self, ctx: SContext, *, characters: str):
        char_list: List[str] = list(characters.replace("\n", ""))[:10]  # Max length: 10
        text = ""
        for char in char_list:
            try:
                name = unicodedata.name(char)
            except ValueError:
                name = None
            digit = "{0:x}".format(ord(char))
            text += "``{0} {1} `` - {2} {3} - \\U{4:0>8}\n".format(
                "\u200b " if name in ("GRAVE ACCENT", "SPACE") else "", char, name or "(no name)",
                " " if name == "COMBINING ENCLOSING KEYCAP" else "",
                digit
            )

        await ctx.send(text[0:2000], deletable=True)

    @scommand(name="ping", description="Check the bot's connection to Discord.")
    async def ping(self, ctx: SContext):
        before = get_now()
        msg = await ctx.trigger_typing()
        after = get_now()
        ping_delta = after-before
        ping: int = int(
            ping_delta.days * 24 * 60 * 60 * 1000 + ping_delta.seconds * 1000 + ping_delta.microseconds / 1000
        )
        if ping <= 0:
            rating: str = "IMPOSSIBLE to be achieved..."
        elif 0 < ping <= 50:
            rating: str = "extremely fast!"
        elif 50 < ping <= 100:
            rating: str = "very, very fast!"
        elif 100 < ping <= 200:
            rating: str = "very fast."
        elif 200 < ping <= 300:
            rating: str = "rather fast."
        elif 300 < ping <= 400:
            rating: str = "sort of slow."
        elif 400 < ping <= 500:
            rating: str = "slow."
        elif 500 < ping <= 750:
            rating: str = "very slow."
        else:
            rating: str = "extremely slow."

        await ctx.send("Pong! The ping is {0}ms. I'd say it is {1}".format(
            ping, rating
        ))


def setup(bot: commands.bot):
    bot.add_cog(Utility(bot))
