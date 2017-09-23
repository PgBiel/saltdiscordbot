"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
async function setup(r, conn) {
    const tableNames = await r.tableList().run(conn);
    for (const table of exports.tables) {
        if (!tableNames.includes(table)) {
            r.tableCreate(table);
        }
    }
}
exports.default = setup;
