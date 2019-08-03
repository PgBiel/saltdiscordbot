import typing
from discord.ext import commands
from constants import PREFIX_LIMIT
from classes import scommand, SContext, PrefixesModel, PartialPrefixesModel
from utils.funcs import discord_sanitize


class Administration(commands.Cog):

    @scommand(name='prefix', description='Views or changes the prefix of the server.')
    async def prefix(self, ctx: SContext, *, new_prefix: typing.Optional[str]):
        prefixes = ctx.db['prefixes']
        found = await prefixes.find_one(dict(guild_id=str(ctx.guild.id)))  # get this guild's prefix
        if new_prefix:
            if not ctx.author.guild_permissions.manage_guild:
                raise commands.MissingPermissions(missing_perms=["manage_guild"])
            if len(new_prefix) > PREFIX_LIMIT:
                await ctx.send(f"Too big! The max prefix length is **{PREFIX_LIMIT} characters**. (Remember: \
any kind of mentions - user mentions, channel & role mentions - and custom emojis represent a larger amount of \
characters than you see!)")
                return
            if found:  # If there already was a custom prefix in database, then change it
                await prefixes.update_one(dict(guild_id=str(ctx.guild.id)), {"$set": dict(prefix=new_prefix)})
            else:
                await prefixes.insert_one(PrefixesModel(guild_id=str(ctx.guild.id), prefix=new_prefix))
            await ctx.send(f"Successfully set the server prefix to '{discord_sanitize(new_prefix)}'!")
        else:
            curr_prefix = found['prefix'] if found else "+"
            await ctx.send(f"This server's current prefix is '{curr_prefix or '+'}'!")


def setup(bot: commands.Bot):
    bot.add_cog(Administration(bot))
