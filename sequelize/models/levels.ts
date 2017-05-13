import { Sequelize, sql } from "../../util/deps";

export const levels = sql.define(`levels`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  xp: Sequelize.DOUBLE, // .UNSIGNED,
  level: Sequelize.INTEGER, // .UNSIGNED,
  rewards_on: Sequelize.BOOLEAN,
});

export const levelRewards = sql.define(`levelRewards`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  roleid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  level_earn: Sequelize.DOUBLE,
});
