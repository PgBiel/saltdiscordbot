const listpunish = require("./listpunish");

const Command = require("../../classes/command");

module.exports = Command.aliasFrom(listpunish, "listwarns", {
  perms: "listwarns",
  warns: true,
  default: true,
  description: "List active warns.",
  args: { "user or page": true, "page (when user is specified)": true },
  example: `{p}listwarns
{p}listwarns 2
{p}listwarns @Guy#0000
{p}listwarns @Guy#0000 3`
});
