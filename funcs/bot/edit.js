const protoSend = require("../../handlerfuncs/senders/proto-send");

const func = function edit(msg, data, ...args) {
  if (msg && msg.edit) {
    return protoSend(msg, data)(msg.edit.bind(msg))(...args);
  }
};
func.data = Symbol("editData");

module.exports = func;
