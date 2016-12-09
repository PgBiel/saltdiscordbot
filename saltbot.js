//jshint esversion: 6
'esversion:6'; 
var Discord = require("discord.js");
var bot = new Discord.Client({
    disableEveryone: true,
    disabledEvents: ["TYPING_START", "TYPING_STOP", "PRESENCE_UPDATE", "GUILD_MEMBER_UPDATE"],
});
var fs = require("fs");
process.chdir("./Documents/Bot Stuff/Salt");
var saltandsugar = "MjQ0NTMzOTI1NDA4NTM4NjI0.CyuJtA.YiQx2wI1kM7p2OPS6aOditoGbw8";
admins = JSON.parse(fs.readFileSync("./Info/admins.json", "utf8"));
var servsr = JSON.parse(fs.readFileSync("./Info/serverthings.json", "utf8"));
const webhook = require("discord-webhooks");
const ytdl = require("ytdl-core");
let volume = 1;
const streamOptions = { seek: 0, volume: 0 };
const ownerID = "180813971853410305";
const antitrigger = {};
const Jimp = require("jimp");
const request = require("request");
const fullencrypt = require("./Wrappers/fullencrypt.js");
const help = require("./help.js");
const mee6 = require("./Wrappers/mee6rank.js");
let jsarray = require("jsfuck");
jsarray = jsarray.JSFuck ? jsarray.JSFuck : jsarray;
let Trello = require("./Wrappers/aplet-trello.js").authenticate("82ed3e00be90ade0b58a3ac2082f4fbc", "a31d66855c9068c8b26e0cee71f65f484379db4c270c8876a51229ad737bafdb");
adminfile = require("./Info/admins.json");
userreminders = require("./Users/reminders.json");
serverthings = require("./Info/serverthings.json");
servercmds = require("./Info/servercommands.json");
servermsgs = require("./Info/servermessages.json");
serverroles = require("./Info/serverroles.json");
servermutes = require("./Info/servermutes.json");
serverdetects = require("./Info/serverdetects.json");
servermods = require ("./Info/servermods.json");
serverwarns = require("./Info/serverwarns.json");
publickeys = require("./Game/publickeys.json");
gamejs = require("./Game/game.json");
serverself = require("./Info/serverselfroles.json");
contacts = require("./Game/contact.json");
var adminfilefordeletion = require("./Info/admins.json");
bot.on("debug", console.log);
bot.on("warn", console.log);
function capitalize(string, splite = false) {
    return splite ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1);
}
function formatDate(date, fulldate = false) {
    var d = new Date(date);
    var hh = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var dd = "AM";
    var h = hh;
    if (h >= 12) {
        h = hh-12;
        dd = "PM";
    }
    if (h === 0) {
        h = 12;
    }
    m = m<10?"0"+m:m;

    s = s<10?"0"+s:s;

    
    h = h<10?"0"+h:h;

    var pattern = new RegExp("0?"+hh+":"+m+":"+s);

    var replacement = h+":"+m;
    replacement += ":"+s;
    replacement += " "+dd;    

    return fulldate ? date.toString().replace(pattern,replacement) : replacement;
}
function cleanup(object) {
    for (var i in object) {
        if (object[i] === undefined) {
            delete object[i];
        }
    }
    return object;
}
function writeServer() {
    fs.writeFileSync("./Info/serverthings.json", JSON.stringify(serverthings));
    serverthings = require("./Info/serverthings.json");
}
function writeCmd() {
    fs.writeFileSync("./Info/servercommands.json", JSON.stringify(servercmds));
    servercmds = require("./Info/servercommands.json");
}
function writeMsg() {
    fs.writeFileSync("./Info/servermessages.json", JSON.stringify(servermsgs));
    servermsgs = require("./Info/servermessages.json");
}
function writeRoles() {
    fs.writeFileSync("./Info/serverroles.json", JSON.stringify(serverroles));
    serverroles = require("./Info/serverroles.json");
}
function writeMutes() {
    fs.writeFileSync("./Info/servermutes.json", JSON.stringify(servermutes));
    servermutes = require("./Info/servermutes.json");
}
function writeGame() {
    fs.writeFileSync("./Game/game.json", JSON.stringify(gamejs));
    gamejs = require("./Game/game.json");
}
function writeDetects() {
    fs.writeFileSync("./Info/serverdetects.json", JSON.stringify(serverdetects));
    serverdetects = require("./Info/serverdetects.json");
}
function writeMods() {
    fs.writeFileSync("./Info/servermods.json", JSON.stringify(servermods));
    servermods = require("./Info/servermods.json");
}
function writeWarns() {
    fs.writeFileSync("./Info/serverwarns.json", JSON.stringify(serverwarns));
    serverwarns = require("./Info/serverwarns.json");
}
function writeKeys() {
    fs.writeFileSync("./Game/publickeys.json", JSON.stringify(publickeys));
    publickeys = require("./Game/publickeys.json");
}
function writeSelfRoles() {
    fs.writeFileSync("./Info/serverselfroles.json", JSON.stringify(serverself));
    serverself = require("./Info/serverselfroles.json");
}
function writeReminders() {
    fs.writeFileSync("./Users/reminders.json", JSON.stringify(userreminders));
    userreminders = require("./Users/reminders.json");
}
function writeContacts() {
    fs.writeFileSync("./Game/contact.json", JSON.stringify(contacts));
    contacts = require("./Game/contact.json");
}
function muteGet(item, index) {
    foundmuted = item;
}
function search(type, arg, guild) {
    try {
        if (/^user$/i.test(type)) {
            let arr = [];
            let oldarr = arr;
            let argregex = new RegExp(arg.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m), "i");
            guild.members.map(v=>{
                if (argregex.test(v.user.username)) {
                    arr.push(v.user);
                }
            });
            if (arr.length === 0) {
                let arr = [];
                guild.members.map(v=>{
                    if (argregex.test(v.nickname)) {
                        arr.push(v.user);
                    }
                });
                return [arr, arr.length ? arr.length : null];
            }
            else
                return [arr, arr.length ? arr.length : null];
        } else if (/^role$/i.test(type)) {
            let arr = [];
            let argregex = new RegExp(arg.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m), "i");
            guild.roles.map(v=>{
                if (argregex.test(v.name)) {
                    arr.push(v);
                }
            });

            return [arr, arr.length ? arr.length : null];
        } else if (/^textchannel$/i.test(type)) {
            let arr = [];
            let argregex = new RegExp(arg.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m), "i");
            guild.channels.filter(c=>c.type=="text").map(v=>{
                if (argregex.test(v.name)) {
                    arr.push(v);
                }
            });

            return [arr, arr.length ? arr.length : null];
        } else if (/^voicechannel$/i.test(type)) {
            let arr = [];
            let argregex = new RegExp(arg.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m), "i");
            guild.channels.filter(c=>c.type=="voice").map(v=>{
                if (argregex.test(v.name)) {
                    arr.push(v);
                }
            });
            return [arr, arr.length ? arr.length : null];
        } else {
            throw new Error("Error: Invalid argument");
        }
    } catch (err) {
        throw new Error("Error: "+err.message);
    }
}
function toDate(datestring) {
    try {
        if (/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i.test(datestring)) {
            if (datestring.match(/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i)[1] !== "") {
                let datetoadd = {
                    weeks: 0,
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                };
                if (datestring.match(/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(\d+s)$/i)) datetoadd.seconds = Number(datestring.match(/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(\d+)s$/i)[1]);
                if (datestring.match(/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(\d+m)\s{0,4}(?:\d+s)?$/i)) datetoadd.minutes = Number(datestring.match(/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(\d+)m\s{0,4}(?:\d+s)?$/i)[1]);
                if (datestring.match(/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(\d+h)\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i)) datetoadd.hours = Number(datestring.match(/^(?:\d+w)?\s{0,4}(?:\d+d)?\s{0,4}(\d+)h\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i)[1]);
                if (datestring.match(/^(?:\d+w)?\s{0,4}(\d+d)\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i)) datetoadd.days = Number(datestring.match(/^(?:\d+w)?\s{0,4}(\d+)d\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i)[1]);
                if (datestring.match(/^(\d+w)\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i)) datetoadd.weeks = Number(datestring.match(/^(\d+)w\s{0,4}(?:\d+d)?\s{0,4}(?:\d+h)?\s{0,4}(?:\d+m)?\s{0,4}(?:\d+s)?$/i)[1]);
                let arr = [];
                for (let x in datetoadd) {
                    if (datetoadd[x] === 0 || datetoadd[x] == "0") {
                        arr.push("Hi");
                    }
                }
                if (arr.length == 5 || arr.length == "5") return "All zeros";
                let now = Date.now();
                datetoadd.seconds = datetoadd.seconds * 1000;
                datetoadd.minutes = datetoadd.minutes * 60000;
                datetoadd.hours = datetoadd.hours * 3600000;
                datetoadd.days = datetoadd.days * 86400000;
                datetoadd.weeks = datetoadd.weeks * 604800000;
                let thedate = now + datetoadd.seconds + datetoadd.minutes + datetoadd.hours + datetoadd.days + datetoadd.weeks;
                return thedate;
            } else {
                return "Invalid Date String";
            }
        } else {
            return "Invalid Date String";
        }
    } catch (err) {
        if (/^(?:TypeError:\s)?Cannot read property '1' of null$/i.test(err.message))
            return "Invalid Date String";
        else
          console.log(err.message);
    }
}
const claimresponsabilityfunc = function(number, obj, messageid, channelid, serverid) {
    servermods[serverid].duelogs[`${number}`] = {};
    servermods[serverid].duelogs[`${number}`].channel = channelid;
    servermods[serverid].duelogs[`${number}`].message = messageid;
    servermods[serverid].duelogs[`${number}`].object = obj;
    writeMods();
};
const actionLogs = function(messageid, channelid, serverid, action = "Unknown", authort = "Unknown", sufferet = "Unknown", usestime = false, time = null, reason = null) {
    try {
    if (!(servermods[serverid].duelogs.latestNumber)) {
        servermods[serverid].duelogs.latestNumber = 1;
        writeMods();
    }
    let sufferer = sufferet.toString();
    let author = authort.toString();
    this.date = new Date();
    this.lognumber = servermods[serverid].duelogs.latestNumber;
    this.claim = false;
    const badobj = {
        badone: [{
            name: `Action Log #${this.lognumber}`,
            value: action == "Unknown" ? "Unknown" : sufferer == "Unknown" || !(sufferer) ? `An unknown person was ${action.toLowerCase()}` : `${sufferer} was ${action.toLowerCase()}`,
            inline: false
        }, {
            name: "Author",
            value: author == "Unknown" ? [`Unknown (Claim responsability by doing **+claimrespon ${this.lognumber} [reason (Optional)]**)`, this.claim = true][0] : author,
            inline: true
        }, {
            name: "Reason",
            value: reason ? `${reason}` : `None`,
            inline: false
        }],
        muteone: [{
            name: `Action Log #${this.lognumber}`,
            value: action == "Unknown" ? "Unknown" : sufferer == "Unknown" || !(sufferer) ? `An unknown person was ${action.toLowerCase()}` : `${sufferer} was ${action.toLowerCase()}`,
            inline: false
        }, {
            name: "Author",
            value: author == "Unknown" ? [`Unknown (Claim responsability by doing **+claimrespon ${this.lognumber} [reason (Optional)]**)`, this.claim = true][0] : author,
            inline: true
        }, {
            name: "Muted For",
            value: `${time.toString().replace(/-0\.\d+/g, "0")}`,
            inline: true
        }, {
            name: "Reason",
            value: reason ? `${reason}` : `None`,
            inline: false
        }]};
    const obj = {
        title: "",
        url: "",
        thumbnail: {
            url: sufferer == "Unknown" ? "" : sufferer.avatarURL ? sufferer.avatarURL : bot.users.get(sufferer.toString().match(/^<@!?(\d+)>$/)[1]) ? bot.users.get(sufferer.toString().match(/^<@!?(\d+)>$/)[1]).avatarURL : "http://a5.mzstatic.com/us/r30/Purple71/v4/5c/ed/29/5ced295c-4f7c-1cf6-57db-e4e07e0194fc/icon175x175.jpeg"
        },
        color: 16745060,
        fields: usestime ? badobj.muteone : badobj.badone,
        footer: {
            text: `${formatDate(this.date, true).match(/^([^]+)$/i)[1]}`
        }
    };
    servermods[serverid].duelogs.latestNumber = this.lognumber + 1;
    writeMods();
    if (this.claim === true) {
        claimresponsabilityfunc(lognumber, obj, messageid, channelid, serverid);
    }

    return [obj, this.lognumber];
    } catch (err) {
        console.log(`Oh noe\n${err.message}`);
    }
};
bot.on("ready", () => {
    /* jshint sub:true */
    try {
    if (gamejs["game"] !== "") {
        bot.user.setGame(gamejs["game"]);
    }
    Array.from(bot.guilds).map(v=>{
        if (!(servermods[v[1].id])) {
            servermods[v[1].id] = {};
            servermods[v[1].id].moderator = "";
            servermods[v[1].id].administrator = "";
            servermods[v[1].id].logs = "";
            servermods[v[1].id].duelogs = {};
            writeMods();
        }
        if (servermods[v[1].id].logs !== "") {
            if (!(v[1].channels.get(servermods[v[1].id].logs))) {
                servermods[v[1].id].logs = "";
                writeMods();
            }
        }
    });
    setInterval(function(){
        for (var x in servermutes) {
            for (var y in servermutes[x]["mutes"]) {
                var mutedguy = bot.users.get(y);
                var mutedmember = bot.guilds.get(x).members.get(y);
                var rightnow = new Date().getTime();
                if (mutedmember) {
                    if ((rightnow >= servermutes[x]["mutes"][y]["expire"] || servermutes[x]["mutes"][y]["expire"] == "Infinity") && !(servermutes[x].mutes[y].permanent)) {
                        console.log("OH JEEZ BOOM");
                        if (mutedmember.roles.get(servermutes[x]["muteRoleID"])) {
                            if (mutedmember.guild.roles.get(servermutes[x].muteRoleID).editable)
                                mutedmember.removeRole(servermutes[x]["muteRoleID"]);
                        }
                        delete servermutes[x]["mutes"][y];
                        writeMutes();
                    } else {
                        if (mutedmember.roles.get(servermutes[x]["muteRoleID"])) {} else {
                            mutedmember.addRole(servermutes[x]["muteRoleID"]);
                        }
                    }
                } else {
                    if ((rightnow >= servermutes[x]["mutes"][y]["expire"] || servermutes[x]["mutes"][y]["expire"] == "Infinity") && !(servermutes[x].mutes[y].permanent)) {
                        console.log("OH JEEZ BOOM");
                        delete servermutes[x]["mutes"][y];
                        writeMutes();
                    }
                }
            }
        }
        for (var p in userreminders) {
            if (Date.now() >= userreminders[p].expire) {
                bot.users.get(p).sendMessage(`<@${p}> BEEP! BEEP! You've asked me to remind you this:\n\`${userreminders[p].remind}\`!`);
                delete userreminders[p];
                writeReminders();
            }
        }
        for (var l in contacts.cooldowns) {
            if (Date.now() >= contacts.cooldowns[l]) {
                delete contacts.cooldowns[l];
                writeContacts();
            }
        }
    }, 10000);
    } catch (e) {
        console.log(e);
    }
});
bot.on("channelDelete", (channel) => {
    try {
        if (channel.type=="text") {
            let guild;
            Array.from(bot.guilds).map(v=>{
                if (v[1].channels.get(channel.id)) {
                    guild = v[1];
                }
            });
            if (servermods[guild.id].logs !== "")
                if (servermods[guild.id].logs == channel.id) {
                    servermods[guild.id].logs = "";
                    writeMods();
                }
        }
    } catch (err) {
        console.log(`So I was checking the channel stuff and...\n${err.message}`);
    }
});
bot.on("guildCreate", (guild) => {
    /*jshint sub:true*/
    guild.defaultChannel.sendMessage("Hello, I am Salt! A discord bot by PgSuper!\n\nFeel free to use me for whatever you like! My default prefix is `+`, but you can change that! Do +prefix (prefix) to change it!\n:warning: It will always be **+prefix**!\n\nIf you want to join my official server, here's the link! https://discord.gg/amQP9m3\n\nNote: Use `+contact` to contact bot devs and support! For example: `+contact Help! This doesn't work!`");
    var createguildthings = "+";
    var guildid = guild.id;
    serverthings[(guildid)] = createguildthings;
    writeServer();
    servercmds[guildid] = {};
    writeCmd();
    servermsgs[guildid] = {};
    servermsgs[guildid]["welcome"] = {};
    servermsgs[guildid]["goodbye"] = {};
    servermsgs[guildid]["welcome"]["channel"] = guild.defaultChannel.id;
    servermsgs[guildid]["welcome"]["message"] = "";
    servermsgs[guildid]["goodbye"]["channel"] = guild.defaultChannel.id;
    servermsgs[guildid]["goodbye"]["message"] = "";
    writeMsg();
    serverroles[guildid] = "";
    writeRoles();
    servermutes[guildid] = {};
    servermutes[guildid]["muteRoleID"] = "";
    servermutes[guildid]["mutes"] = {};
    writeMutes();
    serverdetects[guildid] = {};
    serverdetects[guildid]["invite"] = "false";
    writeDetects();
    servermods[guildid] = {};
    servermods[guildid].moderator = "";
    servermods[guildid].administrator = "";
    servermods[guildid].logs = "";
    servermods[guildid].duelogs = {};
    writeMods();
    serverwarns[guildid] = {};
    serverwarns[guildid].warnedusers = {};
    serverwarns[guildid].setup = {};
    serverwarns[guildid].setup.limit = 0;
    serverwarns[guildid].setup.punishment = "";
    writeWarns();
    serverself[guildid] = {};
    writeSelfRoles();
});
bot.on("guildDelete", (guild) => {
    /* jshint sub:true */
    if (guild.id in serverthings) {
        delete serverthings[(guild.id)];
        writeServer();
    }
    if (guild.id in servermsgs) {
        delete servermsgs[(guild.id)];
        writeMsg();
    }
    if (guild.id in serverroles) {
        delete serverroles[(guild.id)];
        writeRoles();
    }
    if (guild.id in servermutes) {
        delete servermutes[(guild.id)]["mutes"];
    }
    if (guild.id in serverdetects) {
        delete serverdetects[guild.id];
    }
    // Commands and mute role IDs stay saved!
});
bot.on("guildMemberAdd", (member) => {
    /*jshint sub:true*/
    try {
        var memberguild = member.guild;
        var thetimeisnow = new Date().getTime();
        if (member.id !== "244533925408538624") {
            if (servermsgs[memberguild.id]["welcome"]["message"] !== "") {
                var welcomesend = servermsgs[memberguild.id]["welcome"]["message"].replace(/\{member\}/ig, member.user);
                var channelwelcome = memberguild.channels.get(servermsgs[memberguild.id]["welcome"]["channel"]);
                channelwelcome.sendMessage(welcomesend);
            }
            if (memberguild.id in servermutes) {
                if (servermutes[memberguild.id].mutes[member.id]) {
                    if (servermutes[memberguild.id].mutes[member.id].expire < thetimeisnow)
                        member.addRole(servermutes[memberguild.id].muteRoleID);
                }
            }
            if (serverroles[memberguild.id] !== "") {
                console.log(member.user.username);
                if (member.roles.has(serverroles[member.guild.id])) return;
                member.addRole(serverroles[member.guild.id]).then().catch(function(reason){
                    if (reason == "Error: Forbidden") {
                        setTimeout(function(){
                            member.addRole(serverroles[member.guild.id]);
                        }, 3500);
                    }
                });
            }
            if (servermsgs[memberguild.id].welcome.name)
                if (memberguild.member(bot.user).hasPermission("MANAGE_NICKNAMES") && member.highestRole !== memberguild.member(bot.user).highestRole)
                    member.setNickname(servermsgs[memberguild.id].welcome.name.replace(/\{name\}/ig, member.user.username));
        }
    } catch (err) {
        console.log("Error while doing welcome message at guild \"" + member.guild.name + "\":\n" + err.message);
    }
});
bot.on("guildMemberRemove", (member) => {
    /*jshint sub:true*/
    var memberguild = member.guild;
    if (member.id !== "244533925408538624" && servermsgs[memberguild.id]["welcome"]["message"] !== "") {
        var goodbyesend = servermsgs[memberguild.id]["goodbye"]["message"].replace(/\{member\}/ig, member.user);
        var channelgoodbye = memberguild.channels.get(servermsgs[memberguild.id]["goodbye"]["channel"]);
        channelgoodbye.sendMessage(goodbyesend);
    }
});
bot.on("messageDelete", message => {
    const chanel = message.channel;
    if (message.guild.id == "233644998460047365" && chanel.id == "234128579405807628") {
        const msgdate = new Date(message.createdTimestamp);
        const msgstamp = `${msgdate.getDate()}/${msgdate.getMonth() + 1}/${msgdate.getFullYear()}, ${msgdate.getHours()}:${msgdate.getMinutes()}:${msgdate.getSeconds()}`;
        const datenow = new Date();
        const datestamp = `${datenow.getDate()}/${datenow.getMonth() + 1}/${datenow.getFullYear()}, ${datenow.getHours()}:${datenow.getMinutes()}:${datenow.getSeconds()}`;
        bot.guilds.get("193903425640071168").channels.get("249949042115608576").sendMessage(`${message.author}'s message sent at ${msgstamp} was deleted at ${datestamp}, that said the following:
            ${message.content}`);
        if (message.attachments) {
            Array.from(message.attachments).map(v=>{
                const vv = v[1].url;
                if (vv !== "" && vv !== null) {
                    bot.guilds.get("193903425640071168").channels.find("name", "pgs-resid").sendFile(vv);
                }
            });
        }
    }
});
bot.on("messageUpdate", (oldmessage, message) => {
    /* jshint sub:true */
    const input = message.content;
    if (/(d[\s\n]*i?[\s\n]*s?[\s\n]*)?c[\s\n]*o[\s\n]*r[\s\n]*d[\s\n]*\.?[\s\n]*g[\s\n]*g[\s\n]*\/[\s\n]*\/?[\s\n]*(?:.+)/ig.test(input)) {
        if (message.guild.id in serverdetects && serverdetects[message.guild.id]["invite"] == "true") {
            if (message.deletable === true && message.author.bot === false && !(message.member.hasPermission("ADMINISTRATOR")) && message.author.id !== ownerID) {
                message.delete();
                message.reply("This server does not allow invite links in their messages!").then(msg => {
                    setTimeout(function(){
                        msg.delete();
                    }, 7000);
                });
            }
        }
    }
});
bot.on("message", message => {
    if(message.channel.type==="text" && !(message.author.bot)) {
	var input = message.content;
    var upparcaso = message.content.toUpperCase();
	var chanel = message.channel;
    var gueldid = message.guild.id;
    let mentionfix;
    prefix = serverthings[(gueldid)];
    if (/^<@!?244533925408538624>\s?/i.test(prefix))
        mentionfix = prefix;
    else
        mentionfix = "<@244533925408538624> ";
    try {
    var testingifserverisregistered = prefix.toUpperCase(); } catch (err) {
        console.log("Automatically registering guild " + message.guild.name + " (" + gueldid + ")!");
        var plusplus = "+";
        serverthings[(gueldid)] = plusplus;
        writeServer();
        console.log("Automatically registered guild " + message.guild.name + "!");
        prefix = serverthings[(gueldid)];
    }
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
    if (message.guild.id in servercmds) {} else {
        servercmds[gueldid] = {};
        writeCmd();
        console.log("Automatically registered guild \"" + message.guild.name + "\" in commands json!");
    }
    if (message.guild.id in servermsgs) {} else {
        /* jshint sub:true */
        servermsgs[gueldid] = {};
        servermsgs[gueldid]["welcome"] = {};
        servermsgs[gueldid]["goodbye"] = {};
        servermsgs[gueldid]["welcome"]["channel"] = message.guild.defaultChannel.id;
        servermsgs[gueldid]["welcome"]["message"] = "";
        servermsgs[gueldid]["goodbye"]["channel"] = message.guild.defaultChannel.id;
        servermsgs[gueldid]["goodbye"]["message"] = "";
        writeMsg();
        console.log("Automatically registered guild \"" + message.guild.name + "\" in messages json!");
    } 
    if (message.guild.id in serverroles) {} else {
        serverroles[gueldid] = "";
        writeRoles();
        console.log("Automatically registered guild \"" + message.guild.name + "\" in roles json!");
    }
    if (gueldid in servermutes) {} else {
        servermutes[gueldid] = {};
        servermutes[gueldid]["muteRoleID"] = "";
        servermutes[gueldid]["mutes"] = {};
        writeMutes();
        console.log("Automatically registered guild \"" + message.guild.name + "\" in mutes json!");
    }
    if (gueldid in serverdetects) {} else {
        serverdetects[gueldid] = {};
        serverdetects[gueldid]["invite"] = "false";
        serverdetects[gueldid]["triggers"] = {};
        writeDetects();
        console.log(`Automatically registered guild \"${message.guild.name}\" in detects json!`);
    }
    if (gueldid in serverdetects && !(serverdetects[gueldid]["triggers"])) {
        serverdetects[gueldid]["triggers"] = {};
        writeDetects();
        console.log(`Did quick register of guild "${message.guild.name}" in detects json at Triggers.`);
    }
    if (!(gueldid in servermods)) {
        servermods[gueldid] = {};
        servermods[gueldid].moderator = "";
        servermods[gueldid].administrator = "";
        servermods[gueldid].logs = "";
        servermods[gueldid].duelogs = {};
        writeMods();
        console.log(`Automatically registered guild "${message.guild.name}" in mods json!`);
    }
    if (gueldid in servermods && !(servermods[gueldid].duelogs)) {
        servermods[gueldid].logs = "";
        servermods[gueldid].duelogs = {};
        servermods[gueldid].duelogs.latestNumber = 1;
        writeMods();
        console.log(`Did quick register of guild "${message.guild.name}" in mods json at Logs.`);
    }
    if (!(gueldid in serverwarns)) {
        serverwarns[gueldid] = {};
        serverwarns[gueldid].warnedusers = {};
        serverwarns[gueldid].setup = {};
        serverwarns[gueldid].setup.limit = 0;
        serverwarns[gueldid].setup.punishment = "";
        writeWarns();
        console.log(`Automatically registered guild "${message.guild.name}" in warns json!`);
    }
    if (!(gueldid in serverself)) {
        serverself[gueldid] = {};
        writeSelfRoles();
        console.log(`Automatically registered guild "${message.guild.name}" in selfroles json!`);
    }
    var prefixcase = prefix.toUpperCase();
    if (upparcaso.startsWith(prefixcase) || /^<@!?244533925408538624>\s?/i.test(upparcaso)) {
    var preprefix = prefix.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m);
    var instructionregex = ("^" + preprefix);
    var instructionregexp = new RegExp(instructionregex, "i");
    var instruction = input.replace(instructionregexp, "");
    if (/^<@!?244533925408538624>\s?/i.test(upparcaso))
        instruction = instruction.replace(/^<@!?244533925408538624>\s?/i, "");
    var instructioncase = instruction.toUpperCase();
	if (/^avatar/i.test(instruction)) {
        if (instruction.match(/^avatar\s{1,4}(<@!?\d+>)$/i)) {
            let user;
            user = instruction.match(/^avatar\s{1,4}<@!?(\d+)>$/i)[1];
            if (!bot.users.get(user)) return message.reply("User not found!");
            user = bot.users.get(user.toString());
            message.channel.sendFile(user.avatarURL ? user.avatarURL : "http://a5.mzstatic.com/us/r30/Purple71/v4/5c/ed/29/5ced295c-4f7c-1cf6-57db-e4e07e0194fc/icon175x175.jpeg");
        } else {
            message.channel.sendFile(message.author.avatarURL ? message.author.avatarURL : "http://a5.mzstatic.com/us/r30/Purple71/v4/5c/ed/29/5ced295c-4f7c-1cf6-57db-e4e07e0194fc/icon175x175.jpeg");
        }
    }
    if (/^eval\s([^]+)$/i.test(instruction)) {
    	if (message.author.id == ownerID) {
    		var functionToEval = instruction.match(/^eval\s([^]+)$/i)[1];
            if (/(fs)|(token)|(readFile)|(filter|constructor)|(sendFile)|(?:\\u)|((?:"|`)\s?\+\s?(?:"|`)(.+?)(?:"|`)(?:\]|\)))|(\$\{)|(writeFile)|(writeatJSON)|(saltbot(.js)?)|(dir)|(destroy)|(message.author.id)|(eval)/ig.test(functionToEval) && message.author.id !== ownerID) {
                message.reply("I like trains. *train passes on high-speed and kills you*");
            } else {
            console.log(functionToEval);
			try {
                /* jshint ignore:start */
				chanel.sendMessage("```js\nInput:\n" + functionToEval + "\n\nOutput:\n" + eval(functionToEval) + "```");
                /* jshint ignore:end */
			} catch(err) {
				chanel.sendMessage("```js\nInput:\n" + functionToEval + "\n\nError:\n" + err.message + "```");
				console.log("Error while doing eval:\n" + err.message);
			}
            }
    	}
    }
    try {
    if (/^manage\s(.+?)(\s(.+))?$/i.test(instruction)) {
    	if (message.author.id == ownerID) {
    		var command = instruction.match(/^manage\s(.+?)(\s(?:.+))?$/i)[1];
    		var argument = instruction.match(/^manage\s.+?\s((.+)?)?$/i) ? (instruction.match(/^manage\s.+?\s((.+)?)?$/i)[1]).replace(/^ +$/, "") : null;
    		if (/^log$/i.test(command)) {
    			if (argument !== null && argument !== undefined && argument !== "") {
    				console.log(argument);
    			} else {
    				message.reply("You must specify an argument!");
    			}
    		}
            if (/^setgame$/i.test(command)) {
                if (argument !== null && argument !== undefined && argument !== "") {
                    gamejs["game"] = argument;
                    writeGame();
                    bot.user.setGame(argument);
                    message.reply(":thumbsup::skin-tone-2:");

                } else {
                    message.reply("You must specify an argument!");
                }
            }
            if (/^delgame$/i.test(command)) {
                gamejs["game"] = "";
                writeGame();
                bot.user.setGame("");
                message.reply(":thumbsup::skin-tone-2:");
            }
            if (/^registerserver$/i.test(command)) {
                try {
                    if (message.guild.id in serverthings) {} else {
                        var createguildthingstwo = "+";
                        var guildidtwo = message.guild.id;
                        serverthings[(guildidtwo)] = createguildthingstwo;
                        fs.writeFileSync("./Info/serverthings.json", JSON.stringify(serverthings));
                        serverthings = require ("./Info/serverthings.json");
                        message.reply(":thumbsup::skin-tone-2:");
                    }
                    if (message.guild.id in servercmds) {} else {
                        servercmds[gueldid] = {};
                        writeCmd();
                        message.reply(":thumbsup::skin-tone-2: (Registered to commands json)");
                    }
                } catch(err) {
                    message.reply("I like trains.");
                    console.log(err.message);
                }
            }
            if (/^unregisterserver$/i.test(command)) {
                try {
                    if (message.guild.id in serverthings) {
                        var guildidthree = message.guild.id;
                        delete serverthings[(guildidthree)];
                        fs.writeFileSync("./Info/serverthings.json", JSON.stringify(serverthings));
                        serverthings = require ("./Info/serverthings.json");
                        message.reply(":thumbsup::skin-tone-2:");
                    }
                } catch(err) {
                    message.reply("I like trains.");
                    console.log(err.message);
                }
            }
            if (/^leaveserver$/i.test(command)) {
                try {
                    message.guild.leave();
                } catch(err) {
                    message.reply("I like trains.");
                    console.log(err.message);
                }
            }
            if (/^sendat$/i.test(command)) {
                if (argument === null | argument === undefined | argument === "") {
                    message.reply("trains");
                } else {
                    var argchannel = argument.match(/^(.+?)\s(?:.+)$/i)[1];
                    var argmessage = argument.match(/^(?:.+?)\s(.+)$/i)[1];
                    if (bot.channels.get(argchannel)) {
                        var channelfound = bot.channels.get(argchannel);
                        channelfound.sendMessage(argmessage);
                        message.reply("Message sent at the channel #" + channelfound.name + "!");
                    }
                }
            }
            if (/^regenmute$/i.test(command)) {
                if (!(message.guild.member(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS"))) return message.reply("Doh! I don't have `Manage Roles`.");
                if (!(message.guild.member(bot.user).hasPermission("MANAGE_CHANNELS"))) return message.reply("Doh! I don't have `Manage Channels`.");
                const createSaltMuted = function(){
                    message.guild.createRole({ name: "SaltMuted" ,permissions: []}).then(role => {
                        servermutes[gueldid]["muteRoleID"] = role.id;
                        writeMutes();
                        // servermutes[gueldid]["muteRoleID"] = message.guild.roles.find("name", "SaltMuted").id;
                        // Array.from(message.guild.channels).map(v=>overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false}));
                        Array.from(message.guild.channels).forEach(function(item, index) {
                            var Ilike = item[0];
                            /*console.log(Ilike);*/
                            var trainz = message.guild.channels.get(Ilike);
                            /*console.log(trainz.name);*/
                            //console.log(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                            trainz.overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false});
                        });
                        message.reply("SaltMuted regenerated successfully!");
                    });
                };
                if (servermutes[gueldid].muteRoleID) {
                    if (message.guild.roles.get(servermutes[gueldid].muteRoleID)) {
                        if (message.guild.roles.get(servermutes[gueldid].muteRoleID).position >= message.guild.member(bot.user).highestRole.position) {
                            createSaltMuted();
                        } else {
                            message.guild.channels.map(v=>{
                                v.overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false});
                            });
                            message.reply("SaltMuted channel perms regenerated successfully!");
                        }
                    } else {
                        createSaltMuted();
                    }
                } else {
                    createSaltMuted();
                }
            }
    	}
    }
    } catch(e) {
        console.log("Error while attempting to +manage:\n" + e.message);
        message.reply("I like trains.");
    }
    if (/^say\s[^]+$/i.test(instruction) && message.author.id in adminfile) {
    	message.delete();
    	var toSay = instruction.match(/^say\s([^]+)$/i)[1];
    	chanel.sendMessage("\u200B" + toSay);
        console.log(message.author.username + " forced me to say: \"" + toSay + "\"!");
    }
    try {
    if(/^admin\s(.+?)\s(.+)?$/i.test(instruction) && message.author.id == ownerID) {
        var acommand = instruction.match(/^admin\s(.+?)\s(?:.+)?$/i)[1];
        aargument = (instruction.match(/^admin\s.+?\s((.+)?)?$/i)[1]).replace(/^ +$/, "");
        if (/^add$/i.test(acommand)) {
            if (aargument !== null && aargument !== undefined && aargument !== "") {
                if (message.mentions.users.first()) {
                    canproceedaddadmin = 1;
                    lementionlol = message.mentions.users.first().id;
                } else if (/^[0-9]+$/.test(aargument) && aargument.length == 18) {
                    canproceedaddadmin = 1;
                    lementionlol = aargument;
                } else {
                    canproceedaddadmin = 0;
                }
                if (canproceedaddadmin == 1) {
                    if (lementionlol in adminfile) {
                        message.reply(lementionlol + " is already an admin!");
                    } else {
                        var beforealllife = ("true");
                        var key = JSON.parse(beforealllife);
                        adminfile[(lementionlol)] = beforealllife;
                        fs.writeFileSync("./Info/admins.json", JSON.stringify(adminfile));
                        adminfile = require ("./Info/admins.json");
                        message.reply("Successfully added " + lementionlol + " to admin!");
                    }
                } else {
                    message.reply("You must input an ID or mention!");
                }
                
            }
        }
        if (/^remove$/i.test(acommand)) {
            if (aargument !== null && aargument !== undefined && aargument !== "") {
                if (message.mentions.users.first()) {
                    canproceedremoveadmin = 1;
                    aargument = message.mentions.users.first().id;
                } else if (/^[0-9]+$/.test(aargument) && aargument.length == 18) {
                    canproceedremoveadmin = 1;
                } else {
                    canproceedremoveadmin = 0;
                }
                if (canproceedremoveadmin == 1) {
                    if (aargument in adminfile) {    
                        /* jshint ignore:start */
                        var beforealllife = ("true");
                        var key = JSON.parse(beforealllife);
                        /* jshint ignore:end */
                        delete adminfile[(aargument)];
                        if (message.mentions.users.first()) {
                            aargument = message.mentions.users.first();
                        }
                        fs.writeFileSync("./Info/admins.json", JSON.stringify(adminfile));
                        adminfile = require ("./Info/admins.json");
                        message.reply("The ID/user " + aargument + "is no longer an admin!");
                    } else {
                        message.reply("The ID " + aargument + " isn't an admin!");
                    }
                } else {
                    message.reply("You must input an ID or mention!");
                }
            }
        }   
        if (/^test$/i.test(acommand)) {
            if (aargument !== null && aargument !== undefined && aargument !== "") {
                if (message.mentions.users.first()) {
                    aargument = message.mentions.users.first().id;
                }
                if (aargument in admins) {
                    if (message.mentions.length > 0) {
                        aargument = message.mentions.users.first();
                    }
                    message.reply("Yes, " + aargument + " is an admin!");
                } else {
                    if (message.mentions.length > 0) {
                        aargument = message.mentions.users.first();
                    }
                    message.reply("No, " + aargument + " isn't an admin!");
                }
            }    
        }     
    }
    } catch(err) {
        message.reply("I like trains.");
        console.log(err.message);
    }
    if (/^info\s(.+)$/i.test(instruction)) {
        try {
        var ireq = instruction.match(/^info\s(.+)$/i)[1];
        if (/^channels$/i.test(ireq)) {
            if (ireq !== null && ireq !== undefined && ireq !== "") {
                message.reply("Information has been sent by PM!");
                var chanelstosend = message.guild.channels.filter(v => v.type === "text").map(v=>"#"+v.name).join` | `;
                message.author.sendMessage("**Channels in server *" + message.guild.name + "*:**\n" + chanelstosend + "\n\n**===========================================**", {split: true});
            }
        }
        if (/^roles$/i.test(ireq)) {
            if (ireq !== null && ireq !== undefined && ireq !== "") {
                message.reply("Information has been sent by PM!");
                var rolestosend = Array.from(message.guild.roles).map(v=>v[1]).sort((a,b)=>b.position-a.position).map(v=>v.name).join`, `;
                message.author.sendMessage("**Roles in server *" + message.guild.name + "*:**\n" + rolestosend + ".\n\n**===========================================**", {split: true});
            }
        }
        if (/^(?:usersamount|members)$/i.test(ireq)) {
            if (ireq !== null && ireq !== undefined && ireq !== "") {
                message.reply("The current amount of users in this server is **" + message.guild.memberCount + "**!");
            }
        }
        if (/^(generalinfo|server)$/i.test(ireq)) {
            if (ireq !== null && ireq !== undefined && ireq !== "") {
                // message.reply("Information has been sent by PM!");
                var somechannelamountthings = Array.from(message.guild.channels.filter(v => v.type === "text")).length;
                const verificlevel = message.guild.verificationLevel.toString().replace("0", "None").replace("1", "Low").replace("2", "Medium").replace("3", "(╯°□°）╯︵ ┻━┻");
                chanel.sendMessage("", {embed: {
                    title: "",
                    thumbnail: {
                        url: message.guild.iconURL ? message.guild.iconURL : "http://a5.mzstatic.com/us/r30/Purple71/v4/5c/ed/29/5ced295c-4f7c-1cf6-57db-e4e07e0194fc/icon175x175.jpeg",
                    },
                    color: 4245355,
                    fields: [{
                        name: message.guild.name,
                        value: `Was created at ${message.guild.createdAt}`,
                    }, {
                        name: "Owner",
                        value: message.guild.owner.user.username,
                        inline: true
                    }, {
                        name: "Default Channel",
                        value: `#${message.guild.defaultChannel.name}`,
                        inline: true
                    }, {
                        name: "Member Amount",
                        value: message.guild.memberCount,
                        inline: true
                    }, {
                        name: "Channel Amount",
                        value: somechannelamountthings,
                        inline: true
                    }, {
                        name: "Hosted Location",
                        value: message.guild.region,
                        inline: true
                    }, {
                        name: "Verification Level",
                        value: verificlevel,
                        inline: true
                    }],
                    footer: {
                        text: `Server ID: ${message.guild.id}`
                    },

                }});
               /* message.author.sendMessage("**General information about the guild *" + message.guild.name + "*:**\n• Name: `" + message.guild.name + "`\n• Owner: `" + message.guild.owner.user.username + "` (ID: " + message.guild.ownerID + ")\n• Guild ID: `" + message.guild.id + "`\n• Creation date: `" + message.guild.createdAt + "`\n• Default Channel: `#" + message.guild.defaultChannel.name + "`\n• Has **" + message.guild.memberCount + "** members, **" + somechannelamountthings + "** channels, and is hosted on **" + message.guild.region + "**.\n• Icon:");
                message.author.sendFile((message.guild.iconURL || "No icon"));
                message.author.sendMessage("\n\n**===========================================**");*/
            }
        }
        if (/^(?:amountusersonrole|amur)\s{1,4}(.+)$/i.test(ireq)) {
            try {
            var roletomatch = ireq.match(/^(?:amountusersonrole|amur)\s{1,4}(.+)$/i)[1];
            if (roletomatch == "{everyone}") roletomatch = "@everyone";
            if (ireq !== "") {
                if (roletomatch !== undefined) {
                    /* jshint -W080 */
                    for(var iterator = message.guild.roles.entries(),val = iterator.next(),rolematch = undefined; val.done === false; val = iterator.next()) {
                        if(roletomatch.toUpperCase() === val.value[1].name.toUpperCase()) {
                            rolematch = val.value[1];
                        }
                    }
                    /* jshint +W080 */ 
                    if (rolematch !== undefined && rolematch !== null && rolematch !== "") {
                        if (Array.from(rolematch.members).length == 1) {
                            thething = "is **1** user";
                        } else {
                            thething = "are **" + Array.from(rolematch.members).length + "** users";
                        }
                        message.reply("There " + thething + " on the role **" + rolematch.name + "**!");
                    } else {
                        message.reply("That role doesn't exist!");
                    }
                }
            }
            } catch (err) {
                message.reply("I like trains.");
                console.log("Error while using info amountusersonrole:\n" + err.message);
            }
        }
        if (/^user(?:\s{1,4}.+)?$/i.test(ireq)) {
            try {
                chanel.sendMessage("Fetching data, please wait...").then(msg => {
                    const embedz = function(user, member, stuffs = null){
                        const avatarURL = user.avatarURL ? user.avatarURL : "http://a5.mzstatic.com/us/r30/Purple71/v4/5c/ed/29/5ced295c-4f7c-1cf6-57db-e4e07e0194fc/icon175x175.jpeg";
                        memberjoin = {
                            date: member.joinedAt,
                        };
                        memberjoin.month = memberjoin.date.getMonth().toString().length == 1 ? memberjoin.date.getMonth() == 9 ? 10 : `0${memberjoin.date.getMonth() + 1}` : memberjoin.date.getMonth() + 1;
                        memberjoin.hour = formatDate(member.joinedAt);
                        memberjoin.legibledate = `${memberjoin.date.getDate()}/${memberjoin.month}/${memberjoin.date.getFullYear()}, ${memberjoin.hour}`;
                        var existthing = stuffs.exists ? {
                                name: "Mee6 Ranking",
                                value: stuffs.hasrank ? `Level ${stuffs.level} (Rank: ${stuffs.rank}/${stuffs.ranktotal})` : "User not ranked",
                                inline: true
                            } : undefined;
                        var fieldsarray = [{
                                name: `User "${user.username}"`,
                                value: `Joined Discord on ${user.createdAt}`
                            }, {
                                name: "Status",
                                value: capitalize((member.presence.status.replace(/^dnd$/i, "Do Not Disturb")).replace(/^offline$/i, "Offline / Invis")),
                                inline: true
                            }, {
                                name: "Server Join Date",
                                value: memberjoin.legibledate,
                                inline: true
                            }, {
                                name: "Nickname",
                                value: member.nickname ? member.nickname : user.username,
                                inline: true
                            }, {
                                name: "Highest Role",
                                value: `${(member.highestRole.name).replace(/^@everyone$/i, "@\u200Beveryone")}`,
                                inline: true
                            }];
                        if (existthing) fieldsarray.push(existthing);
                        return {
                            title: "",
                            thumbnail: {
                                url: avatarURL,
                            },
                            color: 6724044,
                            url: "",
                            fields: fieldsarray,
                            footer: {
                                text: `User ID: ${user.id}`
                            }
                        };
                    };
                    const meesix = function(user) {
                        var promise = new Promise(function(resolve, reject) {
                            if (!(message.guild.members.get("159985870458322944"))) return resolve({exists: false});
                            const preobj = {};
                            preobj.exists = false;
                            mee6.getRank(gueldid, user.id).then(v=>{ 
                                try {
                                    preobj.hasrank = true;
                                    preobj.level = v.level;
                                    preobj.rank = v.rank;
                                    preobj.ranktotal = v.totalRank;
                                    preobj.exists = true;
                                    resolve(preobj);
                                } catch (err) {
                                    console.log("Error at parsing JSON of data of preobj:\n"+err.message);
                                    preobj.exists = true;
                                    resolve(preobj);
                                }
                            }).catch(err=>{
                                if (err == "USER NOT RANKED") {
                                    preobj.hasrank = false;
                                    preobj.level = undefined;
                                    preobj.rank = undefined;
                                    preobj.ranktotal = undefined;
                                    preobj.exists = true;
                                    resolve(preobj);
                                } else {
                                    preobj.exists = false;
                                    resolve(preobj);
                                }
                            });
                        });
                        return promise;
                    };
                    if (ireq.match(/^user(\s{1,4}.+)$/i)) {
                        var mentioneddude;
                        let oboi = {
                            mention: false,
                            arr: null
                        };
                        if (ireq.match(/^user(\s{1,4}<@!?\d+>)$/i)) {
                            mentioneddude = ireq.match(/^user\s{1,4}<@!?(\d+)>$/i)[1];
                            oboi.mention = true;
                        }
                        else {
                            mentioneddude = ireq.match(/^user\s{1,4}(.+)$/i)[1];
                            oboi.mention = false;
                        }
                        if (oboi.mention) {
                            mentioneddude = bot.users.get(mentioneddude.toString());
                            if (!mentioneddude) {
                                let searchmember = search("user", mentioneddude, message.guild);
                                if (!(searchmember[1])) mentioneddude = null;
                                else mentioneddude = Object.prototype.toString.call(searchmember[0][0]) === '[object Array]' ? searchmember[0][0][0] : searchmember[0][0];
                                oboi.arr = searchmember[1];
                                oboi.mention = false;
                            }
                        } else {
                            let searchmember = search("user", mentioneddude, message.guild);
                            //console.log(searchmember);
                            if (!(searchmember[1])) mentioneddude = null;
                            else mentioneddude = Object.prototype.toString.call(searchmember[0][0]) === '[object Array]' ? searchmember[0][0][0] : searchmember[0][0];
                            oboi.arr = searchmember[1];
                        }
                        if (!mentioneddude) return msg.edit("<@"+message.author.id+">, User not found!");
                        var mentionedmember = message.guild.members.get(mentioneddude.id);
                        const mentionedstatus = ((mentionedmember.presence.status.replace(/^dnd$/i, "Do Not Disturb")).replace(/^idle$/i, "Idle"));
                        meesix(mentioneddude).then(leobj => {
                            if (mentionedmember.nickname === null) {
                                nicknamingmention = mentioneddude.username;
                            } else {
                                nicknamingmention = mentionedmember.nickname;
                            }
                            //console.log(mentioneddude);
                            msg.edit(oboi.mention ? "" : (oboi.arr >= 2 ? `Found ${oboi.arr} results, showing first find:` : ""), {split: true, embed: embedz(mentioneddude, mentionedmember, leobj)});
                        });
                        /*message.reply("Information about the specified user has been sent by Private Message!");
                        message.author.sendMessage("**Information about user _\"" + message.mentions.users.first().username + "\"_:**\n\n**Global information:**\n• Joined Discord at " + mentioneddude.createdAt + ".\n• ID: " + mentioneddude.id + "\n• Avatar URL: " + mentioneddude.avatarURL + "\n\n**Local information (Info based on the guild you sent the message from [" + message.guild.name + "]):**\n• Joined guild at " + mentionedmember.joinedAt + ".\n• Nickname: " + nicknamingmention + "\n\n**===========================================**");*/
                    } else {
                        var userauthor = message.author;
                        var usermember = message.member;
                        meesix(userauthor).then(leobj => {
                            if (usermember.nickname === null) {
                                nicknamingmention = userauthor.username;
                            } else {
                                nicknamingmention = usermember.nickname;
                            }
                            msg.edit("", {split: true, embed: embedz(userauthor, usermember, leobj)});
                        });
                    }
                });
            } catch (err) {
                message.reply("I like trains.");
                console.log("Error while gathering user information:\n" + err.message);
            }
        }
        if (/^amountusersonhighrole\s{1,4}(.+)$/i.test(ireq)) {
            var matchhighrole = ireq.match(/^amountusersonhighrole\s(.+)$/i)[1];
            if (matchhighrole == "{everyone}") matchhighrole = "@everyone";
            for (var iteratorr = message.guild.roles.entries(), vall = iteratorr.next(), roleMatch; vall.done === false; vall = iteratorr.next()) {
                if (vall.value[1].name.toUpperCase() === matchhighrole.toUpperCase()) {
                    roleMatch = vall.value[1];
                }
            }
            if(roleMatch === undefined) {
                roleMatch = 40404;
            }
            /*jshint shadow:true */
            for (var iteratorr = message.guild.members.entries(), vall = iteratorr.next(), highrolecount = 0; vall.done === false; vall = iteratorr.next()) {
                /* jshint eqnull:true*/
                /* jshint -W041 */ 
                if (!(vall.value[1].highestRole == null && vall.value[1].highestRole == undefined)) {
                    if (matchhighrole.toUpperCase() === vall.value[1].highestRole.name.toUpperCase()) {
                        highrolecount++;
                    }
                }
            }
            /* jshint +W041 */
            console.log(highrolecount);
            if (highrolecount !== undefined && highrolecount !== null && highrolecount !== "" && roleMatch !== 40404) {
                if (highrolecount === 0) {
                    message.reply("Nobody has that role as their highest role!");
                } else {
                    if (highrolecount == 1) {
                        thethingtwo = "is **1** user that has ";
                    } else {
                        thethingtwo = "are **" + highrolecount + "** users that have ";
                    }
                    message.reply("There " + thethingtwo + "the role **" + roleMatch.name + "** as their highest role!");
                }
            } else {
                message.reply("That role doesn't exist!");
            }
        }
        if (/^amush\s{1,4}(.+)$/i.test(ireq)) {
            var matchhighrolee = ireq.match(/^amush\s(.+)$/i)[1];
            if (matchhighrolee == "{everyone}") matchhighrolee = "@everyone";
            for (var iteratorrr = message.guild.roles.entries(), valll = iteratorrr.next(), roleMatcht; valll.done === false; valll = iteratorrr.next()) {
                if (valll.value[1].name.toUpperCase() === matchhighrolee.toUpperCase()) {
                    roleMatcht = valll.value[1];
                }
            }
            if(roleMatcht === undefined) {
                roleMatcht = 40404;
            }
            /* jshint shadow:true */
            /* jshint -W041 */
            for (var iteratorrr = message.guild.members.entries(), valll = iteratorrr.next(), highrolecountt = 0; valll.done === false; valll = iteratorrr.next()) {
                if (!(valll.value[1].highestRole == null && valll.value[1].highestRole == undefined)) {
                    if (matchhighrolee.toUpperCase() === valll.value[1].highestRole.name.toUpperCase()) {
                        highrolecountt++;
                    }
                }
            }
            /* jshint +W041 */
            console.log(highrolecountt);
            if (highrolecountt !== undefined && highrolecountt !== null && highrolecountt !== "" && roleMatcht !== 40404) {
                if (highrolecountt === 0) {
                    message.reply("Nobody has that role as their highest role!");
                } else {
                    if (highrolecountt == 1) {
                        thethingtwo = "is **1** user that has ";
                    } else {
                        thethingtwo = "are **" + highrolecountt + "** users that have ";
                    }
                    message.reply("There " + thethingtwo + "the role **" + roleMatcht.name + "** as their highest role!");
                }
            } else {
                message.reply("That role doesn't exist!");
            }
        }
        if (/^role\s{1,4}.+$/i.test(ireq)) {
            try {
                stillbeingmatched = ireq.match(/^role\s{1,4}(.+)$/i)[1];
                let stuffs = false;
                if (stillbeingmatched == "{everyone}") stillbeingmatched = "@everyone";
                let role;
                for (var iteratorr = message.guild.roles.entries(), vall = iteratorr.next(); vall.done === false; vall = iteratorr.next()) {
                    if (vall.value[1].name.toUpperCase() === stillbeingmatched.toUpperCase()) {
                        role = vall.value[1];
                    }
                }
                let testrole;
                if (!role) {
                    testrole = search("role", stillbeingmatched, message.guild);
                    if (!(testrole[1])) role = null;
                    else role = Object.prototype.toString.call(testrole[0][0]) === '[object Array]' ? testrole[0][0][0] : testrole[0][0];
                    stuffs = testrole[1];
                }
                if (!role) return message.reply("Role not found!");
                let arr = [];
                if (Number(role.members.size) < 25 && Number(role.members.size) !== 0) Array.from(role.members).map(v=>{
                    arr.push(v[1].toString());
                });
                else
                    arr = ["Nobody"];
                chanel.sendMessage(stuffs > 1? `${stuffs} roles found on search, showing first find:` : "", {embed: {
                    title: "",
                    url: "",
                    thumbnail: {
                        url: role.hexColor == "#000000" ? "http://www.colourlovers.com/img/8B99A4/100/100/" : `http://www.colourlovers.com/img/${role.hexColor.replace(/#/, "")}/100/100/`
                    },
                    fields: [{
                        name: "Information about role \""+role.name+"\"",
                        value: `Was created on ${role.createdAt.toString()}`,
                        inline: false
                    }, {
                        name: role.hasPermission("ADMINISTRATOR") ? "Permissions" : "Permissions Number (use a converter to see)",
                        value: role.hasPermission("ADMINISTRATOR") ? "Admin permission (all)" : role.permissions,
                        inline: true
                    }, {
                        name: "Color",
                        value: role.hexColor == "#000000" ? "Default (#8B99A4)" : role.hexColor,
                        inline: true
                    }, {
                        name: "Is separate",
                        value: role.hoist ? "Yes" : "No",
                        inline: true
                    }, {
                        name: "Is integration role",
                        value: role.managed ? "Yes" : "No",
                        inline: true
                    }, {
                        name: Number(role.members.size) > 24 ? "Member Amount" : `Members (${role.members.size})`,
                        value: Number(role.members.size) > 24 ? (role.members.size == message.guild.memberCount ? "Everyone" : role.members.size) : (arr ? arr.join(", ") : "Nobody"),
                        inline: false
                    }],
                    footer: {
                        text: `Role ID: ${role.id} | Server ID: ${message.guild.id}`
                    }
                }});
            } catch (err) {
                message.reply("Doh! An error happened.");
                console.log(`Error while trying to do info role:\n${err.message}`);
            }
        }
        if (/^channel(?:\s{1,4}.+)?$/i.test(ireq)) {
            try {
                let channel;
                if (ireq.match(/^channel(\s{1,4}.+)$/i)) {
                    if (ireq.match(/^channel\s{1,4}<#(\d+)>$/i)) channel = ireq.match(/^channel\s{1,4}<#(\d+)>$/i)[1];
                    if (!channel) {
                        if (ireq.match(/^channel\s{1,4}(&.+|#.+)$/i)) channel = ireq.match(/^channel\s{1,4}(&.+|#.+)$/i)[1];
                    }
                    if (!channel) {
                        return chanel.sendMessage(`\`\`\`${prefix}info channel #textchannel|&voicechannel\nDisplays information about a channel.\`\`\``, {split: {prepend: "```", append: "```"}});
                    }
                }
                /*else if (ireq.match(/^channel(\s{1,4}&.+)$/i))
                    channel = ireq.match(/^channel\s{1,4}(&.+)/i)[1];*/
                else
                    channel = chanel;
                let thingy;
                if (!(channel.id)) {
                    if (/^&/.test(channel)) {
                        let channelmatch = channel;
                        for (var iteratorr = message.guild.channels.filter(v=>v.type=="voice").entries(), vall = iteratorr.next(); vall.done === false; vall = iteratorr.next()) {
                            if (vall.value[1].name.toUpperCase() === channelmatch.match(/^&(.+)$/i)[1].toUpperCase()) {
                                channel = vall.value[1];
                            }
                        }
                        if (!(channel.id)) {
                            let newchannel;
                            let testvar = search("voicechannel", channel.replace(/^&/, ""), message.guild);
                            if (!(testvar[1])) channel = null;
                            else newchannel = testvar[0][0];
                            if (newchannel[0]) newchannel = newchannel[0];
                            thingy = testvar[1];
                            channel = newchannel;
                        }
                        if (!(channel.id)) channel = null;
                    } else if (/^#/i.test(channel)) {
                        let channelmatch = channel;
                        message.guild.channels.filter(c=>c.type=="text").map(v=>{
                            if (v.name.toUpperCase() == channelmatch.toUpperCase())
                                channel = v;
                        });
                        if (!(channel.id)) {
                            let newchannel;
                            let testvar = search("textchannel", channel.replace(/^#/, ""), message.guild);
                            if (!(testvar[1])) channel = null;
                            else newchannel = testvar[0][0];
                            if (newchannel[0]) newchannel = newchannel[0];
                            thingy = testvar[1];
                            channel = newchannel;
                        }
                        if (!(channel.id)) channel = null;
                    }
                    else
                        channel = message.guild.channels.get(channel);
                }
                if (!channel) return message.reply("Channel not found! (Tip: Use & behind the channel name to look for a voice channel!)");
                let channelsize = {}; 
                channelsize.text = 0;
                channelsize.voice = 0;
                message.guild.channels.map(v=>{
                    if (v.type=="text")
                        channelsize.text++;
                    else if (v.type=="voice")
                        channelsize.voice++;
                });
                message.guild.channels.filter(v=>v.type == "voice").map(c=>{
                    if (c.position === 0 || c.position == "0") channelsize.validvoice = true;
                });
                channelsize.text = channelsize.text-1;
                if (channelsize.validvoice) channelsize.voice = channelsize.voice-1;
                if (channel.type == "text") {
                    let hooks;
                    channel.fetchWebhooks().then(webhooks => {
                        if (!webhooks)
                            hooks = "0";
                        else
                            hooks = webhooks.size;
                        let arr = [];
                        if (Number(channel.members.size) < 24) {
                            Array.from(channel.members).map(v=>{
                                arr.push(v[1]);
                            });
                        }
                        else
                            arr = [];
                        if (arr) arr = arr.join(", ");
                        chanel.sendMessage(thingy && thingy > 1 ? `${thingy} results found, showing first find:` : "", {embed: {
                            title: "",
                            url: "",
                            thumbnail: {
                                url: "http://i.imgur.com/40L2cU3.png"
                            },
                            color: 5409004,
                            fields: [{
                                name: `Channel #${channel.name}`,
                                value: `Was created at ${channel.createdAt.toString().match(/^(.+) \d{1,2}:\d{1,2}:\d{1,2} .+$/i)[1]} ${formatDate(channel.createdAt, false)} (${channel.createdAt.toString().match(/^.+ \d{1,2}:\d{1,2}:\d{1,2} (.+)$/i)[1].match(/^GMT-\d+\s\((.+)\)$/i)[1]})`,
                                inline: false
                            }, {
                                name: `Permission Overwrites`,
                                value: `${channel.permissionOverwrites.size}`,
                                inline: true
                            }, {
                                name: `Webhooks`,
                                value: `${hooks}`,
                                inline: true
                            }, {
                                name: "Topic",
                                value: channel.topic ? channel.topic : "None",
                                inline: true
                            },{
                                name: "Position",
                                value: channel.position === 0 ? "Top" : (channel.position == channelsize.text ? "Bottom" : channel.position),
                                inline: true
                            },{
                                name: (channel.members.size < 24 || channel.members.size == message.guild.memberCount || Number(channel.members.size) === 0) ? "Members that can see the channel ("+channel.members.size+")" : "Amount of members that can see the channel",
                                value: Number(channel.members.size) == message.guild.memberCount ? "Everyone" : (Number(channel.members.size) === 0 ? "Nobody" : (channel.members.size < 24 ? (arr ? arr : "(Could not retrieve members)") : channel.members.size)),
                                inline: false                                
                            }],
                            footer: {
                                text: `Channel ID: ${channel.id}`
                            }
                        }});
                    }).catch(function(reason) {
                    if(reason == "Error: Forbidden") {
                        let arr = [];
                        if (Number(channel.members.size) < 24) {
                            Array.from(channel.members).map(v=>{
                                arr.push(v[1]);
                            });
                        }
                        else
                            arr = [];
                        arr = arr.join(", ");
                        chanel.sendMessage(thingy && thingy > 1 ? `${thingy} results found, showing first find:` : "", {embed: {
                            title: "",
                            url: "",
                            thumbnail: {
                                url: "http://i.imgur.com/40L2cU3.png"
                            },
                            color: 5409004,
                            fields: [{
                                name: `Channel #${channel.name}`,
                                value: `Was created at ${channel.createdAt.toString().match(/^(.+) \d{1,2}:\d{1,2}:\d{1,2} .+$/i)[1]} ${formatDate(channel.createdAt, false)} (${channel.createdAt.toString().match(/^.+ \d{1,2}:\d{1,2}:\d{1,2} (.+)$/i)[1].match(/^GMT-\d+\s\((.+)\)$/i)[1]})`,
                                inline: false
                            }, {
                                name: `Permission Overwrites`,
                                value: `${channel.permissionOverwrites.size}`,
                                inline: true
                            }, {
                                name: `Webhooks`,
                                value: `<Can't view Webhook amount>`,
                                inline: true
                            }, {
                                name: "Topic",
                                value: channel.topic ? channel.topic : "None",
                                inline: true
                            },{
                                name: "Position",
                                value: channel.position === 0 ? (channel.position == channelsize.text ? "Unique" : "Top") : (channel.position == channelsize.text ? "Bottom" : channel.position),
                                inline: true
                            },{
                                name: (channel.members.size < 24 || channel.members.size == message.guild.memberCount || Number(channel.members.size) === 0) ? "Members that can see the channel ("+channel.members.size+")" : "Amount of members that can see the channel",
                                value: Number(channel.members.size) == message.guild.memberCount ? "Everyone" : (Number(channel.members.size) === 0 ? "Nobody" : (channel.members.size < 24 ? (arr ? arr : "(Could not retrieve members)") : channel.members.size)),
                                inline: false                                
                            }],
                            footer: {
                                text: `Channel ID: ${channel.id}`
                            }
                        }});}});
                } else {
                    let arrvoice = [];
                    if (Number(channel.members.size) < 24)
                        channel.members.map(v=>arrvoice.push(v));
                    arrvoice = arrvoice.join(", ");
                    chanel.sendMessage(thingy && thingy > 1 ? `${thingy} results found, showing first find:` : "", {embed: {
                        title: "",
                        url: "",
                        thumbnail: {
                            url: "http://i.imgur.com/SAFHJ51.png"
                        },
                        color: 5409004,
                        fields: [{
                            name: `Voice Channel "${channel.name}"`,
                            value: `Was created at ${channel.createdAt.toString().match(/^(.+) \d{1,2}:\d{1,2}:\d{1,2} .+$/i)[1]} ${formatDate(channel.createdAt, false)} (${channel.createdAt.toString().match(/^.+ \d{1,2}:\d{1,2}:\d{1,2} (.+)$/i)[1].match(/^GMT-\d+\s\((.+)\)$/i)[1]})`,
                            inline: false
                        }, {
                            name: `Permission Overwrites`,
                            value: `${channel.permissionOverwrites.size}`,
                            inline: true
                        },{
                            name: `User limit`,
                            value: channel.userLimit === 0 ? "Unlimited" : channel.userLimit,
                            inline: true
                        }, {
                            name: "Bitrate",
                            value: channel.bitrate / 1000 + "kbps",
                            inline: true
                        }, {
                            name: "Position",
                            value: channel.position === (channelsize.validvoice ? 0 : 1) ? (channel.position === channelsize.voice ? "Unique" : "Top") : (channel.position === channelsize.voice ? "Bottom" : channel.position),
                            inline: true
                        }, {
                            name: `Members Connected ${channel.members.size < 24 ? `(${channel.members.size})` : ""}`,
                            value: channel.members.size == message.guild.memberCount ? "Everyone" : (channel.members.size === 0 ? "Nobody" : (channel.members.size < 24 ? arrvoice : channel.members.size)),
                            inline: false
                        }],
                        footer: {
                            text: `Channel ID: ${channel.id}`
                        }
                    }});
                }
            } catch (err) {
                message.reply("Heh.... Um.. An error happened.");
                console.log(`Error while trying to do info channel:\n${err.message}`);
            }
        }
        if (/^(?:bot|stats)$/i.test(ireq)) {
            let uptime = Math.floor(bot.uptime / 1000);
            let uptimemins = uptime / 60 >= 1 ? Math.floor(uptime / 60) : 0;
            let uptimehours = uptimemins / 60 >= 1 ? Math.floor(uptimemins / 60) : 0;
            let uptimedays = uptimehours / 24 >= 1 ? Math.floor(uptimehours / 60) : 0;
            chanel.sendMessage("", {embed: {
                title: "",
                url: "",
                thumbnail: {
                    url: bot.user.avatarURL
                },
                color: 9012613,
                fields: [{
                    name: "Salt Bot",
                    value: `Was created at November 5, 2016 (4:50:31 PM, BRST). That's ${Math.floor((Date.now() - 1478371831000) / 86400000)} days ago!`,
                    inline: false
                }, {
                    name: "Owners",
                    value: `🔥PgSuper🔥#3693 and Aplet123#9551`,
                    inline: true
                }, {
                    name: "Library",
                    value: "discord.js",
                    inline: true
                }, {
                    name: "Uptime",
                    value: `${uptimemins !== 0 ? `${uptimehours !== 0 ? `${uptimedays !== 0 ? `${uptimedays}d ` : ""}${uptimedays !== 0 ? uptimehours % 24 : uptimehours}h ` : ""}${uptimehours !== 0 ? uptimemins % 60 : uptimemins}m ` : ""}${uptimemins !== 0 ? uptime % 60 : uptime}s`,
                    inline: true
                }, {
                    name: "Servers",
                    value: bot.guilds.size,
                    inline: true
                }, {
                    name: "Channels (total)",
                    value: bot.channels.size,
                    inline: true
                }, {
                    name: "Text Channels",
                    value: bot.channels.filter(c=>c.type=="text").size,
                    inline: true
                }, {
                    name: "Voice Channels",
                    value: bot.channels.filter(c=>c.type=="voice").size,
                    inline: true
                }, {
                    name: "Users",
                    value: bot.users.size,
                    inline: true
                }],
                footer: {
                    text: `ID: ${bot.user.id} | Happy to be alive! ^-^`
                }
            }});
        }
        } catch(err) {
            message.reply("I like trains.");
            console.log(err.message);
        }
    }
    if (/^info$/i.test(instruction)) {
        message.reply("This is a command that can show you information. Available commands are:\n`" + prefix + "info channels`\n`" + prefix + "info roles`\n`" + prefix + "info members`\n`" + prefix + "info server`\n`" + prefix + "info amountusersonrole <role name>`\n`" + prefix + "info user [user to get info (not required)]`\n`" + prefix + "info amountusersonhighrole(or amush) <role name to check users in it that it is their highest>`\n`"+prefix+"info role rolename`\n`"+prefix+"info channel #channel` <- TIP: Use &channel to look for voice channels!\n`"+prefix+"info bot`");
    }
    if (/^command\s(.+?)\s[^]+$/i.test(instruction)) {
    if (message.member.hasPermission("MANAGE_GUILD") || message.author.id === ownerID) {
        try {
            var cmdtrigger = instructioncase.match(/^command\s(.+?)\s[^]+$/i)[1];
            var cmdtext = instruction.match(/^command\s(?:.+?)\s([^]+)$/i)[1];
            if (/^((admin)|(avatar)|(info)|(prefix)|(manage)|(eval)|(command)|(autoname)|(delautoname)|(contact)|(c)|(restart)|(calc)|(ping)|(pong)|(delcommand)|(broadcast)|(say)|(mute)|(trigger)|(deltrigger)|(feedme)|(unmute)|(setrole)|(delsetrole)|(setlogs)|(rip)|(pmute)|(random)|(role)|(coinflip)|(listcommands)|(help)|(ban)|(welcfarew)|(kick)|(setlogs)|(image)|(warn)|(setwarns)|(clearwarns)|(rip)|(unban)|(autorole)|(delautorole))(_|$)/i.test(cmdtrigger)) {
                message.reply("\"" + cmdtrigger + "\" is already a command (not custom) used by the bot!");
            } else {
            if (/^\w+$/i.test(cmdtrigger)) {
                cmdtrigger = cmdtrigger.replace(/_/g, " ");
                if(message.guild.id in servercmds) {
                    if (/^ +$/.test(cmdtrigger) === false && cmdtrigger !== "") {
                        servercmds[gueldid][cmdtrigger] = cmdtext;
                        message.reply("Custom command set!");
                        writeCmd();
                    } else {
                        message.reply("Commands cannot be empty!");
                    }
                } else {
                    servercmds[gueldid] = {};
                    servercmds[gueldid][cmdtrigger] = cmdtext;
                    message.reply("Custom command set!");
                    writeCmd();
                }
            } else {
                message.reply(":warning: The command name must be alphanumeric (Letters and/or numbers) and can also contain underscores (Underscores turn into spaces!)");
            } // End of the else above
            } // End of the else that detects if the cmdtrigger is NOT a default command
        } catch (err) {
            message.reply("Uh oh, an error occurred!");
            console.log("Error while adding a command at a server:\n" + err.message);
        }
    } else {
        message.reply("I'm sorry, but you don't have the permission `Manage Server`!");
    } // End of the "else"
    } // End of the command "command"
    if (/^command$/i.test(instruction)) {
        message.reply("This command allows you to set custom commands for your server! They can only send text, but you can simulate arguments by adding underscores into the command name! Once you do an underscore, it is replaced by a space! Cool, isn't it?\nHowever, you need the permission `Manage Server` to edit commands!\n\nP.S: To delete commands write `" + prefix + "delcommand <command name>`! And, if the command name has spaces, to delete it write spaces, and not underscores!");
    }
    if (instructioncase in servercmds[gueldid]) {
        chanel.sendMessage("\u200B" + servercmds[gueldid][instructioncase]);
    }
    if (/^help(\s{1,4}.+)?$/i.test(instruction)) {
        if (!(instruction.match(/^help\s{1,4}(.+)$/i))) return chanel.sendMessage("```"+prefix+"help -> Sends help to PMs.\n\nAvailable options:\n- All\n- Moderation\n- Administration\n- Fun\n- Utility\n- Automation\n- Salt-Related```");
        let h = instruction.match(/^help\s{1,4}(.+)$/i)[1];
        if (!(help.helps[h.toLowerCase().replace(/salt-related/i, "saltrelated")]) && h.toLowerCase() !== "all") return chanel.sendMessage("```"+prefix+"help -> Sends help to PMs.\n\nAvailable options:\n- All\n- Moderation\n- Administration\n- Fun\n- Utility\n- Automation\n- Salt-Related```");
        h = h.toLowerCase();
        console.log(h);
        if (h == "all") {
            message.author.sendMessage(`***Here are my commands:***`);
            message.author.sendMessage(help.helps.moderation.replace(/↪/g, "\↪"), help.functions.splitter).then(v=>{
                message.author.sendMessage(help.helps.administration.replace(/↪/g, "\↪"), help.functions.splitter).then(b=>{
                    message.author.sendMessage(help.helps.fun.replace(/↪/g, "\↪"), help.functions.splitter).then(c=>{
                        message.author.sendMessage(help.helps.utility.replace(/↪/g, "\↪"), help.functions.splitter).then(a=>{
                            message.author.sendMessage(help.helps.automation.replace(/↪/g, "\↪"), help.functions.splitter).then(n=>{
                                message.author.sendMessage(help.helps.saltrelated.replace(/↪/g, "\↪"), help.functions.splitter);
                            });
                        });
                    });
                });
            });
        } else {
            message.author.sendMessage(help.helps[h.replace(/salt-related/i, "saltrelated")], help.functions.splitter);
        }
        message.reply("Help has been sent to your Private Messages!");
    }
    if (/^delcommand\s(.+)$/i.test(instruction)) {
        var cmdtodelete = instructioncase.match(/^delcommand\s(.+)$/i)[1];
        if (message.member.hasPermission("MANAGE_GUILD") || message.author.id == ownerID) {
            if (cmdtodelete in servercmds[gueldid]) {
                delete servercmds[gueldid][cmdtodelete];
                writeCmd();
                message.reply("Custom command \"" + cmdtodelete.toLowerCase() + "\" deleted successfully!");
            } else {
                message.reply("That is not a custom command of this server!");
            }
        } else {
            message.reply("I'm sorry, but you don't have the `Manage Server` permission!");
        }
    }
    if (/^ban\s+<@!?\d+>(?:\s+[^]+)?$/i.test(instruction)) {
        try {
        var fetchclientban = message.guild.members.get(bot.user.id);
        const binfo = {};
        if (instruction.match(/^ban\s+<@!?\d+>\s+([^]+)$/i))
            binfo.reason = instruction.match(/^ban\s+<@!?\d+>\s+([^]+)$/i)[1];
        else
            binfo.reason = "None";
        if (fetchclientban.hasPermission("BAN_MEMBERS")) {
            if (message.member.hasPermission("BAN_MEMBERS") || message.author.id == ownerID) {
                if (instruction.match(/^ban\s+(<@!?\d+>)(?:\s+[^]+)?$/i)) {
                    var usertoban = instruction.match(/^ban\s+<@!?(\d+)>(?:\s+[^]+)?$/i)[1];
                    usertoban = bot.users.get(usertoban.toString());
                    if (!usertoban) return message.reply("User not found!");
                    usertoban = message.guild.members.get(usertoban.id);
                    if (usertoban.highestRole.comparePositionTo(fetchclientban.highestRole) >= 0) {
                        if (usertoban.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
                            message.reply("The user specified has a higher or equal role hierarchy position than both of us!");
                        } else {
                            message.reply("The user specified has a higher or equal role hierarchy position than me!");
                        }
                    } else if (usertoban.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
                        message.reply("The user specified has a higher or equal role hierarchy position than you!");
                    } else {
                        if (usertoban.id == "c.d") {
                            message.reply("***NO***");
                        } else {
                            if (usertoban.id == message.member.id) {
                                message.reply("Are you really trying to ban yourself?");
                            } else if (usertoban.id == message.guild.ownerid) {
                                message.reply("You cannot ban the server owner!");
                            } else {
                                usertoban.ban(1);
                                message.reply("User banned successfully!");
                                if (servermods[gueldid].logs !== "")
                                    message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: actionLogs(0, 1, gueldid, "banned", message.author, usertoban.user, false, 1, binfo.reason)[0]});
                            }
                        }
                    }
                } else {
                    message.reply("Nobody is mentioned! You need to mention who to ban!");
                }
            } else {
                message.reply("You do not have the permission `Ban Members`!");
            }
        } else {
            if (message.member.hasPermission("BAN_MEMBERS") || message.author.id == ownerID) {
                message.reply("Uh oh! I do not have the permission `Ban Members`!");
            } else {
                message.reply("Uh oh! Neither of us have the permission `Ban Members`!");
            }
        }
        } catch (err) {
            message.reply("I like trains.");
            console.log("Error while banning:" + err.message);
        }
    }
    /* if (/^unban\s(.+)$/i.test(instruction)) {
        try {
        var fetchclientunban = message.guild.members.get(bot.user.id);
        if (fetchclientunban.hasPermission("BAN_MEMBERS")) {
            if (message.member.hasPermission("BAN_MEMBERS")) {
                if (message.mentions.users.first()) {
                    message.guild.unban(message.mentions.users.first());
                } else {
                    message.reply("Nobody is mentioned! You need to mention who to unban!");
                }
            } else {
                message.reply("You do not have the permission `Ban Members`!");
            }
        } else {
            message.reply("Uh oh! I do not have the permission `Ban Members`!");
        }
        } catch (err) {
            message.reply("I like trains.");
            console.log("Error while banning:" + err.message);
        }
    } */
    if (/^listcommands/i.test(instruction)) {
        var commandlistthings = Object.keys(servercmds[gueldid]).join("\n• ").toLowerCase();
        message.reply("The list of custom commands has been sent to your Private Messages!");
        message.author.sendMessage("***Custom commands for guild \"" + message.guild.name + "\":***\n• " + commandlistthings + "\n\n**===========================================**");
    }
    if (/^kick\s+<@!?\d+>(?:\s+[^]+)?$/i.test(instruction)) {
        try {
        var fetchclientkick = message.guild.members.get(bot.user.id);
        const kinfo = {};
        if (instruction.match(/^kick\s+<@!?\d+>\s+([^]+)$/i))
            kinfo.reason = instruction.match(/^kick\s+<@!?\d+>\s+([^]+)$/i)[1];
        else
            kinfo.reason = "None";
        if (fetchclientkick.hasPermission("KICK_MEMBERS")) {
            if (message.member.hasPermission("KICK_MEMBERS") || message.author.id == ownerID) {
                if (instruction.match(/^kick\s+(<@!?\d+>)(?:\s+[^]+)?$/i)) {
                    var usertokick = instruction.match(/^kick\s+<@!?(\d+)>(?:\s+[^]+)?$/i)[1];
                    usertokick = bot.users.get(usertokick.toString());
                    if (!usertokick) return message.reply("User not found!");
                    usertokick = message.guild.members.get(usertokick.id);
                    if (usertokick.highestRole.comparePositionTo(fetchclientkick.highestRole) >= 0) {
                        if (usertokick.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
                            message.reply("The user specified has a higher or equal role hierarchy position than both of us!");
                        } else {
                            message.reply("The user specified has a higher or equal role hierarchy position than me!");
                        }
                    } else if (usertokick.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
                        message.reply("The user specified has a higher or equal role hierarchy position than you!");
                    } else {
                        if (usertokick.id == "a.b") {
                            message.reply("***NO***");
                        } else {
                            if (usertokick.id == message.member.id) {
                                message.reply("Are you really trying to kick yourself?");
                            } else if (usertokick.id == message.guild.ownerid) {
                                message.reply("You cannot kick the server owner!");
                            } else {
                                usertokick.kick();
                                message.reply("User kicked successfully!");
                                if (servermods[gueldid].logs !== "")
                                    message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: actionLogs(0, 1, gueldid, "kicked", message.author, usertokick.user, false, 1, kinfo.reason)[0]});
                            }
                        }
                    }
                } else {
                    message.reply("Nobody is mentioned! You need to mention who to kick!");
                }
            } else {
                message.reply("You do not have the permission `Kick Members`!");
            }
        } else {
            if (message.member.hasPermission("KICK_MEMBERS") || message.author.id == ownerID) {
                message.reply("Uh oh! I do not have the permission `Kick Members`!");
            } else {
                message.reply("Uh oh! Neither of us have the permission `Kick Members`!");
            }
        }
        } catch (err) {
            message.reply("I like trains.");
            console.log("Error while kicking:" + err.message);
        }
    }
    if (/^welcfarew\s(?:.+?)\s(?:.+)$/i.test(instruction)) {
        /* jshint sub:true */
        try {
            if (message.member.hasPermission("MANAGE_GUILD") || message.author.id == ownerID) {
                var welcommand = instruction.match(/^welcfarew\s(.+?)\s(?:.+)$/i)[1];
                var welmessage = instruction.match(/^welcfarew\s(?:.+?)\s(.+)$/i)[1];
                if (/^welcome$/i.test(welcommand)) {
                    if (/^<#([0-9])+>$/i.test(welmessage) && message.guild.channels.get(welmessage.replace(/[<#>]/ig, ""))) {
                        servermsgs[gueldid]["welcome"]["channel"] = message.guild.channels.get(welmessage.replace(/[<#>]/ig, "")).id;
                        writeMsg();
                        message.reply("Welcome message channel set to " + welmessage + "!");
                    } else {
                        servermsgs[gueldid]["welcome"]["message"] = welmessage;
                        writeMsg();
                        message.reply("Welcome message set!");
                        console.log(welmessage);
                    }
                } else if (/^farewell$/i.test(welcommand) || (/^goodbye$/i.test(welcommand))) {
                    if (/^<#([0-9])+>$/i.test(welmessage) && message.guild.channels.get(welmessage.replace(/[<#>]/ig, ""))) {
                        servermsgs[gueldid]["goodbye"]["channel"] = message.guild.channels.get(welmessage.replace(/[<#>]/ig, "")).id;
                        writeMsg();
                        message.reply("Farewell message channel set to " + welmessage + "!");
                    } else {
                        servermsgs[gueldid]["goodbye"]["message"] = welmessage;
                        writeMsg();
                        message.reply("Farewell message set!");
                    }
                }
            } else {
                message.reply("You need the permission `Manage Server` to do this command!");
            }
        } catch (err) {
            message.reply("An error happened!");
            console.log("Error while doing welcome/farewell:\n" + err.message);
        }
    }
    if (/^welcfarew$/i.test(instruction)) {
        message.reply("`" + prefix + "welcfarew {welcome/farewell} {message (or channel to set the channel where the message is sent)}`\n\nSets the message for members joining or leaving. {member} is replaced with the user mention.\n**Note:** If a channel is written in the message spot, it sets the channel of where the message is sent.\n**REQUIRES `Manage Server` PERMISSION**");
    }
    if (/^autorole\s(.+)$/i.test(instruction)) {
        autoroletomatch = instruction.match(/^autorole\s(.+)$/i)[1];
        if (autoroletomatch !== undefined) {
            /* jshint -W080 */
            for(var iterator = message.guild.roles.entries(),val = iterator.next(),autorolematch = undefined; val.done === false; val = iterator.next()) {
                if(autoroletomatch.toUpperCase() === val.value[1].name.toUpperCase()) {
                    autorolematch = val.value[1];
                }
            }
            /* jshint +W080 */
            if (autorolematch !== null && autorolematch !== undefined) {
                if (message.guild.members.get(bot.user.id).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                    if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID) {
                        if (message.guild.roles.get(autorolematch.id)) {
                            serverroles[gueldid] = autorolematch.id;
                            writeRoles();
                            message.reply("Autorole (role given on join) set! Remember, that I must have the permission `Manage Roles`!");
                        } else {
                            message.reply("That role doesn't exist!");
                        }
                    } else {
                        message.reply("You do not have the permission `Manage Roles`!");
                    }
                } else {
                    if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID) {
                        message.reply("I do not have the permission `Manage Roles`!");
                    } else {
                        message.reply("Neither of us has the permission `Manage Roles`!");
                    }
                }
            }
        }    
    }
    if (/^delautorole$/i.test(instruction)) {
        if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID) {
            if (serverroles[gueldid] === "") {
                message.reply("This server doesn't have an autorole!");
            } else {
                serverroles[gueldid] = "";
                writeRoles();
                message.reply("Autorole deleted successfully!");
            }
        } else {
            if (serverroles[gueldid] === "") {
                message.reply("This server doesn't have an autorole nor do you have the permission `Manage Roles`!");
            } else {
                message.reply("You do not have the permission `Manage Roles`!");
            }
        }
    }
    if (/^mute\s{1,4}<@!?\d+>(?:\s{1,4}\d+(?:\s{1,4}.+)?)?$/i.test(instruction)) {
        /* jshint sub:true */
        try {
        var notimespec = false;
        //var argbase = instruction.match(/^mute\s+(.+)$/i)[1];
        let argname = instruction.match(/^mute\s{1,4}<@!?(\d+)>(?:\s{1,4}\d+(?:\s{1,4}.+)?)?$/i)[1]; // argbase.match(/^(.+?)\s(?:.+)$/i)[1];
        console.log(argname);
        argname = bot.users.get(argname.toString());
        console.log(argname);
        if (!argname) return message.reply("User not found!");
        if (instruction.match(/^mute\s+<@!?\d+>\s+?(\d+)?(?:\s{1,4}.+)?$/i)) {
            argtime = instruction.match(/^mute\s+<@!?\d+>\s+?(\d+)?(?:\s{1,4}.+)?$/i)[1];
        } else {
            argtime = "";
        }
        const muteobj = {};
        muteobj.reason = instruction.match(/^mute\s{1,4}<@!?\d+>(?:\s{1,4}\d+(\s{1,4}.+))?$/i) ? instruction.match(/^mute\s{1,4}<@!?\d+>(?:\s{1,4}\d+(\s{1,4}.+))?$/i)[1] : "None";
        var botmember = message.guild.members.get(bot.user.id);
        if (argtime === null || argtime === undefined || argtime === "") {
            argtime = 10;
            var notimespec = true;
        }
        if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID || checkmodrole(message.member) === true) {
            if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                if (botmember.hasPermission("MANAGE_CHANNELS")) {
                    if (message.guild.roles.find("name", "SaltMuted") && message.guild.roles.get(servermutes[gueldid]["muteRoleID"])) {
                        if (/*argname.id == ownerID || */argname.id == "244533925408538624") {
                            message.reply("***NO***");
                        } else {
                            if (argname.id in servermutes[gueldid]["mutes"]) {
                                message.reply("That user is already muted!");
                            } else {
                                servermutes[gueldid]["mutes"][argname.id] = {};
                                servermutes[gueldid]["mutes"][argname.id]["id"] = argname.id;
                                servermutes[gueldid]["mutes"][argname.id]["expire"] = new Date().getTime()+60000*argtime;
                                servermutes[gueldid].mutes[argname.id].permanent = false;
                                writeMutes();
                                message.guild.members.get(argname.id).addRole(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                                let diffmins = (-1 * (new Date().getTime() - servermutes[gueldid]["mutes"][argname.id]["expire"])) / 60000;
                                if (diffmins.toString().match(/^\d+.(\d+)$/)) {
                                    diffsecos = Math.round(Math.round((diffmins%1)*600)/10);
                                } else {
                                    diffsecos = 0;
                                }
                                if (notimespec === true) {
                                    message.reply("User muted successfully! Since no time was specified, they were muted for **10 minutes** (default time)!");
                                } else {
                                    if (argtime == "1" || argtime == 1) 
                                        message.reply(`User muted successfully for **1 minute**!`);
                                    else
                                        message.reply(`User muted successfully for **${argtime} minutes**!`);
                                }
                                const timer = `${diffsecos === 0 ? `${diffmins} minutes` : diffsecos % 60 === 0 ? `${Math.floor(diffmins)+(diffsecos/60)} minute(s)` : `${Math.floor(diffmins)} minutes and ${diffsecos} seconds`}`;
                                if (servermods[gueldid].logs !== "") {
                                    const a = actionLogs(0, chanel.id, gueldid, "muted", message.author.toString(), argname.toString(), true, timer, muteobj.reason);
                                    if (message.guild.channels.get(servermods[gueldid].logs)) {
                                        message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                                    }
                                }
                            }
                        }
                    } else {
                        console.log("Automatically creating role SaltMuted for guild " + message.guild.name + "...");
                        message.guild.createRole({ name: "SaltMuted" ,permissions: []}).then(role => {
                            servermutes[gueldid]["muteRoleID"] = role.id;
                            writeMutes();
                            // servermutes[gueldid]["muteRoleID"] = message.guild.roles.find("name", "SaltMuted").id;
                            // Array.from(message.guild.channels).map(v=>overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false}));
                            Array.from(message.guild.channels).forEach(function(item, index) {
                                var Ilike = item[0];
                                /*console.log(Ilike);*/
                                var trainz = message.guild.channels.get(Ilike);
                                /*console.log(trainz.name);*/
                                //console.log(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                                trainz.overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false});
                            });
                            console.log("Automatically created role SaltMuted for guild " + message.guild.name + "!");
                            if (argname.id == "244533925408538624") {
                                message.reply("***NO***");
                            } else {
                                if (/* message.guild.members.get(argname.id).roles.get(servermutes[gueldid]["muteRoleID"]) && */argname.id in servermutes[gueldid]["mutes"]) {
                                    message.reply("That user is already muted!");
                                } else {
                                    servermutes[gueldid]["mutes"][argname.id] = {};
                                    servermutes[gueldid]["mutes"][argname.id]["id"] = argname.id;
                                    servermutes[gueldid]["mutes"][argname.id]["expire"] = new Date().getTime()+60000*argtime;
                                    servermutes[gueldid].mutes[argname.id].permanent = false;
                                    writeMutes();
                                    let diffmins = (-1 * (new Date().getTime() - servermutes[gueldid]["mutes"][argname.id]["expire"])) / 60000;
                                    if (diffmins.toString().match(/^\d+.(\d+)$/)) {
                                        diffsecos = Math.round(Math.round((diffmins%1)*600)/10);
                                    } else {
                                        diffsecos = 0;
                                    }
                                    message.guild.members.get(argname.id).addRole(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                                    if (notimespec === true) {
                                        message.reply("User muted successfully! Since no time was specified, they were muted for **10 minutes** (default time)!");
                                    } else {
                                        if (argtime == "1" || argtime == 1) 
                                            message.reply(`User muted successfully for **1 minute**!`);
                                        else
                                            message.reply(`User muted successfully for **${argtime} minutes**!`);
                                    }
                                    const timer = `${diffsecos === 0 ? `${diffmins} minutes` : diffsecos % 60 === 0 ? `${Math.floor(diffmins)+(diffsecos/60)} minute(s)` : `${Math.floor(diffmins)} minutes and ${diffsecos} seconds`}`;
                                    if (servermods[gueldid].logs !== "") {
                                        const a = actionLogs(0, chanel.id, gueldid, "muted", message.author, argname, true, timer, muteobj.reason);
                                        if (message.guild.channels.get(servermods[gueldid].logs)) {
                                            message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                                        }
                                    }
                                }
                            }
                        })
                        .catch();
                    }     
                } else {
                    message.reply("I do not have the permission `Manage Channels`!");
                }
            } else {
                if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                    message.reply("I do not have the permission `Manage Channels`!");
                } else {
                    message.reply("I do not have the permissions `Manage Channels` and `Manage Roles`!");
                }
            }
        } else {
            if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                message.reply("You do not have the permission `Manage Roles`!");
            } else {
                message.reply("Neither of us have the permission `Manage Roles`!");
            }
        }
        } catch(err) {
            message.reply("An error was found! (Did you make sure you wrote a valid amount of minutes?)");
            console.log("Error while trying to mute:\n" + err.message);
        }
    }
    if (/^p?unmute\s{1,4}<@!?\d+>(?:\s{1,4}.+)?$/i.test(instruction)) {
        try {
        var argbase = instruction.match(/^p?unmute\s(.+)(?:\s{1.4}.+)?/i)[1];
        let argname = instruction.match(/^p?unmute\s{1,4}<@!?(\d+)>(?:\s{1,4}.+)?$/i)[1];
        argname = bot.users.get(argname.toString());
        if (!argname) return message.reply("User not found!");
        var argmember = message.guild.members.get(argname.id);
        var botmember = message.guild.members.get(bot.user.id);
        let argreason = instruction.match(/^p?unmute\s{1,4}<@!?\d+>(\s{1,4}.+)$/i) ? instruction.match(/^p?unmute\s{1,4}<@!?\d+>\s{1,4}(.+)?$/i)[1] : "None";
        if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
            if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID || checkmodrole(message.member) === true) {
                if (argname.id in servermutes[gueldid]["mutes"]) {
                    delete servermutes[gueldid]["mutes"][argname.id];
                    writeMutes();
                    if (argmember.roles.get(servermutes[gueldid]["muteRoleID"])) {
                        argmember.removeRole(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                    }
                    message.reply("User unmuted successfully!");
                        if (servermods[gueldid].logs !== "") {
                            const a = actionLogs(0, chanel.id, gueldid, "unmuted", message.author, argname, false, 1, argreason);
                            if (message.guild.channels.get(servermods[gueldid].logs)) {
                                message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                            }
                        }
                } else {
                    message.reply("That user is not muted!");
                }
            } else {
                message.reply("You do not have the permission `Manage Roles`!");
            }
        } else {
            if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID) {
                message.reply("I do not have the permission `Manage Roles`!");
            } else {
                message.reply("Neither of us have the permission `Manage Roles`!");
            }
        }
        } catch (err) {
            message.reply("Uh-oh! An error happened! :(");
            console.log("Error while trying to unmute:" + err.message);
        }
    }
    if (/^mutetime(?:\s<@!?\d+>)?$/i.test(instruction)) {
        var iself = instruction.match(/^mutetime(\s<@!?\d+>)$/i);
        let argname;
        let argmember;
        if (iself == null) {
            argname = message.author;
            argmember = message.member;
        } else {
            argname = instruction.match(/^mutetime\s<@!?(\d+)>$/i)[1];
            argname = bot.users.get(argname.toString());
            if (!argname) return message.reply("User not found!");
            argmember = message.guild.members.get(argname.id);
        }
        if (argname.id in servermutes[gueldid]["mutes"]) {
            if (servermutes[gueldid]["mutes"][argname.id]["expire"] !== "" && !(servermutes[gueldid].mutes[argname.id].permanent)) {
                var diffmins = (-1 * (new Date().getTime() - servermutes[gueldid]["mutes"][argname.id]["expire"])) / 60000;
                if (diffmins.toString().match(/^\d+.(\d+)$/)) {
                    diffsecs = Math.round(Math.round((diffmins%1)*600)/10);
                } else {
                    diffsecs = 0;
                }
                if (new Date().getTime() >= servermutes[gueldid]["mutes"][argname.id]["expire"]) {
                    if (argmember.roles.get(servermutes[gueldid]["muteRoleID"])) {
                        argmember.removeRole(servermutes[gueldid]["muteRoleID"]);
                    }
                    delete servermutes[gueldid]["mutes"][argname.id];
                    writeMutes();
                    if (argname.id == message.author.id)
                        message.reply("You aren't muted!");
                    else
                        message.reply("The user specified isn't muted!");
                } else {
                    var diffmins = Math.floor(diffmins);
                    if (diffsecs === 0) {
                        chanel.sendMessage("Mute time left for user" + argname + ": **" + diffmins + " minutes**.");
                    } else {
                        if (Math.floor(diffmins) === 0)
                            chanel.sendMessage(`Mute time left for user ${argname}: **${diffsecs} seconds**.`);
                        else
                            if (diffmins / 60 >= 1)
                                if (Math.floor(diffmins / 60) / 24 >= 1)
                                    chanel.sendMessage(`Mute time left for user ${argname}: **${Math.floor(Math.floor(diffmins/60) / 24)} day(s), ${Math.floor(diffmins/60) % 24} hour(s), ${diffmins % Math.floor(diffmins/60)} minute(s) and ${diffsecs} second(s)**.`);
                                else
                                    chanel.sendMessage(`Mute time left for user ${argname}: **${Math.floor(diffmins/60)} hour(s), ${diffmins % Math.floor(diffmins/60)} minute(s) and ${diffsecs} second(s)**.`);
                            else
                                chanel.sendMessage("Mute time left for user" + argname + ": **" + Math.floor(diffmins) + " minutes** and **" + diffsecs + " seconds**.");
                    }
                }
            } else {
                if (servermutes[gueldid].mutes[argname.id].permanent === true)
                    if (argname.id == message.author.id)
                        message.reply("You are muted until someone unmutes you!");
                    else
                        message.reply("The user "+argname+" is muted until someone unmutes them!");
            }
        } else {
            if (argname.id == message.author.id) {
                message.reply("You aren't muted!");
            } else {
                message.reply("The user specified isn't muted!");
            }
        }
    }
    if (/^coinflip(?:.+)?$/i.test(instruction)) {
        if (Math.floor((Math.random() * 2) + 1) == 1) {
            message.reply("Tails!");
        } else {
            message.reply("Heads!");
        }
    }
    if (/^random\s\d+(?:(?:\.|,)\d+)?\s\d+(?:(?:\.|,)\d+)?$/i.test(instruction)) {
        var max = instruction.match(/^random\s(\d+(?:(?:\.|,)\d+)?)\s\d+(?:(?:\.|,)\d+)?$/i)[1];
        var min = instruction.match(/^random\s\d+(?:(?:\.|,)\d+)?\s(\d+(?:(?:\.|,)\d+)?)$/i)[1];
        if (max < min)
            [max, min] = [Number(min), Number(max)];
        [max, min] = [Number(max), Number(min)];
        if (max == min)
            message.reply("Both are the same number.");
        else
            if (max.toString().match(/\d+(\.|,)\d+/) || min.toString().match(/\d+(\.|,)\d+/))
                message.reply("Only full numbers are allowed!");
            else {
                var maths = Math.floor(Math.random() * (max - min + 1)) + min;
                message.reply(maths);
            }
    }
    if (/^feedme$/i.test(instruction))
        if (message.author.id == ownerID)
            message.reply("Take a 🐟 for being my super handsome owner!");
        else
            if (message.author.id == "206561428432355328" || message.author.id == "229729055669354497")
                message.reply("Take a 🍕 for being a handsome tiger!");
            else
                if (message.author.id == "175729958323224576")
                    message.reply("Take a 🍕 for being a handsome person!");
                else
                    message.reply("No.");
    if (/^toggleinvites$/i.test(instruction)) {
        try {
            const botmember = message.guild.members.get(bot.user.id);
            if (botmember.hasPermission("MANAGE_MESSAGES")) {
                if (message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == ownerID) {
                    if (gueldid in serverdetects && serverdetects[gueldid]["invite"]) {
                        if (serverdetects[gueldid]["invite"] == "true") {
                            serverdetects[gueldid]["invite"] = "false";
                            writeDetects();
                            message.reply("Invite links in messages have been enabled!");
                        } else {
                            serverdetects[gueldid]["invite"] = "true";
                            writeDetects();
                            message.reply("Invite links in messages have been disabled!");
                        }
                    }
                } else {
                    message.reply("You do not have the permission `Manage Messages`!");
                }
            } else {
                if (message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == ownerID) 
                    message.reply("I do not have the permission `Manage Messages`!");
                else
                    message.reply("Neither of us has the permission `Manage Messages`!");
            }
        } catch (err) {
            message.reply("Err, an error happened!");
            console.log(`Error while trying to toggle invites:\n${err.message}`);
        }
    }
    if (/^clear\s(?:\d+)$/i.test(instruction)) {
        const botmember = message.guild.members.get(bot.user.id);
        const clear = instruction.match(/^clear\s(\d+)$/i)[1];
        const clearnum = Number(clear);
        const potat = {};
        potat.numbar = Number(clear) + 1;
        const replysuccess = function(){
            message.reply(`${potat.numbar - 1} message(s) deleted successfully!`).then(msg => {
                msg.delete(5000);
            });
        };
        if (botmember.hasPermission("MANAGE_MESSAGES")) {
            if (message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == ownerID) {
                if (Number(clear) > 1000) {
                    message.reply("The limit of messages being cleared is 1000!");
                } else {
                    if (Number(clear) == 1) {
                        message.channel.bulkDelete(2).then(messages => {
                            message.reply(`1 message deleted successfully!`).then(msg => {
                                msg.delete(5000);
                            });
                        });
                    } else {
                        const definitiveclear = potat.numbar;
                        if (definitiveclear > 100) {
                            message.channel.bulkDelete(100).then(nothing => {
                                if (definitiveclear > 200) {
                                    message.channel.bulkDelete(100).then(alsonothing => {
                                        if (definitiveclear > 300) {
                                            message.channel.bulkDelete(100).then(noothing => {
                                                if (definitiveclear > 400) {
                                                    message.channel.bulkDelete(100).then(nootnoot => {
                                                        if (definitiveclear > 500) {
                                                            message.channel.bulkDelete(100).then(trainsarecool => {
                                                                if (definitiveclear > 600) {
                                                                    message.channel.bulkDelete(100).then(haveyouheard => {
                                                                        if (definitiveclear > 700) {
                                                                            message.channel.bulkDelete(100).then(thatIliketrains => {
                                                                                if (definitiveclear > 800) {
                                                                                    message.channel.bulkDelete(100).then(andstuff => {
                                                                                        if (definitiveclear > 900) {
                                                                                            message.channel.bulkDelete(100).then(lol => {
                                                                                                if (definitiveclear == 1000) {
                                                                                                    message.channel.bulkDelete(100).then(msgs => {
                                                                                                        replysuccess();
                                                                                                    });
                                                                                                } else {
                                                                                                    message.channel.bulkDelete(definitiveclear - 900);
                                                                                                    replysuccess();
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            message.channel.bulkDelete(definitiveclear - 800);
                                                                                            replysuccess();
                                                                                        }
                                                                                    });
                                                                                } else {
                                                                                    message.channel.bulkDelete(definitiveclear - 700);
                                                                                    replysuccess();
                                                                                }
                                                                            });
                                                                        } else {
                                                                            message.channel.bulkDelete(definitiveclear - 600);
                                                                            replysuccess();
                                                                        }
                                                                    });
                                                                } else {
                                                                    message.channel.bulkDelete(definitiveclear - 500);
                                                                    replysuccess();
                                                                }
                                                            });
                                                        } else {
                                                            message.channel.bulkDelete(definitiveclear - 400);
                                                            replysuccess();
                                                        }
                                                    });
                                                } else {
                                                    message.channel.bulkDelete(definitiveclear - 300);
                                                    replysuccess();
                                                }
                                            });
                                        } else {
                                            message.channel.bulkDelete(definitiveclear - 200);
                                            replysuccess();
                                        }
                                    });
                                } else {
                                    message.channel.bulkDelete(definitiveclear - 100);
                                    replysuccess();
                                }
                            });
                        } else {
                            message.channel.bulkDelete(Number(clear) + 1).then(messages => {
                                message.reply(`${clear} message(s) deleted successfully!`).then(msg => {
                                    msg.delete(5000);
                                });
                            });
                        }
                    }
                }
            } else {
                message.reply("You do not have the permission `Manage Messages`!");
            }
        } else {
            if (message.member.hasPermission("MANAGE_MESSAGES"))
                message.reply("I do not have the permission `Manage Messages`!");
            else
                message.reply("Neither of us has the permission `Manage Messages`!");
        }
    }
    if (/^hooktalk\s\[(?:.+?)\]\s\((?:.+?)\)\s{(?:.+?)}\s[^]+$/i.test(instruction)) {
        try {
            let hookname = instruction.match(/^hooktalk\s\[(.+?)\]\s\((?:.+?)\)\s{(?:.+?)}\s[^]+$/i)[1];
            let hookurl = instruction.match(/^hooktalk\s\[(?:.+?)\]\s\((.+?)\)\s{(?:.+?)}\s[^]+$/i)[1];
            let hookcontent = instruction.match(/^hooktalk\s\[(?:.+?)\]\s\((?:.+?)\)\s{(?:.+?)}\s([^]+)$/i)[1];
            let hookavatar = instruction.match(/^hooktalk\s\[(?:.+?)\]\s\((?:.+?)\)\s{(.+?)}\s[^]+$/i)[1];
            let hook = new webhook(hookurl);
            hook.on("ready", () => {
                hook.execute({
                    content:hookcontent,
                    username:hookname,
                    avatar_url:hookavatar
                });
                console.log(`Offworlder ${message.guild}!`);
                console.log(`Also, ${hookname}, ${hookurl}, ${hookcontent}, ${hookavatar}.`);
            });  
            chanel.sendMessage("I think it worked");
        } catch (err) {
            message.reply("Erm, oops?");
            console.log(`Error while trying to hooktalk:\n${err.message}`);
        }
    }
    if (/^hooktalk$/i.test(instruction)) {
        message.reply(`${prefix}hooktalk [hook name] (hook url) {hook avatar url} text\nThe []s, ()s and {}s MUST be written in order for it to work.`);
    }
    if (/^(ping|pong)(?:\s+)?$/i.test(instruction)) {
        message.reply(`Pong! The ping is ${Date.now() - message.createdAt.getTime()} milliseconds.`);
    }
    if (/^trigger(?:\s.+?\s[^]+)?$/i.test(instruction)) {
        try {
            if (instruction.match(/^trigger(\s.+?\s.+)$/i)) {
                if (message.member.hasPermission("MANAGE_GUILD") || message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == ownerID) {
                    const trigger1 = instruction.match(/^trigger\s(.+?)\s.+$/i)[1];
                    const trigger2 = instruction.match(/^trigger\s.+?\s(.+)$/i)[1];
                    message.reply(`Trigger **${trigger1}** added!`);  
                    if ((/^ +$/i).test(trigger1) || trigger1 === "") return;              
                    serverdetects[gueldid].triggers[trigger1.toLowerCase()] = trigger2;
                    writeDetects();
                    antitrigger[message.id+chanel.id+trigger1] = true;
                } else {
                    message.reply("You do not have the permission `Manage Messages` (Although `Manage Server` also works)!");
                }
            } else {
                if (Object.keys(serverdetects[gueldid].triggers).length <= 0) {
                    message.reply("This guild doesn't have any trigger!");
                } else {
                    message.author.sendMessage(`List of triggers for guild "${message.guild.name}":\n• ${Object.keys(serverdetects[gueldid].triggers).join("\n• ")}\n\n**===========================================**`, {split: true});
                    message.reply("The list of triggers for this guild has been sent to your private messages!");
                }
            }
        } catch (err) {
            message.reply("RIP, something happened!");
            console.log(`Error while doing trigger: ${err.message}`);
        }
    }
    if (/^deltrigger\s(?:.+)$/i.test(instruction)) {
        try {
            const deltrigger = instruction.match(/^deltrigger\s(.+)$/i)[1];
            if (message.member.hasPermission("MANAGE_GUILD") || message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == ownerID) {
                if (deltrigger.toLowerCase() in serverdetects[gueldid].triggers) {
                    delete serverdetects[gueldid].triggers[deltrigger.toLowerCase()];
                    writeDetects();
                    message.reply(`Trigger **${deltrigger}** deleted successfully!`);
                } else {
                    message.reply("That is not a trigger in this guild!");
                }
            } else {
                message.reply("You do not have the permission `Manage Messages` (Although `Manage Server` also works)!");
            }
        } catch (err) {
            message.reply("RIP. Something happened!");
            console.log(`Error while doing deltrigger: ${err.message}`);
        }
    }
    if (/^setrole\s(?:.+?)\s(?:.+)$/i.test(instruction)) {
        try {
        const roletype = instruction.match(/^setrole\s(.+?)\s(?:.+)$/i)[1];
        const rolematched = instruction.match(/^setrole\s(?:.+?)\s(.+)$/i)[1];
        if (rolematched && roletype) {
            if (message.member.hasPermission("MANAGE_GUILD") || message.author.id == ownerID) {
                 /* jshint -W080 */
                for(var iterator = message.guild.roles.entries(),val = iterator.next(),rolematk = undefined; val.done === false; val = iterator.next()) {
                    if(rolematched.toUpperCase() === val.value[1].name.toUpperCase()) {
                        rolematk = val.value[1];
                    }
                }
                /* jshint +W080 */ 
                if (rolematk) {
                    if (/^Moderator$/i.test(roletype)) {
                        console.log("ohnoe");
                        servermods[gueldid].moderator = `${rolematk.id}`;
                        writeMods();
                        message.reply(`Role "${rolematk.name}" set as the \`Moderator Role\` for this guild successfully!`);
                    } else {
                        message.reply("Not a valid role type! Available role types are: `Moderator`!");
                    }
                } else {
                    message.reply("Role not found!");
                }
            } else {
                message.reply("You don't have the permission `Manage Server`!");
            }
        }
        } catch (err) {
            message.reply("Uh oh! I'm sorry, but an error happened!");
            console.log(`Error while doing setrole:\n${err.message}`);
        }
    }
    if (/^delsetrole\s(?:.+)$/i.test(instruction)) {
        try {
            const roletyped = instruction.match(/^delsetrole\s(.+)$/i)[1];
            if (message.member.hasPermission("MANAGE_GUILD") || message.author.id == ownerID) {
                if (/^Moderator$/i.test(roletyped)) {
                    if (servermods[gueldid].moderator !== "") {
                        const oldrole = message.guild.roles.get(servermods[gueldid].moderator);
                        servermods[gueldid].moderator = "";
                        writeMods();
                        message.reply(`"${oldrole.name}" is no longer my moderator role!`);
                    } else {
                        message.reply("You do not have a moderator role set!");
                    }
                } else {
                    message.reply("Current available options of role to delete is: `Moderator`!");
                }
            } else {
                message.reply("You do not have the permission `Manage Server`!");
            }
        } catch (e) {
            message.reply("Uh-oh! I'm sorry, but an error happened!");
            console.log(`Error while doing delsetrole:\n${e.message}`);
        }
    }
    if (/^setlogs\s{1,4}(?:.+?)(?:\s{1,4}<#\d+>)?$/i.test(instruction)) {
        try {
        const option = instruction.match(/^setlogs\s{1,4}(.+?)(\s{1,4}<#\d+>)?$/i)[1];
        const cchannel = {};
        if (instruction.match(/^setlogs\s{1,4}(?:.+?)(?:\s{1,4}(<#\d+>))?$/i)[1]) {
            cchannel.channel = instruction.match(/^setlogs\s{1,4}(?:.+?)(?:\s{1,4}(<#\d+>))?$/i)[1];
        }
        if (message.member.hasPermission("MANAGE_GUILD") || message.author.id == ownerID) {
            if (cchannel.channel) {
                if (/^true$/i.test(option) || /^set$/i.test(option) || /^add$/i.test(option)) {
                    const channelobject = message.guild.channels.get(cchannel.channel.replace(/[<#>]/ig, ""));
                    if (channelobject) {
                        servermods[gueldid].logs = channelobject.id;
                        writeMods();
                        message.reply("Logs set for this server successfully!");
                    } else {
                        message.reply("That's not a channel! (If it is actually a channel, make sure you put # behind its name!)");
                    }
                } else {
                    if (/^false$/i.test(option) || /^remove$/i.test(option)) {
                        if (servermods[gueldid].logs === "") {
                            message.reply("Logs aren't set in this server!");
                        } else {
                            servermods[gueldid].logs = "";
                            writeMods();
                            message.reply("Logs have been disabled in this server successfully!");
                        }
                    } else {
                        message.reply("That option is not valid! Valid options: `true` or `set` or `add` to set logs, and `false` or `remove` to disable logs!");
                    }
                }
            } else {
                if (/^true$/i.test(option) || /^set$/i.test(option) || /^add$/i.test(option)) {
                    message.reply("You need to specify a channel to be the logs!");
                } else {
                    if (/^false$/i.test(option) || /^remove$/i.test(option)) {
                        if (servermods[gueldid].logs === "") {
                            message.reply("Logs aren't set in this server!");
                        } else {
                            servermods[gueldid].logs = "";
                            writeMods();
                            message.reply("Logs have been disabled in this server successfully!");
                        }
                    } else {
                        message.reply("That option is not valid! Valid options: `true` or `set` or `add` to set logs, and `false` or `remove` to disable logs!");
                    }
                }
            }
        } else {
            message.reply("You do not have the permission `Manage Server`!");
        }
        } catch (err) {
            message.reply("Eh? An error happened... Sorry!");
            console.log(`Error while doing setlogs: ${err.message}`);
        }
    }
    if (/^clear\s+<@!?\d+>(?:\s+\d+)?$/i.test(instruction)){
        try {
            const clearargs = {};
            clearargs.mention = instruction.match(/^clear(\s+<@!?\d+>)(?:\s+\d+)?$/i) ? instruction.match(/^clear\s+<@!?(\d+)>(?:\s+\d+)?$/i)[1] : null;
            if (clearargs.mention) {
                clearargs.mention = bot.users.get(clearargs.mention);
                if (!(clearargs.mention)) return message.reply("User not found!");
            }
            clearargs.number = instruction.match(/^clear\s<@!?\d+>(?:\s(\d+))?$/i) ? instruction.match(/^clear\s<@!?\d+>(?:\s(\d+))?$/i)[1] : null;
            const botmember = message.guild.members.get(bot.user.id);
            if (!(clearargs.mention)) return message.reply("The user that is mentioned doesn't exist!");
            if (message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == ownerID) {
                if (botmember.hasPermission("MANAGE_MESSAGES")) {
                    if (!(clearargs.number)) clearargs.number = 50;
                    if (clearargs.number > 100) return message.reply("The limit of ***user messages*** being cleared is 100!");
                    chanel.fetchMessages({limit: clearargs.number}).then(messages => {
                        const arr = [];
                        Array.from(messages).map(v=>{
                            if (v[1].author.id == clearargs.mention.id)
                                arr.push(v[1]);
                        });
                        if (arr.length == 1) 
                            arr[0].delete().then(abc => {
                                message.reply(`In the limit of ${clearargs.number} message(s), ${arr.length} message by ${clearargs.mention.username} was cleared! ;)`).then(msg => {
                                    msg.delete(5000);
                                });
                            });
                        else
                            chanel.bulkDelete(arr).then(msgs => {
                                message.reply(`In the limit of ${clearargs.number} message(s), ${arr.length} message(s) by ${clearargs.mention.username} were cleared! ;)`).then(msg => {
                                    msg.delete(5000);
                                });
                            });
                    });
                } else {
                    message.reply("I do not have the permission `Manage Messages`!");
                }
            } else {
                if (botmember.hasPermission("MANAGE_MESSAGES"))
                    message.reply("You do not have the permission `Manage Messages`!");
                else
                    message.reply("Neither of us has the permission `Manage Messages`!");
            }

        } catch (err) {
            message.reply("Hmm.. Sorry! But something happened..!");
            console.log("Error while doing clear (with users):\n" + err.message);
        }
    }
    if (/^rip\s+[^]+$/i.test(instruction)) {
        try {
            const argz = {};
            argz.content = instruction.match(/^rip\s+([^]+)$/i)[1];
            if (!argz) return message.reply("Uhh..You didn't say anything valid!...");
            if (message.mentions.users.first()) {
                Array.from(message.mentions.users).map(v=>{
                    argz.content = argz.content.replace(/<@!?\d+>/i, v[1].username);
                });
            }
            message.reply(`RIP! http://ripme.xyz/#${encodeURIComponent(argz.content)}`);
        } catch (err) {
            message.reply("RIP! Something happened!");
            console.log(`Error while doing rip:\n${err.message}`);
        }
    }
    if (/^image\s+(?:.+?)(?:\s[^]+)?$/i.test(instruction)) {
        try {
            const imgdata = {};
            imgdata.command = instruction.match(/^image\s+(.+?)(?:\s+[^]+)?$/i)[1];
            imgdata.notpassed = false;
            if (instruction.match(/^image\s+(?:.+?)(\s+[^]+)/i))
                imgdata.arg = instruction.match(/^image\s+(?:.+?)\s+([^]+)/i)[1];
            else
                imgdata.arg = null;
            if (Number(message.attachments.size) < 1) return message.reply("You need to attach an image! (Tip: Use `" + prefix + "avatar @mention` to get the avatar of someone!)");
            if (!(message.guild.member(bot.user).hasPermission("ATTACH_FILES"))) return message.reply("I do not have the permission `Attach Files`! :(");
            Array.from(message.attachments).map(v=>{
                if(!(/(?:\.png|\.jpg|\.jpeg|\.bmp)$/i.test(v[1].filename))) return message.reply("You must upload an image!" + ["", imgdata.notpassed = true][0]);
                imgdata.img = v[1].url;
            });
            if (imgdata.notpassed) return;
            if (/^rotate$/i.test(imgdata.command)) {
                if (!(imgdata.arg)) return message.reply("You need to specify the degrees to rotate!");
                if (!(/^\d+$/i.test(imgdata.arg))) return message.reply("The amount of degrees must be a full number!");
                Jimp.read(imgdata.img).then(function(img) {
                    if (img.bitmap.width > 2012 || img.bitmap.height > 2012) return message.reply("Image too big!");
                    img.rotate(Number(imgdata.arg))
                    .getBuffer(Jimp.AUTO, function(err, newimg) {
                        chanel.sendFile(newimg);
                    });
                });
            } else if (/^grayscale$/i.test(imgdata.command)) {
                Jimp.read(imgdata.img).then(function(img) {
                    if (img.bitmap.width > 2012 || img.bitmap.height > 2012) return message.reply("Image too big!");
                    img.grayscale()
                    .getBuffer(Jimp.AUTO, function(err, newimg) {
                        chanel.sendFile(newimg);
                    });
                });
            } else {
                message.reply("Not a valid option! Current valid options are: `rotate` and `grayscale`");
            }
        } catch (err) {
            message.reply("Woops! An error happened!");
            console.log(`Error while doing image command:\n${err.message}`);
        }
    }
    if (/^warn\s+<@!?\d+>(?:\s+.+)?$/i.test(instruction)) {
        try {
        const warning = {};
        warning.mention = instruction.match(/^warn(\s+<@!?\d+>)(?:\s+.+)?$/i) ? instruction.match(/^warn\s+<@!?(\d+)>(?:\s+.+)?$/i)[1] : null;
        if (warning.mention) {
            warning.mention = bot.users.get(warning.mention);
            if (!(warning.mention)) return message.reply("User not found!");
        }
        warning.reason = instruction.match(/^warn\s+<@!?\d+>\s+(.+)$/i) ? instruction.match(/^warn\s+<@!?\d+>\s+(.+)$/i)[1] : "None";
        if (!(warning.mention)) return message.reply("You must mention an user!");
        if (message.author.id == "206561428432355328") return message.reply("**NO**");
        if (servermods[gueldid].moderator !== "") {
            if (!(checkmodrole(message.member)) && message.author.id !== ownerID) return message.reply("You do not have this server's moderator role!");
            if (serverwarns[gueldid].setup.limit < 1) {
                message.reply(`Warned ${warning.mention} successfully!`);
                const t = {
                    username: message.author
                };
                if (servermods[gueldid].logs !== "")
                    message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: actionLogs(0, chanel.id, gueldid, "warned", t.username, warning.mention, false, 1, warning.reason)[0]});
            } else {
                if (!(serverwarns[gueldid].warnedusers[warning.mention.id])) serverwarns[gueldid].warnedusers[warning.mention.id] = 0;
                serverwarns[gueldid].warnedusers[warning.mention.id]++;
                if (serverwarns[gueldid].warnedusers[warning.mention.id] >= serverwarns[gueldid].setup.limit) {
                    if (!(serverwarns[gueldid].setup.punishment)) return message.reply("Your server doesn't have a punishment set (?).");
                    let punishment = serverwarns[gueldid].setup.punishment;
                    if (punishment == "ban") {
                        if (message.guild.member(bot.user).hasPermission("BAN_MEMBERS")) {
                            if (!(message.guild.member(warning.mention).bannable)) return message.reply("That user is not bannable for some reason! (This would be their final warning before a ban)");
                            message.guild.member(warning.mention).ban(0);
                            chanel.sendMessage(`The user ${warning.mention} has been **banned** for reaching the limit of warnings, as says the server's current setup!`);
                            delete serverwarns[gueldid].warnedusers[warning.mention.id];
                            writeWarns();
                            if (servermods[gueldid].logs !== "")
                                message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: actionLogs(0, chanel.id, gueldid, "banned (automatically, by warn limit)", message.author, warning.mention, false, 1, warning.reason)[0]});
                        } else {
                            message.reply("Uh-oh! This warning would be their final warning resulting in a **ban**, but I do not have the permission `Ban Members`!");
                        }
                    } else if (punishment == "kick") {
                        if (message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) {
                            if (!(message.guild.member(warning.mention).kickable)) return message.reply("That user is not kickable for some reason! (This would be their final warning before a kick)");
                            message.guild.member(warning.mention).kick();
                            chanel.sendMessage(`The user ${warning.mention} has been **kicked** for reaching the limit of warnings, as says the server's current setup!`);
                            delete serverwarns[gueldid].warnedusers[warning.mention.id];
                            writeWarns();
                            if (servermods[gueldid].logs !== "")
                                message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: actionLogs(0, chanel.id, gueldid, "kicked (automatically, by warn limit)", message.author, warning.mention, false, 1, warning.reason)[0]});
                        } else {
                            message.reply("Uh-oh! This warning would be their final warning resulting in a **kick**, but I do not have the permission `Kick Members`!");
                        }
                    } else {
                        const t = punishment;
                        if (!(t.werkz)) return;
                        if (!(message.guild.member(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) || !(message.guild.member(bot.user).hasPermission("MANAGE_CHANNELS"))) return message.reply("Uh-oh! This warning would be their final warning resulting in a **mute**, but I do not have either the permission `Manage Roles`, `Manage Channels` or both!");
                        const argname = warning.mention;
                        const argtime = serverwarns[gueldid].setup.punishment.time;
                        if (message.guild.roles.find("name", "SaltMuted") && message.guild.roles.get(servermutes[gueldid]["muteRoleID"])) {
                            if (warning.mention.id == "244533925408538624") {
                                return message.reply("No...");
                            } else {
                                if (warning.mention.id in servermutes[gueldid]["mutes"]) {
                                    return message.reply("Hmmm... This would be the user's final warning before **mute**, but it is already muted!");
                                } else {
                                    servermutes[gueldid]["mutes"][warning.mention.id] = {};
                                    servermutes[gueldid]["mutes"][warning.mention.id]["id"] = warning.mention.id;
                                    servermutes[gueldid]["mutes"][argname.id]["expire"] = new Date().getTime()+60000*argtime;
                                    servermutes[gueldid].mutes[argname.id].permanent = false;
                                    writeMutes();
                                    message.guild.members.get(argname.id).addRole(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                                    let diffmins = (-1 * (new Date().getTime() - servermutes[gueldid]["mutes"][argname.id]["expire"])) / 60000;
                                    if (diffmins.toString().match(/^\d+.(\d+)$/)) {
                                        diffsecos = Math.round(Math.round((diffmins%1)*600)/10);
                                    } else {
                                        diffsecos = 0;
                                    }
                                    if (argname.id == "244533925408538624") {
                                        message.reply("User muted successfully! Since no time was specified, they were muted for **10 minutes** (default time)!");
                                    } else {
                                        if (argtime == "1" || argtime == 1) 
                                            chanel.sendMessage(`The user ${argname} has been **muted** (${argtime} minute) for reaching the limit of warnings, as says the server's current setup!`);
                                        else
                                            chanel.sendMessage(`The user ${argname} has been **muted** (${argtime} minutes) for reaching the limit of warnings, as says the server's current setup!`);
                                    }
                                    const timer = `${diffsecos === 0 ? `${diffmins} minutes` : diffsecos % 60 === 0 ? `${Math.floor(diffmins)+(diffsecos/60)} minute(s)` : `${Math.floor(diffmins)} minutes and ${diffsecos} seconds`}`;
                                    if (servermods[gueldid].logs !== "") {
                                        const a = actionLogs(0, chanel.id, gueldid, "muted (automatically, by warn limit)", message.author, warning.mention, true, timer, warning.reason);
                                        if (message.guild.channels.get(servermods[gueldid].logs) !== "") {
                                            message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                                        }
                                    }
                                }
                            }
                        } else {
                            console.log("Automatically creating role SaltMuted for guild " + message.guild.name + "...");
                            message.guild.createRole({ name: "SaltMuted" ,permissions: []}).then(role => {
                                servermutes[gueldid]["muteRoleID"] = role.id;
                                writeMutes();
                                // servermutes[gueldid]["muteRoleID"] = message.guild.roles.find("name", "SaltMuted").id;
                                // Array.from(message.guild.channels).map(v=>overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false}));
                                Array.from(message.guild.channels).forEach(function(item, index) {
                                    var Ilike = item[0];
                                    
                                    var trainz = message.guild.channels.get(Ilike);
                                    
                                    //console.log(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                                    trainz.overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false});
                                });
                                console.log("Automatically created role SaltMuted for guild " + message.guild.name + "!");
                                if (warning.mention.id == "244533925408538624") {
                                return message.reply("No...");
                            } else {
                                if (warning.mention.id in servermutes[gueldid]["mutes"]) {
                                    return message.reply("Hmmm... This would be the user's final warning before **mute**, but it is already muted!");
                                } else {
                                    servermutes[gueldid]["mutes"][warning.mention.id] = {};
                                    servermutes[gueldid]["mutes"][warning.mention.id]["id"] = warning.mention.id;
                                    servermutes[gueldid]["mutes"][argname.id]["expire"] = new Date().getTime()+60000*argtime;
                                    servermutes[gueldid].mutes[argname.id].permanent = false;
                                    writeMutes();
                                    message.guild.members.get(argname.id).addRole(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                                    let diffmins = (-1 * (new Date().getTime() - servermutes[gueldid]["mutes"][argname.id]["expire"])) / 60000;
                                    if (diffmins.toString().match(/^\d+.(\d+)$/)) {
                                        diffsecos = Math.round(Math.round((diffmins%1)*600)/10);
                                    } else {
                                        diffsecos = 0;
                                    }
                                    if (false === 1) {
                                        message.reply("User muted successfully! Since no time was specified, they were muted for **10 minutes** (default time)!");
                                    } else {
                                        if (argtime == "1" || argtime == 1) 
                                            chanel.sendMessage(`The user ${argname} has been **muted** (${argtime} minute) for reaching the limit of warnings, as says the server's current setup!`);
                                        else
                                            chanel.sendMessage(`The user ${argname} has been **muted** (${argtime} minutes) for reaching the limit of warnings, as says the server's current setup!`);
                                    }
                                    const timer = `${diffsecos === 0 ? `${diffmins} minutes` : diffsecos % 60 === 0 ? `${Math.floor(diffmins)+(diffsecos/60)} minute(s)` : `${Math.floor(diffmins)} minutes and ${diffsecos} seconds`}`;
                                    if (servermods[gueldid].logs !== "") {
                                        const a = actionLogs(0, chanel.id, gueldid, "muted (automatically, by warn limit)", message.author, warning.mention, true, timer, warning.reason);
                                        if (message.guild.channels.get(servermods[gueldid].logs) !== "") {
                                            message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                                        }
                                    }
                                }
                            }
                        });
                        }     
                        delete serverwarns[gueldid].warnedusers[warning.mention.id];
                        writeWarns();
                    }
                } else {
                    message.reply(`Warned ${warning.mention} successfully!`);
                    if (servermods[gueldid].logs !== "") {
                        console.log(`${warning.reason}, ${warning.mention}`);
                        message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: actionLogs(0, chanel.id, gueldid, "warned", `${message.author}`, `${warning.mention}`, false, 1, `${warning.reason}`)[0]});
                    }
                }
            }
        } else {
            message.reply(`This server does not have a Moderator role, which is required for this action! Someone with \`Manage Servers\` must write: \`${prefix}setrole Moderator rolename\`, where rolename is the role's name.`, {split: true});
        }
        } catch (err) {
            message.reply("oh noe! An error happened!");
            console.log(`Error while trying to do warn: ${err.message}`);
        }
    }//*/
    if (/^setwarns\s+.+?\s+.+$/i.test(instruction)) {
        try {
        const setw = {};
        setw.cmd = instruction.match(/^setwarns\s+(.+?)(?:\s+.+)$/i)[1];
        setw.arg = instruction.match(/^setwarns\s+.+?(\s+.+)$/i) ? instruction.match(/^setwarns\s+.+?\s+(.+)$/i)[1] : null;
        const botmember = message.guild.member(bot.user);
        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID) return message.reply("You do not have the permission `Manage Server`!");
        if (!(setw.arg)) return message.reply("You need to provide an argument!");
        console.log(setw.arg+" and "+setw.cmd);
        if (/^limit$/i.test(setw.cmd)) {
            if (/^(?:false|remove)$/i.test(setw.arg)) {
                serverwarns[gueldid].setup.limit = 0;
                writeWarns();
                message.reply(`Warn limit removed successfully!`);
            } else if (/^\d+$/i.test(setw.arg)) {
                if (Number(setw.arg) > 95) return message.reply("The ***limit*** of warn ***limit*** is 95!");
                serverwarns[gueldid].setup.limit = Number(setw.arg);
                writeWarns();
                message.reply(`Warn limit set to \`${setw.arg}\` successfully!`);
            } else {
                message.reply("Argument not valid! Valid arguments for `limit`: `false`/`remove` and `{a full number}` (to set limit).");
            }
        } else if (/^punishment$/i.test(setw.cmd)) {
            if (/^kick$/i.test(setw.arg)) {
                if (!(botmember.hasPermission("KICK_MEMBERS"))) return message.reply("I do not have the permission `Kick Members`! :(");
                serverwarns[gueldid].setup.punishment = "kick";
                writeWarns();
                message.reply(`Warn limit punishment set to \`kick\` successfully!`);
            } else if (/^ban$/i.test(setw.arg)) {
                if (!(botmember.hasPermission("BAN_MEMBERS"))) return message.reply("I do not have the permission `Ban Members`! :(");
                serverwarns[gueldid].setup.punishment = "ban";
                writeWarns();
                message.reply(`Warn limit punishment set to \`ban\` successfully!`);
            } else if (/^mute(.+)$/i.test(setw.arg)) {
                if (!(botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) || !(botmember.hasPermission("MANAGE_CHANNELS"))) return message.reply("I need both `Manage Roles` and `Manage Channels` permissions to mute, and I apparently don't have one of them (or both)! :(");
                const splitting = setw.arg.match(/^mute\s(\d+)$/i) ? setw.arg.match(/^mute\s(\d+)$/i)[1] : null;
                if (!(splitting)) return message.reply("You must input a full number for the mute minute amount! (It must also not be empty)");
                serverwarns[gueldid].setup.punishment = {
                    werkz: true,
                    time: splitting
                };
                writeWarns();
                message.reply("Warn limit punishment set to \`mute\` ("+splitting+" minutes) successfully!");
            } else {
                message.reply("Argument not valid! Available arguments for `punishment` are: `kick`, `ban`, `mute {minutes}`.");
            }
        } else {
            message.reply("Valid config types: `punishment` and `limit`.");
        }
        } catch (err) {
            message.reply("Oh... An error happened! :(");
            console.log(`Error while trying to do setwarns:\n${err.message}`);
        }
    }
    if (/^clearwarns\s+<@!?\d+>$/i.test(instruction)) {
        try {
            if (servermods[gueldid].moderator === "") return message.reply("This server does not have a Moderator role! Ask someone with `Manage Server` permissions to do **`"+prefix+"setrole Moderator rolename`**, where rolename is the Moderator role!");
            if (!(checkmodrole(message.member)) && message.author.id !== ownerID) return message.reply("You do not have the Moderator role!");
            const cwarns = {};
            cwarns.user = instruction.match(/^clearwarns(\s+<@!?\d+>)$/i) ? instruction.match(/^clearwarns\s+<@!?(\d+)>$/i)[1] : null;
            if (cwarns.user) {
                cwarns.user = bot.users.get(cwarns.user);
                if (!(cwarns.user)) return message.reply("User not found!");
            }
            if (!(cwarns.user)) return message.reply("You must mention an user!");
            if (serverwarns[gueldid].setup.limit === 0) return message.reply("This server has not enabled warning limits (which is what enables warning storing)!");
            if (!(serverwarns[gueldid].warnedusers[cwarns.user.id])) return message.reply("Said user has not been warned!");
            delete serverwarns[gueldid].warnedusers[cwarns.user.id];
            writeWarns();
            message.reply("User's warns have been cleared successfully!");

        } catch (err) {
            message.reply("Eh, an error happened. Oh no.");
            console.log(`Error while trying to do clearwarns:\n${err.message}`);
        }
    }
    if (/^pmute\s{1,4}<@!?\d+>(?:\s{1,4}.+)?$/i.test(instruction)) {
        let argname = instruction.match(/^pmute\s{1,4}<@!?(\d+)>(?:\s{1,4}.+)?$/i)[1];
        argname = bot.users.get(argname);
        if (!argname) return message.reply("User not found!");
        const argtime = 1;
        if (!(checkmodrole(message.member)) && !(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID) return message.reply("You do not have the permission `Manage Roles`!");
        const mutereason = instruction.match(/^pmute\s{1,4}<@!?\d+>(\s{1,4}.+)$/i) ? instruction.match(/^pmute\s{1,4}<@!?\d+>\s{1,4}(.+)$/i)[1] : "None";
        if (!(message.guild.member(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS"))) return message.reply("I do not have the permission `Manage Roles`!");
        if (!(message.guild.member(bot.user).hasPermission("MANAGE_CHANNELS"))) return message.reply("I do not have the permission `Manage Channels`!");
        if (message.guild.roles.find("name", "SaltMuted") && message.guild.roles.get(servermutes[gueldid]["muteRoleID"])) {
            if (/*argname.id == ownerID || */argname.id == "244533925408538624") {
                message.reply("***NO***");
            } else {
                if (argname.id in servermutes[gueldid]["mutes"]) {
                    message.reply("That user is already muted!");
                } else {
                    servermutes[gueldid]["mutes"][argname.id] = {};
                    servermutes[gueldid]["mutes"][argname.id]["id"] = argname.id;
                    servermutes[gueldid]["mutes"][argname.id]["expire"] = 1;
                    servermutes[gueldid].mutes[argname.id].permanent = true;
                    writeMutes();
                    message.guild.members.get(argname.id).addRole(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                    message.reply(`User muted successfully! (Until they are unmuted)`);
                    if (servermods[gueldid].logs !== "") {
                        const a = actionLogs(0, chanel.id, gueldid, "muted", message.author.toString(), argname.toString(), true, "Until someone unmutes them", mutereason);
                        if (message.guild.channels.get(servermods[gueldid].logs)) {
                            message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                        }
                    }
                }
            }
        } else {
            console.log("Automatically creating role SaltMuted for guild " + message.guild.name + "...");
            message.guild.createRole({ name: "SaltMuted" ,permissions: []}).then(role => {
                servermutes[gueldid]["muteRoleID"] = role.id;
                writeMutes();
                // servermutes[gueldid]["muteRoleID"] = message.guild.roles.find("name", "SaltMuted").id;
                // Array.from(message.guild.channels).map(v=>overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false}));
                Array.from(message.guild.channels).forEach(function(item, index) {
                    var Ilike = item[0];
                    /*console.log(Ilike);*/
                    var trainz = message.guild.channels.get(Ilike);
                    /*console.log(trainz.name);*/
                    //console.log(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                    trainz.overwritePermissions(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]),{SEND_MESSAGES:false});
                });
                console.log("Automatically created role SaltMuted for guild " + message.guild.name + "!");
                if (argname.id == "244533925408538624") {
                    message.reply("***NO***");
                } else {
                    if (/* message.guild.members.get(argname.id).roles.get(servermutes[gueldid]["muteRoleID"]) && */argname.id in servermutes[gueldid]["mutes"]) {
                        message.reply("That user is already muted!");
                    } else {
                        servermutes[gueldid]["mutes"][argname.id] = {};
                        servermutes[gueldid]["mutes"][argname.id]["id"] = argname.id;
                        servermutes[gueldid]["mutes"][argname.id]["expire"] = 1;
                        servermutes[gueldid].mutes[argname.id].permanent = true;
                        writeMutes();
                        message.guild.members.get(argname.id).addRole(message.guild.roles.get(servermutes[gueldid]["muteRoleID"]));
                        message.reply(`User muted successfully! (Until they are unmuted)`);
                        if (servermods[gueldid].logs !== "") {
                            const a = actionLogs(0, chanel.id, gueldid, "muted", message.author.toString(), argname.toString(), true, "Until someone unmutes them", mutereason);
                            if (message.guild.channels.get(servermods[gueldid].logs)) {
                                message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                            }
                        }
                    }
                }
            })
            .catch();
        }
    }
    if (/^numupper\s{1,4}[\d, \s]+$/i.test(instruction)) {
        try {
            const num = instruction.match(/^numupper\s{1,4}([\d, \s]+)$/i)[1];
            const arrup = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
            return message.reply(num.replace(/\d/g, m=>arrup[Number(m)]));
        } catch (err) {
            message.reply("Hmm... An error happened.");
            console.log(`Error while trying to do numupper: ${err.message}`);
        }
    }
    if (/^autoname(?:\s{1,4}.+)?$/i.test(instruction)) {
        try {
            if (!(instruction.match(/^autoname(\s{1,4}.+)$/i))) return message.reply(`\`${prefix}autoname name\`\n\nThis command allows you to set what all members' nickname will be on join. You can write \`{name}\` as a placeholder for the actual name, such as, if you write \`{name} Hello\`, and the member's name is "Discord", their nickname will become \`Discord Hello\` on join.\n:warning: \`Manage Server\` permission required!`);
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID) return message.reply("You need the `Manage Server` permission to use this command!");
            const name = instruction.match(/^autoname\s{1,4}(.+)$/i)[1];
            servermsgs[gueldid].welcome.name = "";
            writeMsg();
            servermsgs[gueldid].welcome.name = name;
            writeMsg();
            message.reply(`Autoname set as \`${name}\` successfully!`);
        } catch (err) {
            message.reply("Uh oh! An error happened... -cri-");
            console.log(`Error while trying to do autoname: ${err.message}`);
        }
    }
    if (/^delautoname(?:\s{1,4})?$/i.test(instruction)) {
        try {
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID) return message.reply("You need the `Manage Server` permission to use this command!");
            if (!(servermsgs[gueldid].welcome.name)) return message.reply("This server doesn't have an autoname!");
            servermsgs[gueldid].welcome.name = "";
            writeMsg();
            message.reply(`Autoname disabled (and deleted) successfully!`);
        } catch (err) {
            message.reply("Uh oh..! An error happened :/");
            console.log(`Error while trying to do delautoname: ${err.message}`);
        }
    }
    if (/^invite(?:\s{1,4})?$/i.test(instruction)) {
        message.reply("Invite Salt to your server: https://discordapp.com/oauth2/authorize?client_id=244533925408538624&scope=bot&permissions=2136472639\n\nOfficial Salt server: https://discord.gg/amQP9m3");
    }
    if (/^calc\s{1,2}/i.test(instruction)) {
        let apprefix = prefix.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m);
        let regexstuff = new RegExp(`${apprefix}calc `, "i");
        var txt = instruction.replace(regexstuff, "");
        var mat = txt.match(/(?:Math\.\w+)|[()+\-*/&|^%<>=,]|(?:\d+\.?\d*(?:e\d+)?)|(?:pi|Pi|PI|pI)/g);
        var evl = (mat === null ? [] : mat).join ``;
        var newevl;
        var powerregex = /((?:-?\d+\.?\d*(?:e\d+)?)|(?:\(.+\))|(?:pi)|(?:Math\.(?:\w|\d)+(?:\(.+\))?))\s*\*\*\s*((?:-?\d+\.?\d*(?:e\d+)?)|(?:\(.+\))|(?:pi)|(?:Math\.(?:\w|\d)+(?:\(.+\))?))/g;
        while(newevl = evl.replace(powerregex, "Math.pow($1,$2)"), evl !== newevl) {
            evl = newevl;
        }
        console.log(evl + " ohM");
        evl = evl.replace(/Math.pi/ig, "pi");
        evl = evl.replace(/pi/ig, "Math.PI");
        evl = evl.replace(/Math.pi/ig, "Math.PI");
        var res;
        try {
            /*jshint ignore:start*/
            res = eval(evl);
            /*jshint ignore:end*/
        } catch (err) {
            chanel.sendMessage("```js\nQuery:\n" + txt + "\n\nError:\n" + err + "```");
        }
        if (!/^\s*$/.test(String(res)) && !isNaN(Number(res)) && res !== undefined && res !== null) {
            chanel.sendMessage("```js\nQuery:\n" + txt + "\n\nOutput:\n" + res + "```");
        }
    }
    if (/^broadcast\s{1,4}.+$/i.test(instruction) && message.author.id == ownerID) {
        bot.guilds.map(v=>{
            if (v.id !== "110373943822540800")
                v.defaultChannel.sendMessage(instruction.match(/^broadcast\s{1,4}(.+)$/i)[1]);
        });
    }
    if (/^role\s{1,4}.+?\s{1,4}(?:<@!?\d+>\s{1,4}.+|.+\s{1,4}<@!?\d+>)$/i.test(instruction)) {
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID) return message.reply("You don't have the permission `Manage Roles`!");
        const botmember = message.guild.members.get(bot.user.id);
        if (!(botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS"))) return message.reply("I don't have the permission `Manage Roles`!");
        const cmd = instruction.match(/^role\s{1,4}(.+?)\s{1,4}(?:<@!?\d+>\s{1,4}.+|.+\s{1,4}<@!?\d+>)$/i)[1];
        if (!(/(?:add|give)/i.test(cmd)) && !(/(?:remove|take)/i.test(cmd))) return message.reply("Invalid option! Option must be either `add`/`give` or `remove`/`take`!");
        if (!(instruction.match(/^role\s{1,4}.+?\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i))) return message.reply("You must mention an user!");
        let user = instruction.match(/^role\s{1,4}.+?\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i)[1];
        if (!user) user = instruction.match(/^role\s{1,4}.+?\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i)[2];
        user = bot.users.get(user);
        if (!user) return message.reply("User not found!");
        const usermember = message.guild.members.get(user.id);
        let matchrole = instruction.match(/^role\s{1,4}.+?\s{1,4}(?:<@!?\d+>\s{1,4}(.+)|(.+)\s{1,4}<@!?\d+>)$/i)[1];
        if (!matchrole) matchrole = instruction.match(/^role\s{1,4}.+?\s{1,4}(?:<@!?\d+>\s{1,4}(.+)|(.+)\s{1,4}<@!?\d+>)$/i)[2];
        let role;
        message.guild.roles.map(v=>{
            if (v.name.toUpperCase() == matchrole.toUpperCase())
                role = v;
        });
        if (!role) return message.reply("Role not found!");
        if (role.position > botmember.highestRole.position) return message.reply("Said role is higher than my highest role!");
        if (role.position == botmember.highestRole.position) return message.reply("Said role is the same as my highest role!");
        if (role.position >= message.member.highestRole.position) return message.reply("Said role is higher or equal than your highest role's position!");
        if (/add|give/i.test(cmd)) {
            if (usermember.roles.get(role.id)) return message.reply(`Said member already has the role **${role.name}**!`);
            usermember.addRole(role).then(roole=>message.reply(`Role **${role.name}** given to ${user} successfully!`));
        } else if (/remove|take/i.test(cmd)) {
            if (!(usermember.roles.get(role.id))) return message.reply(`Said member doesn't have the role **${role.name}**!`);
            usermember.removeRole(role).then(roole=>message.reply(`Role **${role.name}** taken from ${user} successfully!`));
        }
    }
    if (/^addrole\s{1,4}(?:<@!?\d+>\s{1,4}.+|.+\s{1,4}<@!?\d+>)$/i.test(instruction)) {
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID) return message.reply("You don't have the permission `Manage Roles`!");
        const botmember = message.guild.members.get(bot.user.id);
        if (!(botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS"))) return message.reply("I don't have the permission `Manage Roles`!");
        if (!(instruction.match(/^addrole\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i))) return message.reply("You must mention an user!");
        let user = instruction.match(/^addrole\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i)[1];
        if (!user) user = instruction.match(/^addrole\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i)[2];
        user = bot.users.get(user);
        if (!user) return message.reply("User not found!");
        const usermember = message.guild.member(user);
        let matchrole = instruction.match(/^addrole\s{1,4}(?:<@!?\d+>\s{1,4}(.+)|(.+)\s{1,4}<@!?\d+>)$/i)[1];
        if (!matchrole) matchrole = instruction.match(/^addrole\s{1,4}(?:<@!?\d+>\s{1,4}(.+)|(.+)\s{1,4}<@!?\d+>)$/i)[2];
        let role;
        message.guild.roles.map(v=>{
            if (v.name.toUpperCase() == matchrole.toUpperCase())
                role = v;
        });
        if (!role) return message.reply("Role not found!");
        if (role.position > botmember.highestRole.position) return message.reply("Said role is higher than my highest role!");
        if (role.position == botmember.highestRole.position) return message.reply("Said role is the same as my highest role!");
        if (role.position >= message.member.highestRole.position) return message.reply("Said role is higher or equal than your highest role's position!");
        if (usermember.roles.get(role.id)) return message.reply(`Said member already has the role **${role.name}**!`);
        usermember.addRole(role).then(roole=>message.reply(`Role **${role.name}** given to ${user} successfully!`));
    }
    if (/^removerole\s{1,4}(?:<@!?\d+>\s{1,4}.+|.+\s{1,4}<@!?\d+>)$/i.test(instruction)) {
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID) return message.reply("You don't have the permission `Manage Roles`!");
        const botmember = message.guild.members.get(bot.user.id);
        if (!(botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS"))) return message.reply("I don't have the permission `Manage Roles`!");
        if (!(instruction.match(/^removerole\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i))) return message.reply("You must mention an user!");
        let user = instruction.match(/^removerole\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i)[1];
        if (!user) user = instruction.match(/^removerole\s{1,4}(?:<@!?(\d+)>\s{1,4}.+|.+\s{1,4}<@!?(\d+)>)$/i)[2];
        user = bot.users.get(user);
        if (!user) return message.reply("User not found!");
        const usermember = message.guild.member(user);
        let matchrole = instruction.match(/^removerole\s{1,4}(?:<@!?\d+>\s{1,4}(.+)|(.+)\s{1,4}<@!?\d+>)$/i)[1];
        if (!matchrole) matchrole = instruction.match(/^removerole\s{1,4}(?:<@!?\d+>\s{1,4}(.+)|(.+)\s{1,4}<@!?\d+>)$/i)[2];
        let role;
        message.guild.roles.map(v=>{
            if (v.name.toUpperCase() == matchrole.toUpperCase())
                role = v;
        });
        if (!role) return message.reply("Role not found!");
        if (role.position > botmember.highestRole.position) return message.reply("Said role is higher than my highest role!");
        if (role.position == botmember.highestRole.position) return message.reply("Said role is the same as my highest role!");
        if (role.position >= message.member.highestRole.position) return message.reply("Said role is higher or equal than your highest role's position!");
        if (!(usermember.roles.get(role.id))) return message.reply(`Said member doesn't have the role **${role.name}**!`);
        usermember.removeRole(role).then(roole=>message.reply(`Role **${role.name}** taken from ${user} successfully!`));
    }
    if (/^encrypt\s{1,4}\[(?:.+)?\]\s{1,4}\((?:.+)?\)\s{1,4}\{(?:[^]+)?\}$/i.test(instruction)) {
        try {
            if (!(publickeys[message.author.id]) && !(instruction.match(/^encrypt\s{1,4}\[(?:.+)?\]\s{1,4}\((.+)\)\s{1,4}\{(?:[^]+)?\}$/i))) return message.reply("You do not have a key! (use `"+prefix+"setkey` to set a PRIVATE key, this uses your PUBLIC key which is a conversion of your PRIVATE.) You can also put a PUBLIC key in the parenthesis.");
            let flag;
            if (instruction.match(/^encrypt\s{1,4}\[(.+)\]\s{1,4}\((?:.+)?\)\s{1,4}\{(?:[^]+)?\}/i)) flag = instruction.match(/^encrypt\s{1,4}\[(.+)\]\s{1,4}\((?:.+)?\)\s{1,4}\{(?:[^]+)?\}/i)[1];
            if (!(/^PM$/i.test(flag)) && !(/^KEEP$/i.test(flag)) && !(/^(?:KEEP,PM)|(?:PM,KEEP)$/i.test(flag)) && flag) return message.reply("Invalid flag! Currently there's only the flag `PM` (write it if it must be sent to private message) and `KEEP` (to keep the message). You can also put nothing for flags to just send it normally.");
            if (!(instruction.match(/^encrypt\s{1,4}\[(?:.+)?\]\s{1,4}\((?:.+)?\)\s{1,4}\{([^]+)\}$/i))) return message.reply("You must input text to be encrypted between the { }s!");
            let key;
            if (!(instruction.match(/^encrypt\s{1,4}\[(?:.+)?\]\s{1,4}\((.+)\)\s{1,4}\{(?:[^]+)?\}$/i))) {
                key = publickeys[message.author.id];
            } else {
                key = instruction.match(/^encrypt\s{1,4}\[(?:.+)?\]\s{1,4}\((.+)\)\s{1,4}\{(?:[^]+)?\}$/i)[1];
            }
            if (!(/^KEEP$/i.test(flag)) && !(/^(?:KEEP,PM)|(?:PM,KEEP)$/i.test(flag))) message.delete();
            chanel.sendMessage("Encrypting, please wait...").then(msg=>{
                fullencrypt.encrypt(publickeys[message.author.id].toLowerCase(), instruction.match(/^encrypt\s{1,4}\[(?:.+)?\]\s{1,4}\((?:.+)?\)\s{1,4}\{([^]+)\}$/i)[1]).then(txt => {
                    if (flag)
                        if (/^PM$/i.test(flag) || /^(?:KEEP,PM)|(?:PM,KEEP)$/i.test(flag)) {
                            message.author.sendMessage(`\\~\\~**Encrypted text**\\~\\~\n${txt}`);
                            msg.edit(`<@${message.author.id}>, Text encrypted and sent to your private messages!`);
                        }
                        else {
                            msg.edit(`<@${message.author.id}>, **Encrypted text:**\n${txt}`);
                        }
                    else
                        msg.edit(`<@${message.author.id}>, **Encrypted text:**\n${txt}`);
                }).catch(function(reason) {
                        msg.edit(`Oh! An error happened. Please tell one of the bot's developers if you're confused about it! And the error is:\n\`${reason}\``);
                });
            });
        } catch (err) {
            message.reply("Oh....!!! An error happened.");
            console.log("Error while trying to do encrypt:\n"+err.message);
        }
    }
    if (/^decrypt\s{1,4}\[(?:.+)?\]\s{1,4}\{(?:[^]+)?\}$/i.test(instruction)) {
        try {
            if (!(instruction.match(/^decrypt\s{1,4}\[(.+)\]\s{1,4}\{(?:[^]+)\}$/i))) return message.reply("You must provide a key! (PRIVATE key, not PUBLIC key! If the key is wrong, it will not decrypt correctly!)");
                if (!(instruction.match(/^decrypt\s{1,4}\[(?:.+)\]\s{1,4}\{([^]+)\}$/i))) return message.reply("You must provide text to decrypt!");
                const key = instruction.match(/^decrypt\s{1,4}\[(.+)\]\s{1,4}\{(?:[^]+)\}$/i)[1];
                const texts = instruction.match(/^decrypt\s{1,4}\[(?:.+)\]\s{1,4}\{([^]+)\}$/i)[1];
                if (message.deletable) message.delete();
                chanel.sendMessage("Decrypting, please wait...").then(msg=>{
                    fullencrypt.decrypt(key.toLowerCase(), texts).then(deText => {
                        msg.edit(`<@${message.author.id}>, **Decrypted text (Warning: If the key is incorrect, then the decryption is also incorrect):**\n${deText}`);
                    }).catch(function(reason) {
                        msg.edit("<@"+message.author.id+">, Oh! An error happened. Please tell one of the bot's developers if you're confused about it! And the error is:\n`"+reason+"`");
                    });
                });
        } catch (err) {
            message.reply("Oh....!! An error happened.. Sorry.");
            console.log("Error while trying to do decrypt:\n"+err.message);
        }

    }
    if (/^setkey\s{1,4}.+$/i.test(instruction)) {
        const key = instruction.match(/^setkey\s{1,4}(.+)$/i)[1];
        if (!(publickeys[message.author.id])) {
            publickeys[message.author.id] = "";
            writeKeys();
        }
        if (message.deletable) message.delete();
        chanel.sendMessage("Generating public key, please wait...").then(msg=>{
            fullencrypt.getKey(key.toLowerCase()).then(keyz => {
                publickeys[message.author.id] = keyz;
                writeKeys();
                message.author.sendMessage("Your private key:\n"+key);
                msg.edit("<@"+message.author.id+">, Public key made ("+keyz+") and private key set! (Sent to PM, keep it safe!)");
            }).catch(function(reason) {
                msg.edit("<@"+message.author.id+">, Oh! An error happened. Please tell one of the bot's developers if you're confused about it! And the error is:\n`"+reason+"`");
            });
        });
    }
    if (/^getkey\s{1,4}<@!?\d+>$/i.test(instruction)) {
        if (!(/^<@!?\d+>$/i.test(instruction.match(/^getkey\s{1,4}(.+)$/i)[1]))) return message.reply("You must mention an user!");
        if (!(instruction.match(/^getkey\s{1,4}(<@!?\d+>)$/i))) return message.reply("You must mention an user!");
        let user = instruction.match(/^getkey\s{1,4}<@!?(\d+)>$/i)[1];
        user = bot.users.get(user);
        if (!user) return message.reply("User not found!");
        if (!(publickeys[user.id])) return message.reply("Said user doesn't have a PUBLIC key!");
        message.reply(`${user}'s public key: ${publickeys[user.id]}`);
    }
    if (/^manageselfrole\s{1,4}.+?\s{1,4}.+$/i.test(instruction)) {
        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID) return message.reply("You do not have the permission `Manage Server`!");
        const botmember = message.guild.member(bot.user);
        if (!(botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS"))) return message.reply("I do not have the permission `Manage Roles`!");
        const cmd = instruction.match(/^manageselfrole\s{1,4}(.+?)\s{1,4}.+$/i)[1];
        const arg = instruction.match(/^manageselfrole\s{1,4}.+?\s{1,4}(.+)$/i)[1];
        if (!(/^add$/i.test(cmd)) && !(/^remove$/i.test(cmd))) return message.reply("Option not valid! Valid options are either `add` or `remove`!");
        let role;
        message.guild.roles.map(v=>{
            if (v.name.toUpperCase() == arg.toUpperCase())
                role = v;
        });
        if (!role) return message.reply("Role not found!");
        if (/^add$/i.test(cmd)) {
            if (serverself[gueldid][role.id]) return message.reply("That is already a selfrole!");
            serverself[gueldid][role.id] = {};
            serverself[gueldid][role.id].id = role.id;
            writeSelfRoles();
            message.reply(`Role **${role.name}** is now a selfrole!`);
        } else if (/^remove$/i.test(cmd)) {
            if (!(serverself[gueldid][role.id])) return message.reply("Said role is not a selfrole!");
            delete serverself[gueldid][role.id];
            writeSelfRoles();
            message.reply(`Role **${role.name}** is no longer a selfrole!`);
        }
    }
    if (/^selfrole\s{1,4}.+$/i.test(instruction)) {
        const botmember = message.guild.member(bot.user);
        if (!(botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS"))) return message.reply("Uh oh... I do not have the permission `Manage Roles`!");
        const arg = instruction.match(/^selfrole\s{1,4}(.+)$/i)[1];
        let role;
        message.guild.roles.map(v=>{
            if (v.name.toUpperCase() == arg.toUpperCase())
                role = v;
        });
        if (!role) return message.reply("Role not found!");
        if (!(serverself[gueldid][role.id])) return message.reply("That role is not a selfrole!");
        if (role.position >= botmember.highestRole.position) return message.reply("That role has a higher or equal position than my highest role! :(");
        if (message.member.roles.get(serverself[gueldid][role.id].id))
            message.member.removeRole(role).then(roole=>message.reply(`Selfrole **${role.name}** removed from yourself successfully!`));
        else
            message.member.addRole(role).then(roole=>message.reply(`Selfrole **${role.name}** added to yourself successfully!`));
    }
    if (/^encrypt\s?$/i.test(instruction)) {
        message.reply(`\`${prefix}encrypt [FLAG] (PUBLIC key) {text}\`
            This command lets you encrypt text while using a key (Key is specified in parenthesis, and it's the PUBLIC key! You don't need to write anything in parenthesis to use your own). At FLAG, you can write PM, to send to private messages, write KEEP, to keep it (not delete) [you can also write both: KEEP,PM], or write nothing to send normally. Make sure to set your PRIVATE key (that generates PUBLIC) with ${prefix}setkey keygoeshere.`);
    }
    if (/^decrypt\s?$/i.test(instruction)) {
        message.reply(`\`${prefix}decrypt [PRIVATE key] {text}\`
            This command is to decrypt text that was encrypted with encrypt. They can only be decrypted using the PRIVATE key associated to the PUBLIC used to encrypt. It's like giving everyone locks, that only you have the key. The PRIVATE key, if not correct, will decrypt wrongly.`);
    }
    if (/^remind\s{1,4}[^]+$/i.test(instruction)) {
        try {
            if (!(/^remind\s{1,4}\{.+\}\s{1,4}[^]+$/i.test(instruction))) return message.reply("Invalid syntax! Syntax is: `"+prefix+"remind {time} reminder` (btw, {}s are required), where `time` can include: ?w (? weeks), ?d (? days), ?h (? hours), ?m (? minutes), ?s (? seconds), where all of them are optional, but at least one must be used. Example: `4w 2d 3h 1m 4s`. Example 2: `2d 4h`.");
            const datestringy = instruction.match(/^remind\s{1,4}\{(.+)\}\s{1,4}[^]+$/i)[1];
            const remindtext = instruction.match(/^remind\s{1,4}\{.+\}\s{1,4}([^]+)$/i)[1];
            let todate = toDate(datestringy);
            if (todate == "Invalid Date String") return message.reply("Invalid date string (text inside the {}s)!");
            if (todate == "All zeros") return message.reply("The date string must not be all zeros!");
            if (userreminders[message.author.id]) return message.reply("You already have a reminder set! Use (p)delreminder to delete it!");
            userreminders[message.author.id] = {};
            userreminders[message.author.id].channelID = chanel.id;
            userreminders[message.author.id].remind = remindtext;
            userreminders[message.author.id].expire = todate;
            writeReminders();
            message.reply("Reminder set successfully!");
        } catch (err) {
            message.reply("Uh-oh... An error happened...");
            console.log(`Error while trying to do remind:\n${err.message}`);
        }
    }
    if (/^delremind(?:er)?$/i.test(instruction)) {
        if (!(userreminders[message.author.id])) return message.reply("You do not have a reminder set!");
        delete userreminders[message.author.id];
        writeReminders();
        message.reply("Reminder deleted successfully!");
    }
    if (/^remind$/i.test(instruction)) {
        message.reply(`\`${prefix}remind {time} reminder \`
            (Note: The {} brackets are required!)
            This command makes the bot remind you after a certain time. Time can include: ?w (? weeks), ?d (? days), ?h (? hours), ?m (? minutes), ?s (? seconds), where all of them are optional, but at least one must be used. Example: \`4w 2d 3h 1m 4s\`. Example 2: \`2d 4h\`.`);
    }
    if (/^contact\s{1,4}.+$/i.test(instruction)) {
        try {
        if (message.author.id in contacts.cooldowns && message.author.id !== ownerID) {
            if (contacts.cooldowns[message.author.id] >= Date.now()) {
                delete contacts.cooldowns[message.author.id];
                writeContacts();
            } else {
                return message.reply("Please wait, this command is in cooldown! (You get a cooldown of 30 seconds when you successfully contact. Getting response resets cooldown)");
            }
        }
        if (message.author.id in contacts.blacklist.users && message.author.id !== ownerID) return message.reply(`You can't use this command anymore :( Reason: \`${contacts.blacklist.users[message.author.id]}\`. ${gueldid == "245744417619705859" ? "" : `(Go to Salt's official server if you think it's unfair!)`}`);
        if (chanel.id in contacts.blacklist.channels && message.author.id !== ownerID) return message.reply(`The channel you're in is disabled from using this command! Reason: \`${contacts.blacklist.channels[chanel.id]}\` ${gueldid == "245744417619705859" ? "" : `(Go to Salt's official server if you think it's unfair!)`}`);
        if (gueldid in contacts.blacklist.servers && message.author.id !== ownerID) return message.reply(`The server you're in is disabled from using this command! Reason: \`${contacts.blacklist.servers[gueldid]}\` ${gueldid == "245744417619705859" ? "" : `(Go to Salt's official server if you think it's unfair!)`}`);
        contacts.contacting[`${contacts.contacting.latestnumber}`] = {};
        contacts.contacting[`${contacts.contacting.latestnumber}`].guild = gueldid;
        contacts.contacting[`${contacts.contacting.latestnumber}`].channel = chanel.id;
        contacts.contacting[`${contacts.contacting.latestnumber}`].author = message.author.id;
        contacts.cooldowns[message.author.id] = 30000 + Date.now();
        contacts.contacting.latestnumber++;
        writeContacts();
        const contactstuff = instruction.match(/^contact\s{1,4}(.+)$/i)[1];
        bot.channels.get("253430675053477888").sendMessage(`**${contacts.contacting.latestnumber - 1}**: **${message.author.username}**, at #${chanel.name} of server "${message.guild.name}" says:\n\n${contactstuff}\n\n(IDs: User: ${message.author.id}; Channel: ${chanel.id}; Server: ${gueldid}.)`);
        message.reply("Contacted successfully! You are now in a cooldown of 30 seconds unless you get an answer (Which resets your cooldown)! (Also please be patient! If nobody is online then we'll see it once we go on!)");
        } catch (err) {
            message.reply("Error found! Make sure to..uh...Tell the bot devs about it!");
            console.log(err.message);
        }
    }
    if (/^c\s{1,4}.+?\s{1,4}[^]+$/i.test(instruction)) {
        try {
        if (!(message.author.id in contacts.support)) return;
        if (contacts.support[message.author.id] !== 1 && gueldid !== "245744417619705859" && message.author.id !== ownerID) return;
        const subcmd = instruction.match(/^c\s{1,4}(.+?)\s{1,4}.+$/i)[1];
        const arg = instruction.match(/^c\s{1,4}.+?\s{1,4}(.+)$/i)[1];
        if (/^blacklist$/i.test(subcmd)) {
            if (contacts.support[message.author.id] !== 1 && message.author.id !== ownerID) return message.reply("Only Pg and Aplet can do this!");
            if (!(arg.match(/^(user|server|channel)\s{1,4}.+$/i))) return message.reply("Invalid option for `blacklist`! Options are `user`, `server` and `channel`!");
            const splitting = {};
            splitting.first = arg.match(/^(user|server|channel)\s{1,4}.+$/i)[1];
            splitting.second = arg.match(/^(?:user|server|channel)\s{1,4}(.+)$/i)[1];
            if (!(splitting.second.match(/^.+?\s{1,4}(.+)/i)))
                splitting.third = "None";
            else {
                splitting.third = splitting.second.match(/^.+?\s{1,4}(.+)/i)[1];
                splitting.second = splitting.second.match(/^(.+?)\s{1,4}.+/i)[1];
            }
            if (!(/^\d+$/i.test(splitting.second))) return message.reply("ID must a number (and must be the ID)... (Example: `+c blacklist user 1234567` will blacklist the user with ID 1234567, if it exists.)");
            if (/^user$/i.test(splitting.first)) {
                const a = bot.users.get(splitting.second);
                if (!a) return message.reply("User not found! (The bot searched by the ID. If the user has no common servers with Salt, then RIP)");
                if (splitting.second in contacts.blacklist.users) {
                    delete contacts.blacklist.users[splitting.second];
                    writeContacts();
                    message.reply(`User "${a.username}" unblacklisted successfully!`);
                } else {
                    contacts.blacklist.users[splitting.second] = splitting.third;
                    writeContacts();
                    message.reply(`User "${a.username}" blacklisted successfully!`);
                }
            } else if (/^channel$/i.test(splitting.first)) {
                const a = bot.channels.get(splitting.second);
                if (!a) return message.reply("Channel not found! (The bot searched by the ID. If that channel is not between any channel that Salt is in, then RIP)");
                if (a.type !== "text") return message.reply("That is not a text channel!");
                if (splitting.second in contacts.blacklist.channels) {
                    delete contacts.blacklist.channels[splitting.second];
                    writeContacts();
                    message.reply(`Channel #${a.name} unblacklisted successfully!`);
                } else {
                    contacts.blacklist.channels[splitting.second] = splitting.third;
                    writeContacts();
                    message.reply(`Channel #${a.name} blacklisted successfully!`);
                }
            } else if (/^server$/i.test(splitting.first)) {
                const a = bot.guilds.get(splitting.second);
                if (!a) return message.reply("Server not found! (The bot searched by ID. If Salt is not in that server, RIP)");
                if (splitting.second in contacts.blacklist.servers) {
                    delete contacts.blacklist.servers[splitting.second];
                    writeContacts();
                    message.reply(`Server "${a.name}" unblacklisted successfully!`);
                } else {
                    contacts.blacklist.servers[splitting.second] = splitting.third;
                    writeContacts();
                    message.reply(`Server "${a.name}" blacklisted successfully!`);
                }
            }
        } else if (/^respond$/i.test(subcmd)) {
            const splitting = {};
            if (!(/^.+?\s{1,4}.+$/i.test(arg))) return message.reply("`+c respond NUMBER ANSWER`.");
            splitting.first = arg.match(/^(.+?)\s{1,4}[^]+$/i)[1];
            splitting.second = arg.match(/^.+?\s{1,4}([^]+)$/i)[1];
            if (!(/^\d+$/i.test(splitting.first))) return message.reply("That (what you put after respond) is not a number... :/");
            if (!(splitting.first in contacts.contacting)) return message.reply("Invalid contact number! Either it has already been answered, or it doesn't exist.");
            const contactur = contacts.contacting[splitting.first];
            if (!(bot.channels.get(contactur.channel))) {
                delete contacts.contacting[splitting.first];
                writeContacts();
                if (contactur.author in contacts.cooldowns) {
                    delete contacts.cooldowns[contactur.author];
                    writeContacts();
                }
                return message.reply("Huh? That channel that they sent contact from has been deleted or something similar. Marked as answered...Not..?");
            }
            bot.channels.get(contactur.channel).sendMessage(`<@${contactur.author}>, Answer from **${contacts.support[message.author.id] == 1 ? "Bot Dev" : "Support"} ${message.author.username}** for your contacting:\n\n${splitting.second}`);
            delete contacts.contacting[splitting.first];
            writeContacts();
            message.reply("Done! Replied successfully!");
            if (contactur.author in contacts.cooldowns) {
                delete contacts.cooldowns[contactur.author];
                writeContacts();
            }
        } else {
            message.reply(`Invalid option! Valid options are either \`blacklist\` or \`respond\`!`);
        }
        } catch (err) {
            message.reply("Error found! ;-;");
            console.log(`Error while trying to do c:\n${err.message}`);
        } 
    }
    } // End of the whole prefix checking If
    if (/^\+prefix(\s(?:.+))?$/i.test(input)) {
        console.log("Potential");
        try {
        prefixtest = input.match(/^\+prefix(\s(?:.+))?$/)[1]; } catch(err) {
            prefixtest = 1;
        }
        if (prefixtest == 1 | prefixtest === undefined) {
            message.reply("This is the command that sets the custom prefix for this server. Only people with the `Manage Server` permission (or the bot owner) may use this command! And remember: This command in specific will always have a prefix of ***`+`***!!!\nCurrent prefix for this server: `" + prefix + "`");
        } else {
            try {
                if (message.member.hasPermission("MANAGE_GUILD") | message.author.id == ownerID) {
                    prefixtoexport = prefixtest.replace(/^ /, "");
                    serverthings[(gueldid)] = prefixtoexport;
                    writeServer();
                    message.reply("Prefix successfully set to `" + prefixtest + "`! Remember, this command in specific keeps its prefix!");
                } else {
                    message.reply("You need the `Manage Server` permission to set the prefix of this server!");
                }
            } catch(err) {
                message.reply("Oops... Something errored along the lines of code!");
                console.log(err.message);
            }
        }
    }
    if (/^\+restart(?:[^]+)?$/i.test(input)) {
        if (message.author.id !== ownerID) return chanel.sendMessage("no");
        chanel.sendMessage("Restarting!");
        process.exit(1);
    }
    if (/(d[\s\n]*i?[\s\n]*s?[\s\n]*)?c[\s\n]*o[\s\n]*r[\s\n]*d[\s\n]*\.?[\s\n]*g[\s\n]*g[\s\n]*\/[\s\n]*\/?[\s\n]*(?:.+)/ig.test(input)) {
        if (gueldid in serverdetects && serverdetects[gueldid]["invite"] == "true") {
            if (message.deletable === true && message.author.bot === false && !(message.member.hasPermission("ADMINISTRATOR")) && message.author.id !== ownerID) {
                message.delete();
                message.reply("This server does not allow invite links in their messages!").then(msg => {
                    setTimeout(function(){
                        msg.delete();
                    }, 7000);
                });
            }
        }
    }
    try {
    if (message.guild.id == "233644998460047365" && chanel.id == "234128579405807628") {
        const msgdate = new Date(message.createdTimestamp);
        bot.guilds.get("193903425640071168").channels.get("249949042115608576").sendMessage(`${message.author} at ${msgdate.getDate()}/${msgdate.getMonth() + 1}/${msgdate.getFullYear()}, ${msgdate.getHours()}:${msgdate.getMinutes()}:${msgdate.getSeconds()};
            ${message.content}`);
        if (message.attachments) {
            Array.from(message.attachments).map(v=>{
                const vv = v[1].url;
                if (vv !== "" && vv !== null) {
                    bot.guilds.get("193903425640071168").channels.find("name", "pgs-resid").sendFile(vv);
                }
            });
        }
    }
    } catch (err) {
        console.log(err.message);
    }
    const triggers = serverdetects[gueldid].triggers;
    if (triggers !== {} && message.author.bot === false)
        for (let x in triggers) {
            const triggerfind = x.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m);
            const trigregexp = new RegExp(triggerfind, "ig");
            if (trigregexp.test(input)) {
                if (antitrigger[message.id+chanel.id+x] === true)
                    delete antitrigger[message.id+chanel.id+x];
                else
                    if (message.author.bot) return;
                    chanel.sendMessage(`\u200B${triggers[x]}`);
            }
        }
    } else if (message.channel.type=="dm") {
        var input = message.content;
        /*if (/^\+clear\s\d+$/i.test(input)) {
            try {
            const botmember = bot.user;
            const clear = input.match(/^\+clear\s(\d+)$/i)[1];
            const clearnum = Number(clear);
            const potat = {};
            potat.numbar = Number(clear);
            const replysuccess = function(){
                message.reply(`${potat.numbar - 1} message(s) deleted successfully!`).then(msg => {
                    msg.delete(5000);
                });
            };
            if (1 == 1) {
                if (1 == 1) {
                    if (Number(clear) > 100) {
                        message.reply("The limit of messages being cleared is 100!");
                    } else {
                        const definitiveclear = potat.numbar;
                        let gotta = 0;
                        message.channel.fetchMessages({limit: definitiveclear}).then(messages=>{
                            Array.from(messages).map(v=>{
                                if (v[1].author.id == bot.user.id) {
                                    v[1].delete().catch(function(reason){message.reply(`\`${reason}\``);});
                                }
                            });
                        }).catch(function(reason){message.reply(`\`${reason}\``);});
                        message.reply("success, "+gotta+" messages deleted").then().catch(function(reason){message.reply(`\`${reason}\``);});
                    }
                } else {
                    message.reply("You do not have the permission `Manage Messages`!");
                }
            } else {
                if (1 == 1)
                    message.reply("I do not have the permission `Manage Messages`!");
                else
                    message.reply("Neither of us has the permission `Manage Messages`!");
            }
            } catch (err) {
                message.reply(err.message);
            }
        }*/
        if (/^\+setkey\s{1,4}.+$/i.test(input)) {
            const key = input.match(/^\+setkey\s{1,4}(.+)$/i)[1];
            if (!(publickeys[message.author.id])) {
                publickeys[message.author.id] = "";
                writeKeys();
            }
            message.channel.sendMessage("Generating public key, please wait...").then(msg=>{
                fullencrypt.getKey(key.toLowerCase()).then(keyz => {
                    publickeys[message.author.id] = keyz;
                    writeKeys();
                    msg.edit("Public key made ("+keyz+") and private key set ("+key+")! Public key is made to encrypt, while the Private is used to decrypt text that was encrypted with the associated public key!");
                }).catch(function(reason) {
                    msg.edit("Oh! An error happened. Please tell one of the bot's developers if you're confused about it! And the error is:\n`"+reason+"`");
                });
            });
        }
    }
 });


bot.login(saltandsugar); 
