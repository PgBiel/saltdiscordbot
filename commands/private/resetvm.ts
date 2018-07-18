import { cmdFunc } from "../../misc/contextType";
import { Constants, ownerID, Command } from "../../misc/d";
import { resetSandContext } from "../../funcs/bot/messagerDoEval";

const func: cmdFunc<{}> = async function(msg, { reply }) {
  if ((msg.author.id !== Constants.identifiers.APLET && msg.author.id !== ownerID)) {
    return;
  }
  resetSandContext();
  return reply("VM Context reset successfully!");
};

export const resetvm = new Command({
  func,
  name: "resetvm",
  description: "Reset the sandbox VM context. (Technical stuff)",
  example: "+resetvm",
  category: "Private",
  guildOnly: false,
  customPrefix: "+",
  args: {},
  devonly: true
});
