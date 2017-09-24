import { Sequelize, sql } from "../../util/deps";

export const coins = sql.define(`coins`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  amount: Sequelize.DOUBLE,
});

export const coinRewards = sql.define(`coinRewards`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  roleid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export const economy = sql.define(`economys`, {
  serverid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  eco_name: Sequelize.TEXT,
  eco_on: Sequelize.BOOLEAN,
  daily: Sequelize.DOUBLE,
  daily_on: Sequelize.BOOLEAN,
  rewards: Sequelize.BOOLEAN,
  chat: Sequelize.DOUBLE,
  chat_on: Sequelize.BOOLEAN,
});
