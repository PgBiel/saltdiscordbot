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
  xp: Sequelize.DOUBLE.UNSIGNED,
  level: Sequelize.INTEGER.UNSIGNED,
});
