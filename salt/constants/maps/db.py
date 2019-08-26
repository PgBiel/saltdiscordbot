from pymongo import ASCENDING, DESCENDING

DB_PUNISHMENT_TYPES = ("mute", "remute", "kick", "ban", "softban", "unmute", "unban", "warn")
SETTABLE_PUNISHMENT_TYPES = ("mute", "pmute", "kick", "ban", "softban", "warn")
NON_WARN_SETTABLE_PUNISHMENT_TYPES = SETTABLE_PUNISHMENT_TYPES[:-1]  # exclude warn

DB_PERMISSION_TYPES = ("member", "role", "channel", "guild")

DB_COLLECTIONS_TO_INDEXES = {
    "punishments": [('guild_id', ASCENDING), ('case', DESCENDING), ('deleted', DESCENDING)],
    "prefix": [('guild_id', ASCENDING)],
    "activemutes": [('guild_id', ASCENDING), ('user_id', ASCENDING)],
    "mutes": [('guild_id', ASCENDING)],
    "actionlogsettings": [('guild_id', ASCENDING)]
}
