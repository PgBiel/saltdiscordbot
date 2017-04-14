const obj = {
  invites: sql.define(`invitefilters`, {
    serverid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    filter: Sequelize.BOOLEAN
  }),
  triggers: sql.define(`triggers`, {
    serverid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: Sequelize.TEXT,
    response: Sequelize.TEXT,
    creator: Sequelize.STRING
  })
};
module.exports = obj;