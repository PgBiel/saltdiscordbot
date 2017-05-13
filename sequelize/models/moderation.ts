import { Sequelize, sql } from "../../util/deps";

export const moderation = sql.define(`mods`, {
  serverid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  moderator: Sequelize.STRING,
  administrator: Sequelize.STRING,
  logs: Sequelize.STRING,
  latestCase: Sequelize.STRING,
});
