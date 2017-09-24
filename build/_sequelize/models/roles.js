"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.autoroles = deps_1.sql.define(`autoroles`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    autorole: deps_1.Sequelize.STRING,
});
exports.selfroles = deps_1.sql.define(`selfroles`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        allowNull: false,
    },
    selfrole: deps_1.Sequelize.STRING,
});
