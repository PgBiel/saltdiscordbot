import bot from "../../util/bot";
import cross from "../../classes/cross";
import send from "../../handlerfuncs/senders/send";
import reply from "../../handlerfuncs/senders/reply";
import { MessageOptions, Message, User, Guild, DMChannel, TextChannel } from "discord.js";
import { GuildChannel } from "../../util/deps";

export type SendToOptions = MessageOptions & {
  author?: User,
  guild?: Guild
};

export default async function sendTo(id: string, options: SendToOptions): Promise<Message>;
export default async function sendTo(id: string, msg: string, options: SendToOptions): Promise<Message>;
export default async function sendTo(
  id: string, msgOrOptions: SendToOptions | string, options?: SendToOptions
) {
  let opts: SendToOptions;
  let content: string;
  if (typeof msgOrOptions === "string") {
    opts = options;
    content = msgOrOptions;
  } else {
    opts = msgOrOptions;
    content = undefined;
  }
  if (!(await (cross.channels.has(id)))) return null;
  const channel = await (cross.channels.get(id));
  if (
    !(channel instanceof DMChannel || channel instanceof TextChannel)
  ) return null;
  const obj = {
    author: opts.author, guild: opts.guild || (channel instanceof GuildChannel ? channel.guild : {} as never), channel
  };
  return send(obj)(content, opts);
}
