import { Connection, Db } from "rethinkdb";

export const tables = [
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

export default async function setup(r: Db, conn: Connection) {
    const tableNames = await r.tableList().run(conn);
    for (const table of tables) {
      if (!tableNames.includes(table)) {
        r.tableCreate(table);
      }
    }
}
