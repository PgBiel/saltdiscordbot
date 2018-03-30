import { GuildMember } from "discord.js";

export default abstract class Punishment {

  public abstract punish(member: GuildMember, opts: object, ...args: any[]): any;
}
