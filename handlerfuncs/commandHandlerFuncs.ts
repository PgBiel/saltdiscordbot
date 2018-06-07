import bot from "./bot/bot";
import perms from "./perms/perms";
import prompts from "./prompts/prompts";
import senders from "./senders/senders";
import * as _ from "lodash";
import { Message } from "discord.js";

const all = Object.assign(bot, perms, prompts, senders);

/**
 * Load all handler funcs
 * @param msg Message to operate with
 * @param isDoEval If is do eval
 */
export default function loadHandlerFuncs(msg: Message, isDoEval = false) {
  return Object.assign(bot(msg, isDoEval), perms(msg), prompts(msg), senders(msg));
}

export type HandlerFuncs = ReturnType<typeof loadHandlerFuncs>;
