import { Sequelize, sql } from "../../util/deps";

export const verifications = sql.define(`verifications`, {
  serverid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  channelid: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  roleid: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    unique: true,
  },
  message: Sequelize.TEXT,
  on: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
