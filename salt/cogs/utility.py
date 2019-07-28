import unicodedata
import discord
from discord.ext import commands
from classes import scommand, sgroup, SContext, AmbiguityUserOrMemberConverter
from typing import List, Union, cast


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

    @sgroup(name="info", description="Provides info about something.")
    async def info(self, ctx: SContext):
        pass

    @info.command(name="user", description="View info about an user.")
    async def info_user(self, ctx: SContext, *, member: AmbiguityUserOrMemberConverter):
        memb_or_user = cast(Union[discord.Member, discord.User], member)
        await ctx.send(f"User given: {str(memb_or_user)}")


def setup(bot: commands.bot):
    bot.add_cog(Utility(bot))
