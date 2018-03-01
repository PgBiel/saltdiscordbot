const bot = require("../../util/bot");
const cross = require("../../classes/cross");
const send = require("../../handlerfuncs/senders/send");
const reply = require("../../handlerfuncs/senders/reply");

module.exports = async function sendTo(id, msgOrOptions, options) {
  const opts = typeof msgOrOptions === "object" ? msgOrOptions : (options || {});
  const mode = opts.mode == null || !["send", "reply"].includes(opts.mode) ? "send" : opts.mode;
  if (!(await (cross.channels.has(id)))) return null;
  const channel = await (cross.channels.get(id));
  const obj = { author: opts.author, guild: opts.guild || channel.guild, channel };
  if (mode === "send") {
    return send(obj)(msgOrOptions, opts);
  } else {
    return reply(obj)(msgOrOptions, opts);
  }
};
