const protoSend = require("./proto-send");

module.exports = msg => protoSend(msg)(msg.channel.send.bind(msg.channel));