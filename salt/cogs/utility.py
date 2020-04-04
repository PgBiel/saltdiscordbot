import unicodedata
import datetime
import io
import qrcode
import re
import math
import discord
from constants import UTILITY_DEFAULT_COOLDOWN_PER, UTILITY_DEFAULT_COOLDOWN_RATE
from discord.ext import commands
from classes import scommand, SContext, sgroup
from typing import List, Union, Optional, cast
from utils.funcs import plural_s
from utils.advanced import require_salt_permission

QR_COOLDOWN_PER = 1   # commands to trigger cd.
QR_COOLDOWN_RATE = 2  # seconds of cooldown
QR_CHAR_LIMIT = 1024  # chars


def get_now():
    return datetime.datetime.now()


class Utility(commands.Cog):

    @scommand(name="len", aliases=["length"], description="Tells you the length of your message.")
    @require_salt_permission("len", default=True)
    async def len(self, ctx: SContext, *, text: str):
        length = len(text)
        await ctx.send(
            f"Your text is **{length} char{plural_s(length)}** long.", deletable=True
        )  # Self-explanatory

    @commands.cooldown(UTILITY_DEFAULT_COOLDOWN_PER, UTILITY_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("char", default=True)
    @scommand(name="char", aliases=["character", "charinfo"], description="Provides info about a unicode character.")
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

    @commands.cooldown(UTILITY_DEFAULT_COOLDOWN_PER, UTILITY_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("ping", default=True)
    @sgroup(name="ping", description="Check the bot's connection to Discord.", invoke_without_command=True)
    async def ping(self, ctx: SContext):
        is_ws = getattr(ctx, "_is_ws", False)
        if is_ws:
            ping: int = int(ctx.bot.latency * 1000)
        else:
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

        await ctx.send("Pong! The {0}ping is {1}ms. I'd say it is {2}".format(
            "websocket " if is_ws else "", ping, rating
        ), deletable=True)

    @require_salt_permission("ping ws", default=True)
    @commands.cooldown(UTILITY_DEFAULT_COOLDOWN_PER, UTILITY_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @ping.command(name='ws', description="Check the bot's websocket latency.")
    async def ping_ws(self, ctx: SContext):
        ctx._is_ws = True
        await ctx.invoke(self.ping)

    # @commands.cooldown(UTILITY_DEFAULT_COOLDOWN_PER, UTILITY_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    # @require_salt_permission("ping", default=True)
    # @sgroup(name="ping", description="Check the bot's connection to Discord.", invoke_without_command=True)
    # async def calc(self, ctx: SContext):
    #

    @require_salt_permission("qr", default=True)
    @commands.cooldown(QR_COOLDOWN_PER, QR_COOLDOWN_RATE, commands.BucketType.user)
    @scommand(name="qr", description=f"Make a QR code image. (Supports up to {QR_CHAR_LIMIT} characters)")
    async def qr(self, ctx: SContext, *, content: str):
        over_max = len(content) > QR_CHAR_LIMIT
        content = content[:QR_CHAR_LIMIT]
        img = qrcode.make(content)
        byte_arr = io.BytesIO()
        img.save(byte_arr, format="PNG")
        await ctx.send(
            f"__**Generated QR Code**__\
{f' (**Warning:** string trimmed down to max of {QR_CHAR_LIMIT} chars.)' if over_max else ''}",
            file=discord.File(io.BytesIO(byte_arr.getvalue()), f"qrcode-{ctx.author.id}.png"),
            deletable=True
        )


def setup(bot: commands.bot):
    bot.add_cog(Utility(bot))
