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
  amount: Sequelize.DOUBLE.UNSIGNED,
});

export const economy = sql.define(`economygs`, {
  serverid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  ecoName: Sequelize.TEXT,
});
