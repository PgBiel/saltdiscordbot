import * as deps from "../../util/deps";
import * as funcs from "../../funcs/funcs";
import hndlerfunc = require("../commandHandlerFuncs");
import { Message } from "discord.js";
import { IMessagerEvalResult, IMessagerEvalData } from "../../funcs/bot/messagerDoEval";

const { bot, db, messager } = deps;

export default (msg: Message) => {
  const { channel, guild } = msg;
  const guildId = guild ? guild.id : null;
  const { default: handlerFuncsReq }: typeof hndlerfunc = require("../commandHandlerFuncs");
  const handlerFuncs = handlerFuncsReq(msg, true); // lazy require for no mess up
  return (content: string, subC: object = {}, isSand: boolean): Promise<IMessagerEvalResult> => {
    const objectToUse = Object.assign({}, handlerFuncs, {
      bot, msg, message: msg,
      channel, guildId, deps,
      funcs, context: subC || {},
      guild, db
    });
    const data: IMessagerEvalData = {
      content,
      id: Date.now(),
      vars: objectToUse,
      isSand
    };
    return messager.awaitForThenEmit("doEval", data, data.id + "eval");
  };
};
