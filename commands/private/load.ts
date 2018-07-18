import Command from "../../classes/command";
import { loadCmd, util, Constants, ownerID, Message } from "../../misc/d";
import { cmdFunc } from "../../misc/contextType";

const func: cmdFunc<{}> = async function(msg: Message, { args, doEval, send, reply, self }) {
  if ((msg.author.id !== Constants.identifiers.APLET && msg.author.id !== ownerID) || !args) {
    return;
  }
  const cmd = loadCmd(args);
  reply(`\`\`\`js\n${util.inspect(cmd)}\n\`\`\``, { deletable: true });
};

export const load = new Command({
  func,
  name: "load",
  description: "Reload a command.",
  example: "+load info",
  category: "Private",
  guildOnly: false,
  customPrefix: "+",
  args: { command: false },
  devonly: true
});
