import { GuildMember } from "discord.js";

export abstract class Punishment {

  public abstract punish(member: GuildMember, ...args: any[]): any;
}
