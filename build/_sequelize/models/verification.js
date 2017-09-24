"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.verifications = deps_1.sql.define(`verifications`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    channelid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    roleid: {
        type: deps_1.Sequelize.BOOLEAN,
        allowNull: false,
        unique: true,
    },
    message: deps_1.Sequelize.TEXT,
    on: {
        type: deps_1.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});
