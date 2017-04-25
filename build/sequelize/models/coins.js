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
    amount: deps_1.Sequelize.DOUBLE.UNSIGNED,
});
exports.economy = deps_1.sql.define(`economygs`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    ecoName: deps_1.Sequelize.TEXT,
});
