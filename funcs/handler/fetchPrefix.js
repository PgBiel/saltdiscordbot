const db = require("../classes/database");

/**
 * Fetch prefix from database
 * @param {string} guildId ID of the guild
 */
module.exports = async guildId => {
  const dbPrefix = guildId ? (await (db.table("prefixes").get(guildId))) : null;
  return dbPrefix || "+";
};