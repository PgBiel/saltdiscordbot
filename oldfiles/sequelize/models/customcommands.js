const obj = {
  commands: sql.define(`commands`, {
    serverid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: Sequelize.TEXT,
    creator: Sequelize.STRING,
    response: Sequelize.TEXT
  }),
};
module.exports = obj;