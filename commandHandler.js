module.exports = async msg=>{
  const input = msg.content;
  const chanel = msg.channel;
  const message = msg;
  const upparcaso = input.toUpperCase();
  const gueldid = message.guild ? message.guild.id : null;
  let thingy;
  try {
    thingy = msg.guild ? (await prefixes.findOne({ where: { serverid: msg.guild.id } })) || "+" : "+";
  } catch (err) {
    console.error(chalk.red("[ERROR]"), `Error at Command Handler (await/thingy): ${err}`);
    return;
  }
  let prefix;
  if (thingy) {
    prefix = thingy.prefix || thingy;
  }
  console.log(chalk.green("[DEBUG]"), prefix);
  const {Collection} = Discord;
  let mentionfix;
  if (/^<@!?244533925408538624>\s?/i.test(input)) {
    if (!(/^<@!?244533925408538624>\s?/i.test(prefix))) {
      mentionfix = input.match(/^(<@!?244533925408538624>\s?)/)[1];
    }
  }
  const disabledreply = function(pt) {message.reply(":lock: That command has been disabled for this "+pt+"!");};
  const checkmodrole = function(member) {
    if (servermods[gueldid]) {
      if (servermods[gueldid].moderator !== "") {
        if (member.roles.get(servermods[gueldid].moderator)) {
          return true;
        } else {
          return false;
        }
      }
    }
  };
  const checkperm = function(node, returnarr = true, author = message.member) {
    return returnarr ? permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id) : (typeof (permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id)) == "string" ? permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id) : permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id)[0]);
  };
  const theGrandObject = {
    checkperm, disabledreply, checkmodrole, prefix, gueldid, mentionfix, upparcaso, input, chanel, msg,
    channel: chanel, guildid: gueldid, inputUpCase: upparcaso, send: chanel.send.bind(chanel), reply: msg.reply.bind(msg), message: msg,
  };
  if (msg.channel.type === "text" && !(msg.author.bot)) {
    (function(){
      //start of text channel part
      theGrandObject.botmember = msg.guild.member(bot.user);
      //require("./misc/autoSaver.js")(msg, gueldid);
      if (/^\+prefix/i.test(input)) {
        const instruction = input.replace(/^\+/i, "");
        theGrandObject.instruction = instruction;
        theGrandObject.args = instruction.replace(/^prefix\s*/i, "").length < 1 ? null : instruction.replace(/^prefix\s*/i, "");
        theGrandObject.arrargs = theGrandObject.args ? theGrandObject.args.split` ` : null;
        return bot.commands.prefix.func(message, theGrandObject);
      }
      if (!(upparcaso.startsWith(prefix.toUpperCase()) || /^<@!?244533925408538624>\s?/i.test(upparcaso))) return; //console.log(colors.green("AAAAA"), upparcaso, prefix);
      const instruction = input.replace(new RegExp("^" + _.escapeRegExp(mentionfix||prefix), "i"), "");
      theGrandObject.instruction = instruction;
      console.log(colors.green("[DEBUG]"), instruction);
      for (let cmdn in bot.commands) {
        const cmd = bot.commands[cmdn];
        /*const noPattern = _=>{
          console.error(colors.red("[ERROR]") + " Attempted to load " + (cmd.name?`command ${cmd.name}`:"unnamed command") + " but " + (_||"it had no pattern!"));
          tocontinue = true;
        };*/
        //if (!(cmd.pattern)) noPattern();
        //if (!(cmd.pattern instanceof RegExp || typeof cmd.pattern === "string")) noPattern("it had an invalid pattern!");
        if (!(cmd.func)) {
          console.error(colors.red("[ERROR]") + ` Attemped to load ${cmd.name?`command ${cmd.name}`:"unnamed command"} but it had no function!`);
          continue;
        }
        if (cmd.name === "prefix") continue;
        const exeFunc = async () => {
          let flummery;
          try {
            flummery = await perms.isDisabled(gueldid, chanel.id, cmd.name);
          } catch (err) {
            return rejct(err);
          }
          if (flummery) return message.reply(":lock: That command is disabled for this " + flummery + "!");
          const zeperms = cmd.perms;
          if (zeperms) {
            const targetobj = typeof zeperms === "string" ? {} : cloneObject(zeperms);
            if (typeof zeperms === "string") targetobj[zeperms] = !!cmd.default;
            const flummery = {};
            for (const thang in targetobj) {
              const thingy = targetobj[thang];
              try {
                flummery[thang] = await perms.hasPerm(msg.member, gueldid, thang, typeof thingy === "boolean" ? thingy : !!thingy.default);
              } catch (err) {
                flummery[thang] = null;
                console.error(colors.red(`[ERR/PERMCHECK]`), err);
              }
              flummery[thang] = !!flummery[thang];
            }
            theGrandObject.perms = flummery;
          }
          theGrandObject.args = instruction.replace(`^${_.escapeRegExp(cmd.name)}\\s*`, "i").length < 1 ? null : instruction.replace(`^${_.escapeRegExp(cmd.name)}\s*`, "i");
          theGrandObject.arrargs = theGrandObject.args ? theGrandObject.args.split` ` : null;
          let result;
          try {
            result = cmd.func(message, theGrandObject);
          } catch (err) {
            return doError(err);
          }
          if (result instanceof Promise) result.catch(rejct);
        };
        //console.log(chalk.green("[DEBUG 101]"), new RegExp(`^${_.escapeRegExp(cmd.name)}(?:\\s*[^]+)?$`, "i"));
        if (cmd.pattern && cmd.pattern instanceof RegExp ? cmd.pattern.test(instruction) : cmd.pattern === instruction) return exeFunc().catch(rejct);
        else if ((new RegExp(`^${_.escapeRegExp(cmd.name)}(?:\s*[^]+)?$`, "i")).test(instruction)) return exeFunc().catch(rejct);
      }
      //end of text channel part
    })();
  }
};