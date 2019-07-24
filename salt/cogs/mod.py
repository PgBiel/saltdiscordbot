from discord.ext import commands
from classes import SContext, NoPermissions
from utils.checks import or_checks, is_owner, has_saltmod_role

moderation_dperm_error = "Missing permissions! For this command, you need either {0}, a Salt Mod role or the \
`{1}` saltperm."


class Moderation(commands.Cog):
    @or_checks(
        is_owner(), has_saltmod_role(), commands.has_permissions(kick_members=True),
        error=NoPermissions(moderation_dperm_error.format("Kick Members", "kick"))
    )
    @commands.command(name="kick", pass_context=True, description="Kick people.")
    async def kick(self, ctx: SContext):
        await ctx.send("Congrats, you have perms!")


def setup(bot: commands.Bot) -> None:
    bot.add_cog(Moderation(bot))
