import { Sequelize, sql } from "../../util/deps";

export const permissions = sql.define(`perms`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  thingid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  command: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  is_custom: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  extra: Sequelize.TEXT,
  negated: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});
export const disabledcmds = sql.define(`disabledcmds`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  command: Sequelize.STRING,
  type: Sequelize.STRING,
  channelid: Sequelize.STRING,
});
