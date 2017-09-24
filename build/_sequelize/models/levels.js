"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.levels = deps_1.sql.define(`levels`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    userid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    xp: deps_1.Sequelize.DOUBLE,
    level: deps_1.Sequelize.INTEGER,
    rewards_on: deps_1.Sequelize.BOOLEAN,
});
exports.levelRewards = deps_1.sql.define(`levelRewards`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    roleid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    level_earn: deps_1.Sequelize.DOUBLE,
});
