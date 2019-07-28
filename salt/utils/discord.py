"""
Discord.py-related operations.
"""
import discord
from typing import Optional


def _kick_or_bannable_gen(perm: str):
    def able(
            member: discord.Member, *, performer: Optional[discord.Member] = None, needs_the_perm: Optional[bool] = True
    ) -> bool:
        guild: discord.Guild = member.guild
        me: discord.Member = performer or guild.me
        if needs_the_perm and not getattr(me.guild_permissions, perm):  # bot needs Kick Members or Ban Members
            return False
        if guild.owner_id == member.id:  # cannot kick/ban owner
            return False
        top_role: discord.Role = member.top_role
        if top_role.position >= me.top_role.position:  # cannot kick/ban roles of position equal or higher
            return False
        return True  # yep, can kick

    return able


kickable = _kick_or_bannable_gen("kick_members")
"""Check if a member is kickable.
:param member: The member to check.
:param performer: (Optional) The member that is trying to kick, defaults to `member.guild.me` (the bot).
:param needs_the_perm (Optional) If the kicker needs the Kick Members permission, defaults to True. (Used for
    kick command.)
:return (bool) Whether the member can or not be kicked."""

bannable = _kick_or_bannable_gen("ban_members")
"""Check if a member is bannable.

:param member: The member to check.
:param performer: (Optional) The member that is trying to ban, defaults to `member.guild.me` (the bot).
:param needs_the_perm: (Optional) If the punisher needs the Ban Members permission, defaults to True. (Used for
    ban command.)
:return (bool) Whether the member can or not be banned."""