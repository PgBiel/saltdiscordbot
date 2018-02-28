module.exports = function cleanRole(role, guildId = (role.guild || {}).id) {
  if (role == null || typeof role !== "object") return role;
  // ALL DATA CONVERTED tO DISCORD STANDARDS.
  const { id, name, color, hoist, rawPosition, permissions, managed, mentionable } = role;
  return {
    guild: guildId,
    id,
    name,
    color,
    hoist,
    position: rawPosition,
    permissions: permissions.bitfield,
    managed,
    mentionable
  };
};
