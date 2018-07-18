import messager from "../../classes/messager";
import * as vm from "vm";

export interface IMessagerEvalData {
  content: string;
  vars: { [prop: string]: any };
  id: number;
  isSand: boolean;
}

export interface IMessagerEvalResult {
  success: boolean;
  result: any;
}

let sandContext: vm.Context;

export function resetSandContext() { sandContext = undefined; }

/**
 * Do eval
 */
export default async function messagerDoEval(data: IMessagerEvalData) {
  const {
    bot, message, msg, input, channel, guild, deps, funcs, guildId, send, reply, db, context, prompt,
    genPrompt, genPromptD
  } = data.vars;
  const { isSand } = data;
  const { _, Constants, moment, Storage, util, Discord, cross: cs } = deps;
  const { member, author } = context;
  const extraData: { [prop: string]: any } = {};
  if (isSand) {
    Object.assign(extraData, deps, funcs);
  } else {
    for (const [name, func] of Object.entries(funcs)) {
      try {
        eval(`var { ${name} } = funcs`); // tslint:disable-line:no-eval
      } catch (err) {
        // lol
      }
    }
  }
  const cont: string = data.content;
  try {
    const contextified = isSand ? sandContext || (sandContext = vm.createContext(extraData)) : {};
    const result = isSand ? vm.runInContext(cont, contextified) : eval(cont); // tslint:disable-line:no-eval
    messager.emit(`${data.id}eval`, {
      success: true,
      result
    });
  } catch (err) {
    messager.emit(`${data.id}eval`, {
      success: false,
      result: err
    });
  }
}
