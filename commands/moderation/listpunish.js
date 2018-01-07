const Command = require("../../classes/command");
const actionLog = require("../../classes/actionlogger");

function filterPunishes(punishments, id, uncompress) {
  const punishes = punishments.filter(c => uncompress(c.target) === id);
  return {
    all: punishes,
    warns: punishes.filter(c => c.type === "w"),
    mutes: punishes.filter(c => c.type === "m"),
    kicks: punishes.filter(c => c.type === "k"),
    softbans: punishes.filter(c => c.type === "s"),
    bans: punishes.filter(c => c.type === "b"),
    unbans: punishes.filter(c => c.type === "U"),
    unmutes: punishes.filter(c => c.type === "u")
  };
}
function exampleCases(punishes, init = " ") {
  if (punishes.length < 1) {
    return "";
  } else if (punishes.length === 1) {
    return `${init}[Case ${punishes[0].case}]`;
  } else if (punishes.length < 5) {
    return `${init}[Cases ${punishes.map(c => c.case.toString()).join(", ")}]`;
  } else {
    const initCases = punishes.slice(0, 4).map(c => c.case.toString()).join(", ");
    const otherCases = punishes.slice();
    otherCases.splice(0, 4);
    return `${init}[Cases ${initCases}... (+${otherCases.length})]`;
  }
}

function authorMain({ Embed, author, punishments, p, reply, send, uncompress, _ }) {
  const filtered = filterPunishes(punishments, author.id, uncompress);
    if (!filtered.all || filtered.all.length < 1) return reply(`You haven't ever been punished! :smiley:`);
    let text = `Punishments available (Type \`${p}listpunish <punishment>\` to a view a list):

`;
    for (const [type, filt] of Object.entries(filtered).sort(([, a], [, b]) => b.length - a.length)) {
      if (type === "all") continue;
      text += `• **${_.capitalize(type)}**: **${filt.length}**${exampleCases(filt)}\n`;
    }
    const embed = new Embed();
    embed
      .setTitle("List of punishments")
      .setDescription(_.trim(text))
      .setColor("RANDOM")
      .setFooter(`You have been punished ${filtered.all.length} times. Type \`${p}listpunish all\` to see all of your punishments.`);
    reply("Here's your punishment list:", { embed });
}

const func = async function (
  msg, { prompt, guildId, guild, reply, checkRole, author, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms },
) {
  const punishments = this.db.table("punishments").get(guildId);
  if (!punishments || punishments.length < 1) return reply(`Nobody has been punished in this guild!`);
  if (!args) {
    authorMain({ Embed: this.Embed, author, punishments, p, reply, send, uncompress: this.uncompress, _: this._ });
  } else {
    const matchObj = args.match(this.xreg(this.Constants.regex.LIST_PUNISH_MATCH, "xi"));
    let user, name, page;
    if (matchObj[1]) {
      user = matchObj[1];
      name = matchObj[2];
    } else {
      user = matchObj[3];
    }
    if (!user && !name) return reply(`Please specify an user to check their punishments!`);
    page = matchObj[4] && matchObj[4].length < 5 && /^\d+$/.test(matchObj[4]) ? (Number(matchObj[4]) || 1) : NaN;
    
  }
};

module.exports = new Command({
  func,
  name: "listpunish",
  perms: {"case.get": true, "case.edit": true, "case.delete": true, "case.others": false},
  description: `Get or modify a case. Specify just a number to fetch that case and see it's information. Otherwise, specify an \
action. The actions are listed below. After it, specify a number which will be the case to interact with.

The \`get\` action works pretty much as if you just specified a number: It retrieves a case by the number specified.
The rest of the actions can be only applied to your own cases by default and require a special permission to apply to others. For \
\`edit\` and only it, if you attempt to apply it to someone else's case, you will be prompted for confirmation because you will \
become the punisher.

The \`edit\` action lets you change a case's reason. You must specify the new reason after the case number.

The \`togglethumb\` action lets you toggle if a thumbnail will be displayed on the case's embed or not.

And finally, the \`delete\` action lets you delete a case. You will always be asked for confirmation.

Permissions: \`case \` and the action name. For interacting with others' cases, use \`case others\`.`,
  example: `{p}case 5
{p}case get 5
{p}case edit 10 New reason
{p}case togglethumb 16
{p}case delete 6`,
  category: "Moderation",
  args: {
    "action or case number": false,
    "case number (only when using an action)": true,
    "new reason (only when using edit)": true
  },
  guildOnly: true,
  default: false,
});
