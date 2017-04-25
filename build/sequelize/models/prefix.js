"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.prefixes = deps_1.sql.define(`prefixes`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    prefix: deps_1.Sequelize.TEXT,
});
