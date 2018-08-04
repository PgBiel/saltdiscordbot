import { Role, GuildMember } from "discord.js";

export default function rolePosComp(initA: Role | GuildMember, initB: Role | GuildMember): number {
  let a: Role;
  let b: Role;
  if (initA instanceof GuildMember) {
    if (initA.id === initA.guild.ownerID && (initB instanceof GuildMember ? initA.guild.id === initB.guild.id : true)) return -1;
    a = initA.roles.highest;
  }
  if (initB instanceof GuildMember) {
    if (initB.id === initB.guild.ownerID && (initA instanceof GuildMember ? initB.guild.id === initA.guild.id : true)) return 1;
    b = initB.roles.highest;
  }

  if (!a || !b) return 0;
  if (!(a instanceof Role) || !(b instanceof Role)) throw new TypeError("AT ROLE POS COMP: Incompatible types");

  const { position: posA } = a;
  const { position: posB } = b;

  if (posA > posB) {
    return -1;
  } else if (posA === posB) {
    return 0;
  } else {
    return 1;
  }
}
