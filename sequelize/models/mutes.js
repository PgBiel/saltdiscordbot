const obj = {
  mutes: sql.define(`mutes`, {
    serverid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    muteRoleID: Sequelize.STRING,
  }),
  activemutes: sql.define(`activemutes`, {
    serverid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    userid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    timestamp: Sequelize.STRING,
    permanent: Sequelize.BOOLEAN
  })
};
module.exports = obj;