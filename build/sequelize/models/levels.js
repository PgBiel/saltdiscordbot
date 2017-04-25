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
    xp: deps_1.Sequelize.DOUBLE.UNSIGNED,
    level: deps_1.Sequelize.INTEGER.UNSIGNED,
});
