import random
import re
import discord
from discord.ext import commands
from classes import scommand, SContext
from constants import FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE

class Fun(commands.Cog):

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @scommand(name='scramble', description="Scramble a text's letters.")
    async def scramble(self, ctx: SContext, *, text: str):
        letters = list("".join(re.split(r'\s+', text)))
        random.shuffle(letters)

        new_text = ""
        j = 0
        for i in range(len(text)):
            char = text[i]
            if re.fullmatch(r'\s', char):
                j -= 1  # keep index 2 as is, because `letters` excludes whitespaces.
                new_text += char
            else:
                new_text += letters[j]
            j += 1
        fmt = ">>> __**Scrambled Text**__\n{}"
        await ctx.send(fmt.format(new_text[:(2000 - (len(fmt) - 2))]), deletable=True)

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @scommand(name='rearrange', description="Rearrange a text's words' letters.")
    async def rearrange(self, ctx: SContext, *, text: str):
        arrs = [list(part) for part in re.split(r'\s+', text)]
        for i in range(len(arrs)):
            random.shuffle(arrs[i])

        new_text = ""
        for i in range(len(text)):
            char = text[i]
            if (match := re.fullmatch(r'\s', char)) or i == len(text) - 1:
                new_text += "".join(arrs.pop(0))
                if match:
                    new_text += char

        fmt = ">>> __**Rearranged Text**__\n{}"
        await ctx.send(fmt.format(new_text[:(2000 - (len(fmt) - 2))]), deletable=True)

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @scommand(name='shuffle', description="Shuffle a text's words.")
    async def shuffle(self, ctx: SContext, *, text: str):
        origin_words = re.split(r'(\s+)', text)
        words = re.split(r'\s+', text)
        random.shuffle(words)
        new_text = ""
        for i in range(len(words)):
            new_text += words[i]
            try:
                new_text += origin_words[2 * i + 1]
            except IndexError:  # end of string
                pass

        fmt = ">>> __**Shuffled Text**__\n{}"
        await ctx.send(fmt.format(new_text[:(2000 - (len(fmt) - 2))]), deletable=True)

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @scommand(name='reverse', aliases=["rev"], description="Reverse a piece of text.")
    async def reverse(self, ctx: SContext, *, text: str):
        fmt = ">>> __**Reversed Text**__\n{}"
        await ctx.send(fmt.format(text[::-1][:(2000 - (len(fmt) - 2))]), deletable=True)


def setup(bot: commands.Bot):
    bot.add_cog(Fun(bot))