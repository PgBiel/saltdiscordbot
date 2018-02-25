const db = require("../../classes/database");

/**
 * Fetch prefix from database
 * @param {string} guildId ID of the guild
 * @returns {string} The prefix
 */
module.exports = async guildId => {
  const dbPrefix = guildId ? (await (db.table("prefixes").get(guildId))) : null;
  return dbPrefix || "+";
};