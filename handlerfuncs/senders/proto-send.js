const { _, Constants } = require("../../util/deps");
const collectReact = require("../../funcs/bot/collectReact");
const paginateReactions = require("../../funcs/util/paginateReactions");
const mkEmj = require("../../funcs/parsers/mkEmoji");
const rejctF = require("../../funcs/util/rejctF");

module.exports = (msg, data) => {
  const { author, channel, guild } = msg;
  const dankAuthor = (data || msg).author;
  return func => { // factory for sending functions
    return (content, options) => {
      if (typeof content === "object" && !options && !(content instanceof Array)) {
        options = content;
        content = "";
      } else if (!options) {
        options = {};
      }
      const result = func(content, options);
      if (options.autoCatch == null || options.autoCatch) {
        result.catch(rejctF("[PROTOSEND-AUTOCATCH]"));
      }
      return result.then(messg => {
        if (channel.typing) channel.stopTyping();
        if (
          messg && // message was sent successfully
          messg.react && // message was actually sent successfully
          guild ? (
            guild.me.hasPermission(["ADD_REACTIONS"]) && // I can add reactions
            channel && // ????
            channel.permissionsFor(guild.me).has(["ADD_REACTIONS"]) // I can definitely add reactions
          ) : true
        ) {
          let procceeded = false; // if pagination was done
          const { deletable, paginate } = options;
          console.log("ISPAG", paginate);
          if (paginate) { // paginate
            const { page: sPage, maxPage } = paginate;
            const { left, right } = Constants.emoji.arrows;
            const page = _.clamp(sPage, 1, maxPage);
            const dPage = maxPage - page + 1;
            const emojis = paginateReactions(page, maxPage, { left, right });
            console.log(page, emojis);
            if (emojis.length > 0) {
              procceeded = true;
              if (deletable) emojis.unshift(Constants.emoji.resolved.rjt.DELETE);
            
              const onSuccess = async (ret, coll, mssg) => {
                const emjzero = coll[0].emoji; // emoji reacted
                const re = emjzero.id ? mkEmj(emjzero.id, emjzero.name) : emjzero.name;
                console.log("RE", re, coll);
                if (re === Constants.emoji.rjt.DELETE) return collectReact.funcs.DELETE_MSG(ret, coll, mssg);
                await collectReact.funcs.REMOVE_ALL(ret, coll, mssg);
                let newPage;
                const { SKIP: supSkip, SPECIALS: specialSup, DIVIDE_BY: divideBy } = Constants.numbers.pagination.super;
                if (Object.values(left).includes(re)) {
                  const { END: end, SUP: sup, ONE: one } = left;
                  if (re === end) {
                    newPage = 1;
                  } else if (re === one) {
                    newPage = page - 1;
                  } else if (re === sup) {
                    const quant = page < 2 ?
                      0 :
                      _.clamp(Math.floor(maxPage / divideBy), 2, supSkip);
                    newPage = page - quant;
                  }
                } else if (Object.values(right).includes(re)) {
                  const { END: end, SUP: sup, ONE: one } = right;
                  if (re === end) {
                    newPage = maxPage;
                  } else if (re === one) {
                    newPage = page + 1;
                  } else {
                    const quant = dPage < 2 ?
                      0 :
                      _.clamp(Math.floor(maxPage / divideBy), 2, supSkip);
                    newPage = page + quant;
                  }
                }
                if (typeof paginate.func === "function") {
                  await paginate.func(
                    _.clamp(newPage || page, 1, maxPage),
                    { pages: paginate.pages, data: paginate.data, ret, coll, msg: mssg }
                  ); 
                } else if (paginate.usePages) {
                  const { content = paginate.content, struct = paginate.struct } = (paginate.pages || [])[(newPage || page) - 1];
                  let structToUse = struct;
                  if (typeof paginate.format === "function") {
                    structToUse = await paginate.format(newPage, struct, paginate.pages);
                  }
                  const edit = require("../../funcs/bot/edit"); // lazy require to not mess things up
                  await edit(
                     mssg, 
                    { author: (data || msg).author },
                    content || undefined,
                    { embed: structToUse, deletable, paginate: Object.assign({}, paginate, { page: newPage }) }
                  );
                }
              };
              collectReact(messg, emojis, dankAuthor.id, {
                rawReact: true, onSuccess
              });
            }
          }
          if (deletable && !procceeded) { // react with a deleting emoji
            collectReact(messg, Constants.emoji.WASTEBASKET, dankAuthor.id)
              .catch(rejctF("[TRASH-REACT-1]"));
          }
        }
        return messg;
      });
    };
  };
};
