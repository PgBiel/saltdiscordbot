import discord
BAN_COLOR = discord.Color.red()
KICK_COLOR = SOFTBAN_COLOR = discord.Color.orange()
MUTE_COLOR = REMUTE_COLOR = discord.Color.gold()
UNMUTE_COLOR = discord.Color.green()
UNBAN_COLOR = discord.Color.dark_green()

PUNISH_COLOR_MAP = {
    "kick": KICK_COLOR,
    "mute": MUTE_COLOR,
    "ban": BAN_COLOR,
    "softban": SOFTBAN_COLOR,
    "unmute": UNMUTE_COLOR,
    "unban": UNBAN_COLOR,
    "remute": REMUTE_COLOR
}
