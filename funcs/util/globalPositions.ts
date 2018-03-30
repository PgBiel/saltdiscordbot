import { Collection, Guild, CategoryChannel, GuildChannel } from "discord.js";

export default function globalPositions(guild: Guild, includeCategories = false) {
  const { channels } = guild;
  const trueChannels = new Collection<string, GuildChannel>();
  let position = 0;
  const set = (id: string, c: GuildChannel) => trueChannels.set(id, Object.assign({}, c, { position: position++ }));
  for (const [id, chan] of channels.filter(c => !c.parent).sort((a, b) => a.position - b.position)) {
    if (chan instanceof CategoryChannel) {
      if (includeCategories) set(id, chan);
      for (const [iid, cchan] of chan.children) set(iid, cchan);
    } else {
      set(id, chan);
    }
  }
  return trueChannels;
}
