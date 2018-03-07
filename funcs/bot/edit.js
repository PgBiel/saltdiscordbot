const protoSend = require("../../handlerfuncs/senders/proto-send");

const func = function edit(msg, ...args) {
  if (msg && msg.edit) {
    return protoSend(msg, msg[edit.data])(msg.edit.bind(msg))(...args);
  }
};
func.data = Symbol("editData");

module.exports = func;
