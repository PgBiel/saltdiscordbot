"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.warns = deps_1.sql.define(`warns`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    userid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    warn: deps_1.Sequelize.TEXT,
    moderatorid: deps_1.Sequelize.STRING,
    warnedat: deps_1.Sequelize.STRING,
});