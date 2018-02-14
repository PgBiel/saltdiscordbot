const Command = require("../../classes/command");
const d = require("../../misc/d");

 /* const func = async function (
  msg, {
    prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm,
    genPromptD, guild
  },
) {
  if (!args) {
    const logs = await (d.db.table("mods").prop(guildId, "logs"));
    if (!logs || !guild.channels.has(String(logs))) {
      return reply(`There is no set action logs channel at the moment! (To manage, see help command.)`);
    }
    const logsOn = await (d.db.table("mods").prop(guildId, "logsOn"));
    let isOn = logsOn || logsOn == null;
    return reply(`The current action logs channel is set to <#${logs}>, and action logs are currently \
${isOn ? "enabled" : "disabled"}! (To manage, see help command.)`);
  }
};

module.exports = new Command({
  func,
  name: "wordfilter",
  perms: {
    "wordfilter.list": true, "wordfilter.modify": false, "wordfilter.strictness": false, "wordfilter.message": false,
    "wordfilter.punishment": false, "wordfilter.toggle": false, "wordfilter.immune": false,
    "kick": { default: false, show: false }, "ban": { default: false, show: false },
    "warn": { default: false, show: false }, "softban": { default: false, show: false },
    "mute": { default: false, show: false }
  },
  description: `See the filtered words or modify the word filter. Specify an action after the command to \
show what is being done.
\nFor listing all words filtered, specify \`list\` as the action. You can include a page after it to go to specific pages.
**For setting up the word filter** (You cannot use other actions without setting up first), specify \`setup\` or \`register\`\
 as action.
For modifying the word filter list, you can specify \`add\`, \`remove\` and \`set\` to add, remove and set words \
(respectively), separated by comma. Specify \`clear\` as an action to remove all words.
For setting or viewing the word filter strictness, specify \`strictness\` as the action. If setting, it must be between \
1 and 5.
For setting or viewing the filtering message, specify \`message\` as the action, plus the message if setting.
For setting or viewing the filtering punishment, specify \`punishment\` (or \`punish\`) as the action. If setting, \
also specify a punishment. If you specify mute, specify the time muted as well after it. (Note that both you and the bot \
need to be able to execute said punishment to be able to choose it.)
For toggling the word filtering, specify \`enable\`, \`disable\` or \`toggle\` to enable it, disable it or toggle it, \
respectively.

About permissions: The \`wordfilter modify\` permission lets you use \`add\`/\`set\`/\`remove\`/\`setup\`, the \`wordfilter \
toggle\` permission lets you use \`enable\`/\`disable\`/\`toggle\`, the \`wordfilter immune\` permission makes you immune \
to the word filter and the rest are for their resspective actions.
`,
  example: `{p}wordfilter list\n\
{p}wordfilter setup\n\
{p}wordfilter set apple, banana, orange\n\
{p}wordfilter remove orange, banana
{p}wordfilter message You have been caught!
{p}wordfilter punish mute 2 minutes
{p}wordfilter strictness 4
{p}wordfilter toggle`,
  category: "Administration",
  args: { action: false, "parameter (or page, if using list)": true, "mute time (if using punish with mute)": true },
  guildOnly: true
}); */