import perms from "../../classes/permissions";
import logger from "../../classes/logger";

interface IReturnVal {
  disabled: boolean;

  type?: string;
  error?: any;
}

/**
 * See if a command is disabled.
 * @param {string} cmdName Name of the command
 * @param {string} guildId ID of the guild
 * @param {string} channelId ID of the channel
 * @returns {object} Result
 */
export default async function fetchDisable(cmdName: string, guildId: string, channelId: string): Promise<IReturnVal> {
  try {
    const disabled: string = await perms.isDisabled(guildId, channelId, cmdName);
    if (disabled) {
      return { disabled: true, type: disabled };
    }
    return { disabled: false };
  } catch (err) {
    logger.error(`At disable: ${err}`);
    return { disabled: false, error: err };
  }
}
