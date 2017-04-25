"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.mutes = deps_1.sql.define(`mutes`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    muteRoleID: deps_1.Sequelize.STRING,
});
exports.activemutes = deps_1.sql.define(`activemutes`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    userid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    timestamp: deps_1.Sequelize.STRING,
    permanent: deps_1.Sequelize.BOOLEAN,
});
