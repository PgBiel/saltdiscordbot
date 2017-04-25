import { Sequelize, sql } from "../../util/deps";

export const autoroles = sql.define(`autoroles`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  autorole: Sequelize.STRING,
});
export const selfroles = sql.define(`selfroles`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  selfrole: Sequelize.STRING,
});
