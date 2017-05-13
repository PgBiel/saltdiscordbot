"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.cases = deps_1.sql.define(`punishments`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    type: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    moderator: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    time: deps_1.Sequelize.STRING,
    reason: deps_1.Sequelize.TEXT,
    duration: deps_1.Sequelize.STRING,
    messageid: deps_1.Sequelize.STRING,
    case: deps_1.Sequelize.STRING,
});
