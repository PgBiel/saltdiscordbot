const perms = require("../../classes/permissions");
const logger = require("../../classes/logger");

/**
 * See if a command is disabled.
 * @param {string} cmdName Name of the command
 * @param {string} guildId ID of the guild
 * @param {string} channelId ID of the channel
 * @returns {object} Result
 */
module.exports = async function fetchDisable(cmdName, guildId, channelId) {
  try {
    const disabled = await perms.isDisabled(guildId, channelId, cmdName);
    if (disabled) {
      return { disabled: true, type: disabled };
    }
    return { disabled: false };
  } catch (err) {
    logger.error(`At disable: ${err}`);
    return { disabled: false, error: err };
  }
};
