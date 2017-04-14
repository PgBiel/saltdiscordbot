const obj = {
  prefixes: sql.define(`prefixes`, {
    serverid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    prefix: Sequelize.TEXT
  })
};

module.exports = obj;