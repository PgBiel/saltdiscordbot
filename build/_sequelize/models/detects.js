"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.invites = deps_1.sql.define(`invitefilters`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    filter: deps_1.Sequelize.BOOLEAN,
});
exports.triggers = deps_1.sql.define(`triggers`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    name: deps_1.Sequelize.TEXT,
    response: deps_1.Sequelize.TEXT,
    creator: deps_1.Sequelize.STRING,
});
