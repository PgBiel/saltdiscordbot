import discord
from discord.ext import commands
from classes import SContext, NoPermissions, scommand
from utils.checks import or_checks, is_owner, has_saltmod_role, sguild_only

moderation_dperm_error_fmt = "Missing permissions! For this command, you need either {0}, a Salt Mod role or the \
`{1}` saltperm."


class Moderation(commands.Cog):
    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(kick_members=True),
        error=NoPermissions(moderation_dperm_error_fmt.format("Kick Members", "kick"))
    )
    @sguild_only()
    @scommand(name="kick", description="Kick people.")
    async def kick(self, ctx: SContext, member: discord.Member):
        await ctx.send(f"You gave member {member.name}#{member.discriminator}!")


def setup(bot: commands.Bot) -> None:
    bot.add_cog(Moderation(bot))
