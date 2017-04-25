import { Sequelize, sql } from "../../util/deps";

export const cases = sql.define(`punishments`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  moderator: Sequelize.STRING,
  time: Sequelize.STRING,
  reason: Sequelize.TEXT,
  duration: Sequelize.STRING,
  messageid: Sequelize.STRING,
  case: Sequelize.STRING,
});
