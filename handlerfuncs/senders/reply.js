const protoSend = require("./proto-send");

module.exports = msg => protoSend(msg)(msg.reply.bind(msg));