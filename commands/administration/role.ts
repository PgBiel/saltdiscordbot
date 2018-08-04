import { TcmdFunc } from "../../misc/contextType";
import { roleinfo } from "../information/roleinfo";
import {
  Embed, capitalize, adaptSnake, search, Time, no2Tick, noEscape, Constants, Interval,
  parseTimeStr,
  Command,
  escMarkdown,
  colorNumToHex,
  resolveColor,
  http,
  Discord,
  friendlyError
} from "../../misc/d";
import { DiscordAPIError, Role, FileOptions, MessageAttachment } from "discord.js";

type RoleAction =   "create"  | "delete" |
"name"  | "color" | "hoist"   | "perms"  |
"info"  ;

type RoleAliases = "separate" | "permissions"      ;

const noAliasActionArr: RoleAction[] = [
  "create", "delete", "name", "color", "hoist", "perms", "info"
];
const actionArr: Array<RoleAction | RoleAliases> = (noAliasActionArr as any[]).concat([
  "permissions", "separate"
] as RoleAliases[]);

export type InferPromise<T> = T extends Promise<infer R> ? R : T;

const colors: { [clr: string]: number } = Object.assign(
  { BACKGROUND: resolveColor(Constants.colors.BACKGROUND, false) },
  (Discord as any).Constants.Colors,
  Constants.colors.COLORS
);

