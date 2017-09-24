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
  moderator: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  time: Sequelize.STRING,
  reason: Sequelize.TEXT,
  duration: Sequelize.STRING,
  messageid: Sequelize.STRING,
  case: Sequelize.STRING,
  thumbnail: Sequelize.STRING,
});
