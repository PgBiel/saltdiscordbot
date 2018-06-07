import temp from "../../util/temp";

/**
 * Check if a guild has been cached
 * @param {string} guildId ID of the guild to check
 * @returns {boolean}
 */
export default (guildId: string) => ((temp.get("cacheGuilds") || []) as string[]).includes(guildId);
