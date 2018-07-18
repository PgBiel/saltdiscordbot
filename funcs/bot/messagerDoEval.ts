import messager from "../../classes/messager";

export interface IMessagerEvalData {
  content: string;
  vars: { [prop: string]: any };
  id: number;
}

export interface IMessagerEvalResult {
  success: boolean;
  result: any;
}

/**
 * Do eval
 */
export default async function messagerDoEval(data: IMessagerEvalData) {
  const {
    bot, message, msg, input, channel, guild, deps, funcs, guildId, send, reply, db, context, prompt,
    genPrompt, genPromptD
  } = data.vars;
  const { _, Constants, moment, Storage, util, Discord, cross: cs } = deps;
  const { member, author } = context;
  for (const [name, func] of Object.entries(funcs)) {
    try {
      eval(`var { ${name} } = funcs`); // tslint:disable-line:no-eval
    } catch (err) {
      // lol
    }
  }
  const cont: string = data.content;
  try {
    const result = eval(cont); // tslint:disable-line:no-eval
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
