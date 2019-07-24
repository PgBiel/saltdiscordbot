from discord.ext import commands
from classes.scontext import SContext
from utils.checks import or_checks, is_owner, has_saltmod_role


class Moderation(commands.Cog):
    @or_checks(is_owner(), has_saltmod_role(), commands.has_permissions(kick_members=True))
    async def kick(self, ctx: SContext):
        await ctx.send("Congrats, you have perms!")