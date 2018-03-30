import { Role } from "discord.js";

export interface ICleanRole {
  guildId: string;
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: number;
  managed: boolean;
  mentionable: boolean;
}

export default function cleanRole(role: Role, guildId: string = (role.guild || { id: null }).id) {
  if (role == null || typeof role !== "object") return role as never;
  // ALL DATA CONVERTED tO DISCORD STANDARDS.
  const { id, name, color, hoist, rawPosition, permissions, managed, mentionable } = role;
  return {
    guildId,
    id,
    name,
    color,
    hoist,
    position: rawPosition,
    permissions: permissions.bitfield,
    managed,
    mentionable
  };
}
