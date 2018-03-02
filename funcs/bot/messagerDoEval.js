const messager = require("../../classes/messager");

/**
 * Factory function for event function for doEval on messager
 * @param {*} evaler The eval function
 * @returns {Function} The generated function
 */
module.exports = function messagerDoEval(evaler) {
  /**
   * Event function for doEval on messager
   * @param {*} data Data
   * @returns {void}
   */
  return async data => {
    // tslint:disable:no-shadowed-variable
    const {
      bot, message, msg, input, channel, guild, deps, funcs, guildId, send, reply, db, context, prompt,
      genPrompt, genPromptD
    } = data.vars;
    const { _, Constants, Storage, util, Discord, cross: cs } = deps;
    const { member, author } = context;
    for (const [name, func] of Object.entries(funcs)) {
      try {
        eval(`var { ${name} } = funcs`);
      } catch (err) {
        // lol
      }
    }
    // tslint:enable:no-shadowed-variable
    let cont = data.content;
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
  };
};
