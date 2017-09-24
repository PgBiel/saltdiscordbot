import { Sequelize, sql } from "../../util/deps";

export const starboard = sql.define(`starboards`, {
  serverid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  channelid: Sequelize.STRING,
});
