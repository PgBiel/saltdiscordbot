const obj = {
  autoroles: sql.define(`autoroles`, {
    serverid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    autorole: Sequelize.STRING,
  }),
  selfroles: sql.define(`selfroles`, {
    serverid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    selfrole: Sequelize.STRING
  })
};
module.exports = obj;