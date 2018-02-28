const { Collection } = require("discord.js");

module.exports = function globalPositions(guild, includeCategories = false) {
  const { channels } = guild;
  const trueChannels = new Collection();
  let position = 0;
  const set = (id, c) => trueChannels.set(id, Object.assign({}, c, { position: position++ }));
  for (const [id, chan] of channels.filter(c => !c.parent).sort((a, b) => a.position - b.position)) {
    if (chan.type === "category") {
      if (includeCategories) set(id, chan);
      for (const [iid, cchan] of chan.children) set(iid, cchan);
    } else {
      set(id, chan);
    }
  }
  return trueChannels;
};
