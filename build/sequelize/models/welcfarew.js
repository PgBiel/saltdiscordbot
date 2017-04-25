"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.welcome = deps_1.sql.define(`welcomes`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    welcome: deps_1.Sequelize.TEXT,
    welcomechannel: deps_1.Sequelize.STRING,
    farewell: deps_1.Sequelize.TEXT,
    farewellchannel: deps_1.Sequelize.STRING,
});
