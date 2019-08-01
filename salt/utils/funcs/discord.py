"""
Discord.py-related operations.
"""
import discord
from typing import Optional, TYPE_CHECKING, List, NamedTuple
if TYPE_CHECKING:
    from classes import SContext  # remove any possibility of cyclic import.


def _kick_or_bannable_gen(perm: str):
    def able(
            member: discord.Member, *, performer: Optional[discord.Member] = None, needs_the_perm: Optional[bool] = True
    ) -> bool:
        guild: discord.Guild = member.guild
        me: discord.Member = performer or guild.me
        if guild.owner_id == me.id:
            return True  # if this is the owner of the guild, then it doesn't matter lol
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


CreateMuteRoleResponse = NamedTuple(  # returns CreateMuteRoleResponse(role=[new role], unable_to_channels=[channels we
    "CreateMuteRoleResponse", [("role", discord.Role), ("unable_to_channels", List[discord.TextChannel])] # can't change
)                                                                                                         # perms])


async def create_mute_role(ctx: "SContext", *, name: str = "SaltMuted", old_role: discord.Role = None):
    """
    Create the SaltMuted role, or fix an existing one.
    :param ctx: The context in which to create the role.
    :param name: Name of the role, default is SaltMuted.
    :param old_role: If one already exists, use it.
    :return: CreateMuteRoleResponse(role=The created role, unable_to_channels=Channels we can't change perms in)
    """
    new_role = old_role or (
        await ctx.guild.create_role(
            reason="[Mute role, required for mute command]",
            name=name or "SaltMuted", permissions=discord.Permissions.none()  # Give no permissions to this boi
        )
    )

    unable_to_channels: List[discord.TextChannel] = list()  # channels we weren't able to modify permissions in
    for chan in ctx.guild.text_channels:  # Iterate over channels to remove Send Messages permission.
        if (
                (overwrites := chan.overwrites_for(new_role))
                and not overwrites.is_empty()        # If there are overwrites...
                and (pair := overwrites.pair())      #
                and pair[1].send_messages is False   # ...and send messages is already negated for the mute role
        ):
            continue  # Then nothing to do here

        if not chan.permissions_for(ctx.me).manage_channels:  # Or if can't modify the permissions in this channel
            unable_to_channels.append(chan)
            continue

        chan.set_permissions(
            new_role, overwrite=discord.PermissionOverwrite(send_messages=False),  # Negate Send Messages
            reason="[Mute role has to be unable to talk]"
        )

    return CreateMuteRoleResponse(role=new_role, unable_to_channels=unable_to_channels)
