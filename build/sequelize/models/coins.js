"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.coins = deps_1.sql.define(`coins`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    userid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    amount: deps_1.Sequelize.DOUBLE,
});
exports.coinRewards = deps_1.sql.define(`coinRewards`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    roleid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
});
exports.economy = deps_1.sql.define(`economys`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    eco_name: deps_1.Sequelize.TEXT,
    eco_on: deps_1.Sequelize.BOOLEAN,
    daily: deps_1.Sequelize.DOUBLE,
    daily_on: deps_1.Sequelize.BOOLEAN,
    rewards: deps_1.Sequelize.BOOLEAN,
    chat: deps_1.Sequelize.DOUBLE,
    chat_on: deps_1.Sequelize.BOOLEAN,
});
