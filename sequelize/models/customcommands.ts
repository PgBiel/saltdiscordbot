import { Sequelize, sql } from "../../util/deps";

export const commands = sql.define(`commands`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: Sequelize.TEXT,
  creator: Sequelize.STRING,
  response: Sequelize.TEXT,
});