const func: TcmdFunc<{}> = async function(
  msg, { author, prefix: p, channel, args, arrArgs, self, perms, seePerm, send, reply, setPerms, guild, prompt }
) {
  const hasInfoRoles = perms["info.role"];
  if (!args) {
    return reply("View the help command to see how to use this command to edit a role!");
  }
  const hasPerms: { [K in RoleAction]: boolean } = {
    create: await seePerm("role.create", perms, setPerms, { hperms: "MANAGE_ROLES" }),
    delete: await seePerm("role.delete", perms, setPerms, { hperms: "MANAGE_ROLES" }),
    name: await seePerm("role.name", perms, setPerms, { hperms: "MANAGE_ROLES" }),
    color: await seePerm("role color", perms, setPerms, { hperms: "MANAGE_ROLES" }),
    hoist: await seePerm("role.hoist", perms, setPerms, { hperms: "MANAGE_ROLES" }),
    perms: await seePerm("role.perms", perms, setPerms, { hperms: "MANAGE_ROLES" }),
    info: hasInfoRoles
  };

  const [_action, ...restArr] = arrArgs;
  const action: RoleAction = _action.toLowerCase() as RoleAction;
  const rest: string = restArr.join(" ");
  if (!actionArr.includes(action)) {
    return reply(`Invalid action! Action must be one of ${actionArr.map(a => "`" + a + "`").join(", ")}. \
For details, see the help command.`);
  }
  if (rest || ["create", "info"].includes(action)) {
    if (!hasPerms[action]) {
      return reply(
        action === "info" ?
          `Missing permission \`role ${action}\`, required to use this action! (Note that it's also usable with the \
Discord permission \`Manage Roles\`.)` :
          "Missing permission `info role`! :frowning:"
      );
    } else if (!guild.me.hasPermission("MANAGE_ROLES")) {
      return send("I do not have the permission `Manage Roles`, required to edit the server! :frowning:");
    }
  } else {
    return reply(`Specify a role to ${action === "info" ? "view info for" : "modify"} \
(View the help command for details of that action).`);
  }

  const reason: string = `["+role ${action}" command executed by ${author.tag}]`;
  const doIt = async <R>(
    doFunc: () => (ReturnType<typeof doFunc> extends Promise<R> ? Promise<R> : R),
    okMsgOrFunc: string | ((res?: R) => any),
    badMsgOrFunc: string | ((res?: R) => any),
    attachOk?: string | Buffer | FileOptions | MessageAttachment | Embed
  ) => {
    try {
      const res = await doFunc();
      if (okMsgOrFunc instanceof Function) {
        okMsgOrFunc(res);
      } else if (typeof okMsgOrFunc === "string") {
        reply(
          okMsgOrFunc,
          !attachOk ?
            undefined :
            Object.assign({ deletable: true }, attachOk instanceof Embed ? { embed: attachOk } : { files: [attachOk] })
        );
      }
    } catch (err) {
      if (badMsgOrFunc instanceof Function) {
        badMsgOrFunc();
      } else if (typeof badMsgOrFunc === "string") {
        const embed = friendlyError(err);
        reply(badMsgOrFunc, { embed, deletable: Boolean(embed) });
      }
    }
  };
  channel.startTyping();
  if (action === "create") {
    let newName: string = rest;
    const { ROLE_NAME_CHARS: max } = Constants.numbers.max;
    if (newName) {
      if (newName.length > max) return reply(`Role name must have up to ${max} characters!`);
      const { res: result } = await prompt({
        question: `Are you sure you want to create a new role named **${escMarkdown(newName)}**? \
This will expire in 25 seconds. Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: Time.seconds(25)
      });
      if (!result) {
        return;
      }
      if (/^[nc]/i.test(result)) {
        send("Command cancelled.");
        return;
      }
    } else {
      const { res: result, cancelled, skipped } = await prompt({
        question: `What will be the name of the new role? This will expire in 25 seconds. Type \`cancel\` to cancel, and \
\`skip\` to not set any name.`,
        invalidMsg: "Role name must have up to " + max + " characters!",
        filter: ({ content }) => content.length <= max,
        timeout: Time.seconds(25),
        skip: true
      });
      if (skipped) {
        newName = "";
      } else if (cancelled || !result) {
        return;
      }
      newName = result;
    }
    const doFunc = () => guild.roles.create({ data: { name: newName || "new role" }, reason });
    const answerOk = (role: Role) => reply(`Successfully created a new role\
${newName ? ` with name of **${escMarkdown(newName)}**` : ""}! (ID: ${role.id})`);
    await doIt(doFunc, answerOk, "Failed to create a new role! :frowning: (Try again?)");
  } else if (action === "info") {
    return roleinfo.exec(msg, Object.assign({ dummy: { action: "role", tr: rest, arg: rest } }, self));
  } else {
    const { subject: role } = await search(rest, "role", self, { allowForeign: false });
    if (!role) return;
    const { name, color, position, permissions: rperms } = role;
    if (action === "delete") {
      const { res: result } = await prompt({
        question: `Are you sure you want to delete the role named **${escMarkdown(name)}**? All members who have this role will \
lose it! This will expire in 25 seconds. Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: Time.seconds(25)
      });
      if (!result) {
        return;
      }
      if (/^[nc]/i.test(result)) {
        send("Command cancelled.");
        return;
      }
      const doFunc = () => role.delete(reason);
      await doIt(
        doFunc, `Successfully deleted the role named **${escMarkdown(name)}**!`,
        "Failed to delete the role! (Try again?)"
      );
    } else if (action === "name") {
      const { ROLE_NAME_CHARS: max } = Constants.numbers.max;
      const { res: result, cancelled, skipped } = await prompt({
        question: `What will be the new name of the role? This will expire in 25 seconds. Type \`cancel\` to cancel.`,
        invalidMsg: "The new name must have up to " + max + " characters!",
        filter: ({ content }) => content.length <= max,
        timeout: Time.seconds(25)
      });
      if (cancelled || !result) {
        return;
      }

      const embed = new Embed();
      embed
        .setTitle("Role Name Change")
        .setFooter(`Role ID: ${role.id}`)
        .setColor(role.color || null)
        .addField("Old Name", escMarkdown(name))
        .addField("New Name", escMarkdown(result));
      const doFunc = () => role.setName(result, reason);
      await doIt(doFunc, "Successfully changed the role's name!", "Failed to change the role's name! (Try again?)", embed);
    } else if (action === "color") {
      const hexGex = /^#[0-9a-f]{1,6}$/i;
      const rgbEx = /^[\[\(\{]*(\d{1,3})[,;:-|\s]+(\d{1,3})[,;:-|\s]+(\d{1,3})[,;:-|\s]*[\]\)\}]*$/i;
      const { res: result, cancelled, skipped } = await prompt({
        question: `What will be the new color of the role? Use its name (blue, green etc.), the format #hheexx or R,G,B value. \
This will expire in 30 seconds. Type \`cancel\` to cancel, and \`default\` or \`remove\` to set to the default color.`,
        invalidMsg: `Please specify a valid color, with its name (blue, green etc.), hex (#hheexx) or RGB (Red,Green,Blue) \
value. (To view the list of Discord-defined color **names**, see \`${p}help role discordColors\`.)`,
        filter: ({ content }) => {
          const lowCont = content.toLowerCase();
          if (lowCont === "remove" || lowCont === "default" || lowCont === "delete") return true;
          if (content.length < 2 || !/[0-9a-z]/i.test(content)) return false;
          const fixed: string = content.toUpperCase().replace(/[\s-]+/g, "_");
          if (hexGex.test(content)) {
            return true;
          } else if (rgbEx.test(content)) {
            const [, r, g, b] = content.match(rgbEx).map((r, i) => i >= 1 ? Number(r) : 0);
            if (r > 255 || g > 255 || b > 255) return false;
            return true;
          } else if (fixed in colors) {
            return true;
          }
          return false;
        },
        timeout: Time.seconds(30)
      });
      if (cancelled || !result) {
        return;
      }
      let toUse: string | number | [number, number, number];
      const fixed: string = result.toUpperCase().replace(/[\s-]+/g, "_");
      if (["remove", "default", "delete"].includes(result)) {
        toUse = "";
      } else if (hexGex.test(result)) {
        const raw: string = result.replace(/^#/, "");
        const isCharAmnt = (amount: number) => new RegExp(hexGex.source.replace(/\{1,6\}/, `{${amount}}`), "i").test(raw);
        if (/^[0-9a-z]$/i.test(raw)) {
          toUse = raw.repeat(6);
        } else if (isCharAmnt(2)) {
          toUse = raw.repeat(3);
        } else if (isCharAmnt(3)) {
          toUse = raw.repeat(2);
        } else if (isCharAmnt(4) || isCharAmnt(5)) {
          toUse = raw + (isCharAmnt(4) ? "0" : "00");
        } else {
          toUse = raw;
        }
      } else if (rgbEx.test(result)) {
        const raw: string = result
          .replace(/^[\[\{\(]+|[\]\}\)]+$/g, "")
          .replace(/[,;:-|\s]+/g, ",");
        const [r, g, b] = raw.split(",") as [string, string, string];
        toUse = [r, g, b].map(c => Number(c)) as [number, number, number];
      } else if (fixed in colors) {
        toUse = colors[fixed];
      } else { return; }
      const doFunc = () => role.setColor(toUse || 0, reason);
      const hexColor: string = (role.hexColor ||
        Constants.colors.ROLE_DEFAULT) === Constants.colors.ROLE_DEFAULT ?
          Constants.colors.ROLE_DISPLAY_DEFAULT :
          role.hexColor;
      const newHex: string = typeof toUse === "number" ? colorNumToHex(toUse) : resolveColor(toUse || 0, true);
      const colorURL: string = http.www.colourlovers.com(`/img/${newHex.replace(/^#/, "")}/1240/640`).toString();
      const embed = new Embed()
        .setTitle("Role Color Change")
        .setColor(role.color || null)
        .addField("Old Color (Sidebar)", hexColor + (hexColor === Constants.colors.ROLE_DISPLAY_DEFAULT ? " (Default)" : ""))
        .addField("New Color (Image)", newHex + (newHex === Constants.colors.ROLE_DISPLAY_DEFAULT ? " (Default)" : ""))
        .setImage(colorURL)
        .setFooter(`Role ID: ${role.id}`);

      await doIt(doFunc, "Successfully changed the role's color!", "Failed to change the role's color! (Try again?)", embed);
    }
  }
};
const permlist = { "info.role": true };
for (const act of noAliasActionArr) {
  if (act === "info") continue;
  permlist[`role.${act}`] = false;
}

export const rolecmd = new Command({
  func,
  name: "role",
  perms: permlist,
  default: true,
  description: `Manage a role by specifying an action.

The list of actions is specified in the Subpages section (except for "discordColors" – seeing help for that will show the list \
of Discord-defined color names). Use \`{p}help role <action>\` for info and permissions.

**Note:** Having \`Manage Roles\` also lets you use all actions on this command.`,
  example: `{p}{name}
{p}{name} info My Cool Role
{p}{name} create New Role
{p}{name} delete Old Role
. . . (check subpages for more)`,
  category: "Administration",
  args: { action: false, "role name": false },
  subHelps: {
    //#region Normal Settings
    name: {
      description: `Change the server's name by specifying the new name. If nothing is specified, \
you are informed of the current name.

For permissions, \`info server\` to view current name; \`server name\` to edit (or \`Manage Servers\`).`,
      args: { name: true },
      example: `{p}{up} {name}
{p}{up} {name} New Cool Name`,
      perms: { "server.name": false, "info.server": true }
    },
    icon: {
      description: `Change the server icon by attaching an image. Specify "none"/"disable"/"remove" to remove. \
If nothing is specified, view current icon.

For permissions, \`info server\` to view current icon; \`server icon\` to change (or \`Manage Servers\`).`,
      args: { "attach image to set; 'none'/'disable'/'remove' to remove icon": true },
      example: `{p}{up} {name}
{p}{up} {name} remove`,
      perms: { "server.icon": false, "info.server": true }
    },
    region: {
      description: `Change the server's region (used by voice channels) by specifying it. \
(To view a list of valid regions, specify "list".) If nothing is specified, view current region.

For permissions, \`info server\` to view current region; \`server region\` to change (or \`Manage Servers\`).`,
      args: { "region name (or 'list' to view all)": true },
      example: `{p}{up} {name}
{p}{up} {name} list
{p}{up} {name} US East
{p}{up} {name} Brazil`,
      perms: { "server.region": false, "info.server": true }
    },
    splash: {
      description: `Change the Invite Splash (background displayed when the invite link is followed – feature only available for \
Discord partners and Verified servers) for the server, by attaching an image. Specify "none"/"disable"/"remove" to remove. \
If nothing is specified, view current splash.

For permissions, \`info server\` to view current splash; \`server splash\` to change (or \`Manage Servers\`).`,
      args: { "attach image to set; 'none'/'disable'/'remove' to remove splash": true },
      example: `{p}{up} {name}
{p}{up} {name} remove`,
      perms: { "server.splash": false, "info.server": true }
    },
    newcome: {
      description: `Change the text channel used for New Member Messages by specifying one. If nothing is specified, \
view current channel.

For permissions, \`info server\` to view current New Member Msgs channel; \`server newcome\` to edit (or \`Manage Servers\`).`,
      args: { "new text channel": true },
      example: `{p}{up} {name}
{p}{up} {name} #welcome`,
      perms: { "server.newcome": false, "info.server": true }
    },
    dnotif: {
      description: `Change the default notification settings for a member (Either All Messages or Only Mentions), \
by specifying it. If nothing specified, view it.

For permissions, \`info server\` to view current default Notifications setting; \`server dnotif\` to change \
(or \`Manage Servers\`).`,
      args: { "new setting ('All Messages' or 'Only Mentions')": true },
      example: `{p}{up} {name}
{p}{up} {name} All Messages
{p}{up} {name} Only Mentions`,
      perms: { "server.dnotif": false, "info.server": true }
    },
    //#endregion
    //#region verif levels
    veriflevel: {
      description: `Change the verification level of the server by specifying it (number 0-4 or its name). If nothing specified, \
view it.

**Levels:** ${Constants.maps.VERIF.map((s, i) => s + ` (${i})`).join(", ")}.

For permissions, \`info server\` to view current Verification Level; \`server veriflevel\` to change \
(or \`Manage Servers\`).`,
      args: { "new verification level": true },
      example: `{p}{up} {name}
{p}{up} {name} 2
{p}{up} {name} Low`,
      perms: { "server.veriflevel": false, "info.server": true }
    },
    explifilter: {
      description: `Change the Explicit Content Filter level by specifying it (number 0-2 or its name). \
If nothing specified, view it.

**Levels:** ${Constants.maps.modsettings.EXPLICIT.map(({ name }, i) => `"${name}" (${i})`).join(", ")}.

For permissions, \`info server\` to view current default Notifications setting; \`server dnotif\` to change \
(or \`Manage Servers\`).`,
      args: { "new Explicit Content Filter level": true },
      example: `{p}{up} {name}
{p}{up} {name} 1
{p}{up} {name} Don't scan any messages.`,
      perms: { "server.explifilter": false, "info.server": true }
    },
    //#endregion
    //#region AFK stuff
    afkchannel: {
      description: `Change the AFK Voice channel by specifying the channel. Specify "none"/"disable"/"remove" to disable. \
If nothing specified, view it.

For permissions, \`info server\` to view current AFK voice channel; \`server afkchannel\` to change \
(or \`Manage Servers\`).`,
      args: { "new voice channel (or 'none'/'disable'/'remove' to remove)": true },
      example: `{p}{up} {name}
{p}{up} {name} AFK
{p}{up} {name} remove`,
      perms: { "server.afkchannel": false, "info.server": true }
    },
    afktimeout: {
      description: `Change the AFK Timeout (time until person is considered AFK), by specifying one of the following timestamps: \
.

For permissions, \`info server\` to view current AFK timeout; \`server afktimeout\` to change \
(or \`Manage Servers\`).`,
      args: { "new AFK timeout": true },
      example: `{p}{up} {name}
{p}{up} {name} a
{p}{up} {name} a`,
      perms: { "server.afktimeout": false, "info.server": true }
    },
    //#endregion
  }
});
