"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.permissions = deps_1.sql.define(`perms`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    thingid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    type: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    command: {
        type: deps_1.Sequelize.TEXT,
        allowNull: false,
    },
    is_custom: {
        type: deps_1.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    extra: deps_1.Sequelize.TEXT,
    negated: {
        type: deps_1.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
});
exports.disabledcmds = deps_1.sql.define(`disabledcmds`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    command: deps_1.Sequelize.STRING,
    type: deps_1.Sequelize.STRING,
    channelid: deps_1.Sequelize.STRING,
});
