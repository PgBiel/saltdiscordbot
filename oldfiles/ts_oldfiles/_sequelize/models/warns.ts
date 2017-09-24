import { Sequelize, sql } from "../../util/deps";

export const warns = sql.define(`warns`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  warn: Sequelize.TEXT,
  moderatorid: Sequelize.STRING,
  warnedat: Sequelize.STRING,
});

export const warnsteps = sql.define(`warnsteps`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  punishment: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  time: Sequelize.STRING,
});
