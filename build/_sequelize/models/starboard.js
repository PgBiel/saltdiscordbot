"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../../util/deps");
exports.starboard = deps_1.sql.define(`starboards`, {
    serverid: {
        type: deps_1.Sequelize.STRING,
        primaryKey: true,
    },
    channelid: deps_1.Sequelize.STRING,
});
