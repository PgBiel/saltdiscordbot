const temp = require("../../util/temp");

/**
 * Check if a guild has been cached
 * @param {string} guildId ID of the guild to check
 * @returns {boolean}
 */
module.exports = guildId => (temp.get("cacheGuilds") || []).includes(guildId);