import random
import re
import discord
from discord.ext import commands
from classes import scommand, SContext
from constants import (
    FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, EIGHT_BALL_ANSWERS, UPPER_MAP, SUPEXPONENT_REGEX
)
from utils.advanced import require_salt_permission


class Fun(commands.Cog):

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("scramble", default=True)
    @scommand(name='scramble', description="Scramble a text's letters.")
    async def scramble(self, ctx: SContext, *, text: str):
        letters = list("".join(re.split(r'\s+', text)))  # get only letters to keep word order
        random.shuffle(letters)  # shuffle the letter order - here, we use letters from the whole string. (in this case,
        #                                                                                  letter = non-whitespace char)

        new_text = ""
        j = 0  # get `letters` index, which excludes whitespaces.
        for i in range(len(text)):
            char = text[i]
            if re.fullmatch(r'\s', char):
                j -= 1  # keep index 2 as is, because `letters` excludes whitespaces.
                new_text += char  # add this whitespace because there was a word either before or after here (or both).
            else:
                new_text += letters[j]  # this is a letter so let's add it too.
            j += 1
        fmt = ">>> __**Scrambled Text**__\n{}"
        await ctx.send(fmt.format(new_text[:(2000 - (len(fmt) - 2))]), deletable=True)

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("rearrange", default=True)
    @scommand(name='rearrange', description="Rearrange a text's words' letters.")
    async def rearrange(self, ctx: SContext, *, text: str):
        arrs = [list(part) for part in re.split(r'\s+', text)]  # list with each of the words in the string.
        for i in range(len(arrs)):
            random.shuffle(arrs[i])  # we shuffle the words in place.

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
    @require_salt_permission("shuffle", default=True)
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
    @require_salt_permission("reverse", default=True)
    @scommand(name='reverse', aliases=["rev"], description="Reverse a piece of text.")
    async def reverse(self, ctx: SContext, *, text: str):
        fmt = ">>> __**Reversed Text**__\n{}"
        await ctx.send(fmt.format(text[::-1][:(2000 - (len(fmt) - 2))]), deletable=True)

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("8ball", default=True)
    @scommand(name='8ball', aliases=['eightball'], description="Ask away!")
    async def eight_ball(self, ctx: SContext, *, question: str):                   # math to keep the same 8ball answer
        chars = list(question.upper())  # uppercase so it is case insensitive      # for the same question for same user
        letters = list(filter(lambda x: re.fullmatch(r'[A-Z\d]', x), chars))  # filter letters and/or digits
        n = len(EIGHT_BALL_ANSWERS)  # amount of choices
        charcodes = [ord(letter) % n for letter in letters]  # transform into char codes mod n
        id_factor = ctx.author.id % n  # also weigh in the user ID mod n
        answer_index = (sum(charcodes) + id_factor) % n  # there we go!
        await ctx.send(f">>> __**8ball Response**__\n{EIGHT_BALL_ANSWERS[answer_index]}", deletable=True)

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("numupper", default=True)
    @scommand(
        name='numupper', description="Convert numbers to their equivalent superscript characters.",
        example="{p}numupper 1234567890"
    )
    async def numupper(self, ctx: SContext, *, numbers: str):
        new_text = "".join([(UPPER_MAP[d] if d in UPPER_MAP else d) for d in numbers])
        fmt = ">>> __**Numupper Result**__\n{}"
        await ctx.send(fmt.format(new_text[:2000 - (len(fmt) - 2)]), deletable=True)

    @commands.cooldown(FUN_DEFAULT_COOLDOWN_PER, FUN_DEFAULT_COOLDOWN_RATE, commands.BucketType.member)
    @require_salt_permission("supexponent", default=True)
    @scommand(
        name='supexponent', description="Smartly convert exponents to their equivalent superscript characters.",
        example="{p}supexponent 2^24 + 2^-543"
    )
    async def supexponent(self, ctx: SContext, *, numbers: str):
        def replace(match):
            expr = match.group("content")
            return "".join([(UPPER_MAP[d] if d in UPPER_MAP else d) for d in expr]).strip('()')

        new_text = re.sub(
            SUPEXPONENT_REGEX,
            replace,
            numbers
        )

        fmt = ">>> __**Supexponent Result**__\n{}"
        await ctx.send(fmt.format(new_text[:2000 - (len(fmt) - 2)]), deletable=True)


def setup(bot: commands.Bot):
    bot.add_cog(Fun(bot))
