"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.commands = deps_1.sql.define(`commands`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    name: deps_1.Sequelize.TEXT,
    creator: deps_1.Sequelize.STRING,
    response: deps_1.Sequelize.TEXT,
});
