const obj = {
  moderation: sql.define(`mods`, {
    serverid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    moderator: Sequelize.STRING,
    administrator: Sequelize.STRING,
    logs: Sequelize.STRING
  })
};
module.exports = obj;