import discord
import motor.motor_asyncio
import typing
import datetime
from discord.ext import tasks, commands


class MuteCheck(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.mute_check.start()

    def cog_unload(self):
        self.mute_check.cancel()

    @tasks.loop(seconds=10.0)
    async def mute_check(self):
        """
        Do a check if all mutes are alright, and remove or re-add mute role in all servers where it is needed to.
        """
        bot = self.bot
        active_mutes_col: motor.motor_asyncio.AsyncIOMotorCollection = bot.mondb.activemutes
        active_mutes: motor.motor_asyncio.AsyncIOMotorCursor = active_mutes_col.find({})
        async for el in active_mutes:
            g_id = el.get('guild_id')
            u_id = el.get('user_id')
            if not g_id or not u_id:
                await active_mutes_col.delete_one(dict(_id=el["_id"]))  # invalid entry
                continue

            timestamp_str = el.get('timestamp')
            permanent = el.get('permanent', False)
            if permanent or not timestamp_str:
                continue
            guild: discord.Guild = bot.get_guild(int(g_id))
            member: typing.Optional[discord.Member] = guild.get_member(int(u_id))
            if member:
                mute_info: motor.motor_asyncio.AsyncIOMotorCursor = await bot.mondb.mutes.find_one(dict(
                    guild_id=g_id
                ))
                m_r_id = mute_info['mute_role_id'] if mute_info else None
                role = guild.get_role(int(m_r_id)) if mute_info else None
                if (
                        (now := datetime.datetime.utcnow()) > (
                        timestamp := datetime.datetime.fromtimestamp(float(timestamp_str))
                )
                ):
                    if mute_info and m_r_id and role:
                        try:
                            await member.remove_roles(role, reason="[Auto unmute]")
                        except discord.HTTPException:  # Time passed, let's remove the role, but if we can't...
                            pass  # ...welp, w/e
                    await active_mutes_col.delete_one(dict(_id=el["_id"]))
                elif now < timestamp and mute_info and m_r_id and role and not role in member.roles:
                    try:
                        await member.add_roles(role, reason="[Member is muted.]")
                    except discord.HTTPException:
                        pass

    @mute_check.before_loop
    async def before_mute_check(self):
        await self.bot.wait_until_ready()


def setup(bot: commands.Bot):
    bot.add_cog(MuteCheck(bot))
