const obj = {
  welcome: sql.define(`welcomes`, {
    serverid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    welcome: Sequelize.TEXT,
    welcomechannel: Sequelize.STRING,
    farewell: Sequelize.TEXT,
    farewellchannel: Sequelize.STRING
  }),
};
module.exports = obj;