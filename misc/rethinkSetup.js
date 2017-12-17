const { Connection, Db } = require("rethinkdb");

exports.tables = [
  "coins",
  "customcommands",
  "detects",
  "levels",
  "moderation",
  "mutes",
  "perms",
  "prefix",
  "punishments",
  "roles",
  "starboard",
  "verification",
  "warns",
  "welcfarew",
];

exports.setup = async function setup(r, conn) {
    const tableNames = await r.tableList().run(conn);
    for (const table of tables) {
      if (!tableNames.includes(table)) {
        r.tableCreate(table);
      }
    }
};
