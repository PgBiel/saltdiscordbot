"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.moderation = deps_1.sql.define(`mods`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    moderator: deps_1.Sequelize.STRING,
    administrator: deps_1.Sequelize.STRING,
    logs: deps_1.Sequelize.STRING,
});
