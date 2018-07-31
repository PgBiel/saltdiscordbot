import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import {
  Command, GuildMember, Role, search, User, db, paginate, uncompress, Embed, Constants, no2Tick, logger
} from "../../misc/d";
import permz from "../../classes/permissions";
import { IProtoSendPaginator } from "../../handlerfuncs/senders/proto-send";

const func: TcmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member
}) {
  if (!perms["info.saltperms"]) return reply("Missing permission `info saltperms`! :frowning:");
  const { android, action, arg: _arg, trArg } = dummy || {} as never;
  channel.startTyping();
  arrArgs = trArg ? (trArg.split(/\s+/)) : arrArgs;
  let chosen: Role | User;
  let [type, ...restArr] = arrArgs; // tslint:disable-line:prefer-const
  /**
   * If should determine all perms, including from roles
   */
  let total: boolean = false;
  type = type ? String(type).toLowerCase() : "";
  if (["tuser", "tmember"].includes(type)) {
    total = true;
    type = "user";
  } else if (type === "member") {
    type = "user";
  }
  let page: number = 1;
  let rest: string = "";
  if (["user", "member"].includes(type) && restArr.length === 1 && /^\d+$/.test(restArr[0])) { // page specified
    page = restArr[0].length > 5 ? 1 : Number(restArr[0]);
  } else if (restArr.length > 1 && /^\d+$/.test(restArr[restArr.length - 1])) {
    const last = restArr[restArr.length - 1];
    page = last.length > 5 ? 1 : Number(last);
    rest = restArr.slice(0, -1).join(" ");
  } else {
    rest = restArr.join(" ");
  }
  if (arrArgs.length < 1) {
    chosen = author;
  } else if (arrArgs.length === 1) {
    if (/^\d+$/.test(type)) {
      chosen = author;
      page = type.length > 5 ? 1 : Number(type);
      type = "user";
    } else if (type === "user" || type === "member") {
      chosen = author;
    } else if (type === "role") {
      return reply("Please specify a role to view its Salt Permissions!");
    } else {
      return reply("Please specify a type to search (either `user` or `role`)!");
    }
  } else if (["user", "member", "role"].includes(type)) {
    const isUser: boolean = type !== "role";
    const { subject }: { subject?: Role | User } = await search(
      rest, isUser ? "user" : "role", self, { allowForeign: false, autoAnswer: true }
    );
    if (!subject) return;
    chosen = subject;
  } else {
    return reply("Unknown type to search! It must be either `user` or `role`.");
  }
  const allPerms = await db.table("perms").get(guildId);
  const theirPerms = allPerms.filter(p => total ?
    (p.type.startsWith("m") ? uncompress(p.id) === chosen.id : guild.member(chosen as User).roles.has(uncompress(p.id))) :
    p.type.startsWith(type === "role" ? "r" : "m") && uncompress(p.id) === chosen.id);
  if (theirPerms.length < 1) return reply(
    `${chosen instanceof User && chosen.id === author.id ? "You have" : `That ${type || "user"} has`} no permission overwrites!`
  );
  const pages = paginate(theirPerms);
  if (page > pages.length) return reply("There's no such page! (" + page + ")");
  const gen = (page: number) => {
    const emb = new Embed();
    emb
      .setTitle(`List of ${total ? "total " : ""}permissions for ${type || "user"} \
${chosen instanceof User ? chosen.username : chosen.name }`)
      .setColor(Constants.colors.RANDOM_COLOR());
    if (pages.length > 1) emb.setFooter(`Page ${page}/${pages.length} – To change, type ${p}info saltperms ${type} \
${rest} <page>.`);

    let desc: string = "```diff\n";
    for (const perm of theirPerms) {
      let text = permz.buildStr(perm);
      if (total && perm.type.startsWith("r")) text += ` (from role \`${no2Tick(guild.roles.get(uncompress(perm.id)).name)}\`)`;
      if (!text.startsWith("-")) text = "+ " + text;
      desc += text + "\n";
    }
    desc += "```";
    emb.setDescription(desc);
    return emb;
  };
  const paginater: IProtoSendPaginator = {
    format: gen,
    maxPage: pages.length,
    content: "",
    pages,
    page,
    usePages: true
  };
  return send({ embed: gen(page), paginate: paginater });
};

export const saltperms = new Command({
  description: `View the list of Salt Permissions of a member or role.

A type must be specified after the command name to know what to search: \`user\` to search for a member and \`role\` for a role.
However, it is also possible to specify \`tuser\`, which is \`user\` but in total mode: It also displays permissions inherited \
from roles that the member has.

After, text is specified to search for a member or role with that name. And that's it.
`,
  func,
  name: "saltperms",
  perms: "info.saltperms",
  args: { "type (user or role)": true, "name (to search)": true, page: true },
  guildOnly: true,
  category: "Information",
  example: `
{p}{name}
{p}{name} user
{p}{name} role My Cool Role
{p}{name} user @Martian#0011`,
  default: true,
  aliases: {
    stperms: {},
    listperms: {}
  }
});
