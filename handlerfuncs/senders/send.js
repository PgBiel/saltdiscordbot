const protoSend = require("./proto-send");

module.exports = msg => msg && msg.channel ? protoSend(msg)(msg.channel.send.bind(msg.channel)) : msg;