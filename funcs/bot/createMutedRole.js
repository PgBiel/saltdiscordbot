const rejct = require("../util/rejct");

/**
 * Make a mute role.
 * @param {Guild} guild The guild to create the mute role at.
 * @returns {Promise<Role>} The created role.
 */
module.exports = async function createMutedRole(guild) {
  const newRole = await guild.createRole({
    name: "SaltMuted",
    permissions: []
  });
  for (const [id, channel] of guild.channels) {
    channel.overwritePermissions(newRole, { SEND_MESSAGES: false }).catch(rejct);
  }
  return newRole;
};
