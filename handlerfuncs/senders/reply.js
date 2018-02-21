const protoSend = require("./proto-send");

module.exports = msg => msg && msg.reply ? protoSend(msg)(msg.reply.bind(msg)) : null;