import { Sequelize, sql } from "../../util/deps";

export const prefixes = sql.define(`prefixes`, {
  serverid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  prefix: Sequelize.TEXT,
});
