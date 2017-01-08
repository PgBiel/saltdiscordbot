//jshint esversion: 6
'esversion:6';
let powernumber = 0;
var Discord = require("discord.js");
var bot = new Discord.Client({
    disableEveryone: true,
    disabledEvents: ["TYPING_START", "TYPING_STOP"],
});
String.prototype.getPage = function(pageNumber, count, regex, joinChar = ",") {
    var matched = this.match(regex);
    return matched.splice(--pageNumber * count, count).join(joinChar);
};
var fs = require("fs");
process.chdir("./Documents/Bot Stuff/Salt");
const config = require("./Game/config.json");
const pastebin = require("./Wrappers/aplet-pastebin.js");
const io = require("socket.io")(4004);
const dperms = require("jsdiscordperms");
const socket = require("socket.io-client")("http://localhost:4005");
socket.on("receivedsocket", data=>{
    console.log(data);
});
const crypto = require("crypto");
var saltandsugar = config.token;
admins = JSON.parse(fs.readFileSync("./Info/admins.json", "utf8"));
var servsr = JSON.parse(fs.readFileSync("./Info/serverthings.json", "utf8"));
const webhook = require("discord-webhooks");
const ytdl = require("ytdl-core");
let stats = require("./stats.json");
let volume = 1;
let shrugp = require("./Game/shrug.js");
let shrug = function(number, msg){return shrugp(number, msg, bot);};
//const prototypestuff = require("useful-prototypes");
//prototypestuff();
const streamOptions = { seek: 0, volume: 0 };
const ownerID = "180813971853410305";
const antitrigger = {};
const Jimp = require("jimp");
const request = require("request");
const requestp = require("request-promise");
const proto = require("./proto.js");
proto.load();
let twemoji = require("./testemoji.js").twemojib;
const fullencrypt = require("./Wrappers/fullencrypt.js");
const needle = require("needle");
const help = require("./help.js");
const mee6 = require("./Wrappers/mee6rank.js");
let jsarray = require("jsfuck");
jsarray = jsarray.JSFuck ? jsarray.JSFuck : jsarray;
let Trello = require("./Wrappers/aplet-trello.js").authenticate(config.trelloone, config.trellotwo);
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
quotes = require("./Game/quotes.json");
gamejs = require("./Game/game.json");
serverself = require("./Info/serverselfroles.json");
contacts = require("./Game/contact.json");
perms = require("./Info/servperms.json");
let permclass = require("./permlist.js");
permclass = new permclass();
let commandlist = permclass.cmdList;
var adminfilefordeletion = require("./Info/admins.json");
bot.on("debug", console.log);
bot.on("warn", console.log);
function sendencrypteddata(eventname, data) {
    let cipher = crypto.createCipher(config.crytype, config.cry);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    io.emit(eventname, encrypted);
}
function capitalize(string, splite = false) {
    return splite ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1);
}
function decapitalize(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}
String.prototype.mdclean = function(){
    return this.replace(/_*`~/g, "");
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
            if (object instanceof Array) object.splice(i, 1);
            else delete(object[1]);
        }
    }
    return object;
}
function writeServer() {
    fs.writeFileSync("./Info/serverthings.json", JSON.stringify(serverthings));
    serverthings = require("./Info/serverthings.json");
    sendencrypteddata("prefixupdate", JSON.stringify(serverthings));
}
function writeCmd() {
    fs.writeFileSync("./Info/servercommands.json", JSON.stringify(servercmds));
    servercmds = require("./Info/servercommands.json");
    sendencrypteddata("cmdupdate", JSON.stringify(servercmds));
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
function writePerms() {
    fs.writeFileSync("./Info/servperms.json", JSON.stringify(perms));
    perms = require("./Info/servperms.json");
    sendencrypteddata("permupdate", JSON.stringify(perms));
}
function writeStats() {
    fs.writeFileSync("./stats.json", JSON.stringify(stats));
    stats = require("./stats.json");
}
function writeQuotes() {
    fs.writeFileSync("./Game/quotes.json", JSON.stringify(quotes));
    quotes = require("./Game/quotes.json");
}
function muteGet(item, index) {
    foundmuted = item;
}
function sendPw() {
    request.post({
        uri: "https://bots.discord.pw/api/bots/244533925408538624/stats",
        headers: {
            "Authorization": config.authorization
        },
        json: {
            "server_count": String(bot.guilds.size)
        }
    }, (err, response, body)=>{
        if (!err && response.statusCode == 200) {
            console.log("Successfully sent data of "+bot.guilds.size+" servers to bots.discord.pw.");
        } else {
            console.error(`Error while sending data to bots.discord.pw of ${bot.guilds.size} servers: ${body.error || err}`);
        }
    });
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
                return [arr, arr.length || null];
            }
            else
                return [arr, arr.length || null];
        } else if (/^role$/i.test(type)) {
            let arr = [];
            let argregex = new RegExp(arg.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m), "i");
            guild.roles.map(v=>{
                if (argregex.test(v.name)) {
                    arr.push(v);
                }
            });

            return [arr, arr.length || null];
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
function toDate(datestring, mills = false) {
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
                return mills ? datetoadd.seconds + datetoadd.minutes + datetoadd.hours + datetoadd.days + datetoadd.weeks : thedate;
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
const actionLogs = function(messageid, channelid, serverid, action = "Unknown", authort = "Unknown", sufferet = "Unknown", usestime = false, time = null, reason = null, isdated = false) {
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
            value: `${isdated ? time : time.toString().replace(/-0\.\d+/g, "0")}`,
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
        if (powernumber === 0) {
            ++powernumber;
            writeCmd();
            writePerms();
            writeServer();
        }
        if (Number(bot.guilds.size) != stats.server_count) {
            stats.server_count = String(bot.guilds.size);
            writeStats();
            sendPw();
        }
    if (gamejs["game"] !== "") {
        bot.user.setGame(gamejs["game"]);
    }
    Array.from(bot.guilds).map(v=>{
        let guild = v[1];
        if (!(servermods[guild.id])) {
            servermods[guild.id] = {};
            servermods[guild.id].moderator = "";
            servermods[guild.id].administrator = "";
            servermods[guild.id].logs = "";
            servermods[guild.id].duelogs = {};
            writeMods();
        }
        if (servermods[guild.id].logs !== "") {
            if (!(v[1].channels.get(servermods[v[1].id].logs))) {
                servermods[v[1].id].logs = "";
                writeMods();
            }
        }
        if (guild.id in perms) {
            let gueldid = guild.id;
            if (guild.owner.id !== perms[gueldid].owner) {
                if (perms[gueldid].users[perms[gueldid].owner]) {
                    /*jshint ignore:start*/
                    delete perms[gueldid].users[perms[gueldid].owner]["*"] || undefined;
                    /*jshint ignore:end*/
                    perms[gueldid].owner = guild.owner.id;
                    //perms[gueldid].users[perms[gueldid].owner]["*"] = true;
                    writePerms();
                }
            }
        }
        if (guild.id in serverself) {
            for (let selfrole in serverself[guild.id]) {
                if (!(guild.roles.has(selfrole))) {
                    delete serverself[guild.id][selfrole];
                }
            }
            writeSelfRoles();
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
                        if (!(mutedmember.roles.get(servermutes[x]["muteRoleID"])) && mutedmember.guild.roles.has(servermutes[x].muteRoleID)) {
                            if (mutedmember.guild.roles.get(servermutes[x].muteRoleID).editable)
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
                if (bot.users.get(p)) bot.users.get(p).sendMessage(`<@${p}> BEEP! BEEP! You've asked me to remind you this:\n\`${userreminders[p].remind}\`!`);
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
        console.error("Error at somewhere between Ready(): "+e.message+(e.lineNumber?`\n(Line number: ${e.lineNumber})`:""));
    }
});
bot.on("guildUpdate", (oldguild, newguild)=>{
    let gueldid = newguild.id;
    if (oldguild.owner.id !== newguild.owner.id) {
        console.log("Oh.");
        if (gueldid in perms) {
            if (perms[gueldid].users[perms[gueldid].owner]) {
                /*jshint ignore:start*/
                delete perms[gueldid].users[perms[gueldid].owner]["*"] || undefined;
                /*jshint ignore:end*/
                perms[gueldid].owner = newguild.owner.id;
                //perms[gueldid].users[perms[gueldid].owner]["*"] = true;
                writePerms();
            }
        }
    }
});
bot.on("channelDelete", (channel) => {
    try {
        if (channel.type=="text" && channel.id) {
            let guild;
            Array.from(bot.guilds).map(v=>{
                if (v[1].channels.get(channel.id)) {
                    guild = v[0];
                }
            });
            if (servermods[guild].logs !== "")
                if (servermods[guild].logs == channel.id) {
                    servermods[guild].logs = "";
                    writeMods();
                }
        }
    } catch (err) {
        console.log(`So I was checking the channel stuff and...\n${err.message}`);
    }
});
bot.on("guildCreate", (guild) => {
    /*jshint sub:true*/
    sendPw();
    stats.server_count = bot.guilds.size;
    writeStats();
    guild.defaultChannel.sendMessage("Hello, I am Salt! A discord bot by PgSuper!\n\nFeel free to use me for whatever you like! My default prefix is `+`, but you can change that! Do +prefix (prefix) to change it!\n:warning: It will always be **+prefix**!\n\nIf you want to join my official server, here's the link! https://discord.gg/amQP9m3\n\nNote: Use `+contact` to contact bot devs and support! For example: `+contact Help! This doesn't work!`\n\nAlso, check out my advanced logging! Write `+logs`!", {split: {prepend: "_ _\n"}});
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
    perms[guildid] = {};
    perms[guildid].users = {};
    perms[guildid].roles = {};
    perms[guildid].owner = guild.owner.id;
    perms[guildid].disabled = {
        server: [],
        channels: {}
    };
    writePerms();
});
bot.on("guildDelete", (guild) => {
    /* jshint sub:true */
    sendPw();
    stats.server_count = bot.guilds.size;
    writeStats();
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
        //console.log(memberguild.id);
        var thetimeisnow = new Date().getTime();
        if (member.id !== "244533925408538624") {
            //console.log(memberguild.id);
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
            //console.log(memberguild.id);
            if (serverroles[memberguild.id] !== "" && memberguild.roles.get(serverroles[memberguild.id])) {
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
            if (/^i see\s*$/i.test(member.user.username) && member.guild.id == "245744417619705859") {
                member.ban();
                bot.channels.get("245746185606922241").sendMessage("Good riddance.");
            }
            if (servermsgs[memberguild.id].welcome.name)
                if (memberguild.member(bot.user).hasPermission("MANAGE_NICKNAMES") && member.highestRole !== memberguild.member(bot.user).highestRole)
                    member.setNickname(servermsgs[memberguild.id].welcome.name.replace(/\{name\}/ig, member.user.username));

        }
    } catch (err) {
        console.log("Error while doing welcome message at guild \"" + member.guild.name + "\":\n" + err);
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
    shrug(2, message);
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
    const disabledreply = function(pt) {message.reply(":lock: That command has been disabled for this "+pt+"!");};
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
    if (!(message.guild.id in servercmds)) {
        servercmds[gueldid] = {};
        writeCmd();
        console.log("Automatically registered guild \"" + message.guild.name + "\" in commands json!");
    }
    if (!(message.guild.id in servermsgs)) {
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
    if (!(message.guild.id in serverroles)) {
        serverroles[gueldid] = "";
        writeRoles();
        console.log("Automatically registered guild \"" + message.guild.name + "\" in roles json!");
    }
    if (!(gueldid in servermutes)) {
        servermutes[gueldid] = {};
        servermutes[gueldid]["muteRoleID"] = "";
        servermutes[gueldid]["mutes"] = {};
        writeMutes();
        console.log("Automatically registered guild \"" + message.guild.name + "\" in mutes json!");
    }
    if (!(gueldid in serverdetects)) {
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
    if (!(gueldid in perms)) {
        perms[gueldid] = {};
        perms[gueldid].users = {};
        perms[gueldid].roles = {};
        perms[gueldid].owner = message.guild.owner.id;
        perms[gueldid].disabled = {
            server: [],
            channels: {}
        };
        writePerms();
        console.log(`Automatically registered guild "${message.guild.name}" in perms json!`);
    }
    if (message.author.id == message.guild.owner.id) {
        if (perms[gueldid].users){
            if (!perms[gueldid].users[message.author.id]) {
                perms[gueldid].users[message.author.id] = {};
                writePerms();
            }
        }
    }
    if (message.guild.owner.id !== perms[gueldid].owner) {
        perms[gueldid].owner = message.guild.owner.id;
        writePerms();
    }
    const checkperm = function(node, returnarr = true, author = message.member) {
        return returnarr ? permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id) : (typeof (permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id)) == "string" ? permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id) : permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id)[0]);
    };
    var prefixcase = prefix.toUpperCase();
    if (upparcaso.startsWith(prefixcase) || /^<@!?244533925408538624>\s?/i.test(upparcaso)) {
    var preprefix = prefix.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m);
    var instructionregex = ("^" + preprefix);
    var instructionregexp = new RegExp(instructionregex, "i");
    var instruction = input.replace(instructionregexp, "");
    if (/^<@!?244533925408538624>\s?/i.test(upparcaso))
        instruction = instruction.replace(/^<@!?244533925408538624>\s?/i, "");
    var instructioncase = instruction.toUpperCase();
    if (/^avatar(?:\s{1,4}[^]*)?$/i.test(instruction)) {
        let p = checkperm("global.avatar");
        //console.log(p);LO
        if (!p[0]) return message.reply("Missing permission node: `global.avatar`");
        if (p[2]) return message.reply(`:lock: This command is disabled for this ${p[2]}!`);
        if (typeof p[0] == "string") return [console.error("Error at perm checking of avatar: "+p), message.reply("Erm, an error happened. Sorry! The devs have been notified.")][1];
        if (instruction.match(/^avatar\s{1,4}(<@!?\d+>)$/i)) {
            let user;
            user = instruction.match(/^avatar\s{1,4}<@!?(\d+)>$/i)[1];
            if (!bot.users.get(user)) return message.reply("User not found!");
            user = bot.users.get(user.toString());
            let embed = new Discord.RichEmbed();
            let avatar = /^(?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpg|png)\?size=\d+$/.test(user.avatarURL||"hi")?(user.avatarURL.match(/^((?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpg|png))\?size=\d+$/)[1]):(user.avatarURL||user.defaultAvatarURL);
            embed.setAuthor(`${user.username}#${user.discriminator}'s Avatar`, undefined, avatar)
                .setImage(avatar)
                .setFooter(`ID: ${user.id}`);
            chanel.sendEmbed(embed).then(m=>{
                if (!m) message.reply("I cannot send embeds here :(");
            });
            //message.channel.sendFile(user.avatarURL ? user.avatarURL : "http://a5.mzstatic.com/us/r30/Purple71/v4/5c/ed/29/5ced295c-4f7c-1cf6-57db-e4e07e0194fc/icon175x175.jpeg", "avatar.jpg");
        //} else if (/^avatar\s{1,4}[^]+$/i.test(instruction)) {
        } else if (/^avatar\s{1,4}[^]+$/i.test(instruction)) {
            let user;
            let usersearch = instruction.match(/^avatar\s{1,4}([^]+)$/i)[1];
            message.guild.members.map(m=>{
                if (m.user.username == usersearch) user = m.user;
            });
            let found;
            if (!user) {
                found = search("user", usersearch, message.guild);
                if (!found[1]) return message.reply("User not found!");
                user = found[0][0];
            }
            let embed = new Discord.RichEmbed();
            let avatar = /^(?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpg|png)\?size=\d+$/.test(user.avatarURL||"hi")?(user.avatarURL.match(/^((?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpg|png))\?size=\d+$/)[1]):(user.avatarURL||user.defaultAvatarURL);
            embed.setAuthor(`${user.username}#${user.discriminator}'s Avatar`, undefined, avatar)
                .setImage(avatar)
                .setFooter(`ID: ${user.id}`);
            chanel.sendEmbed(embed, found?(found[1]>1?`${found[1]} users found on search, using first find.`:undefined):undefined).then(m=>{
                if (!m) message.reply("I cannot send embeds here :(");
            });
        } else {
            let embed = new Discord.RichEmbed();
            let user = message.author;
            let avatar = /^(?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpg|png)\?size=\d+$/.test(user.avatarURL||"hi")?(user.avatarURL.match(/^((?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpg|png))\?size=\d+$/)[1]):(user.avatarURL||user.defaultAvatarURL);
            embed.setAuthor(`${user.username}#${user.discriminator}'s Avatar`, undefined, avatar)
                .setImage(avatar)
                .setFooter(`ID: ${user.id}`);
            chanel.sendEmbed(embed).then(m=>{
                if (!m) message.reply("I cannot send embeds here :(");
            });
            //message.channel.sendFile(message.author.avatarURL ? message.author.avatarURL : "http://a5.mzstatic.com/us/r30/Purple71/v4/5c/ed/29/5ced295c-4f7c-1cf6-57db-e4e07e0194fc/icon175x175.jpeg", "avatar.jpg");
        }
    }
    try {
    if (/^manage\s(.+?)(\s[^]+)?$/i.test(instruction)) {
        if (message.author.id == ownerID||(message.author.id == "201765854990434304")) {
            var command = instruction.match(/^manage\s(.+?)(\s(?:[^]+))?$/i)[1];
            var argument = instruction.match(/^manage\s.+?\s(([^]+)?)?$/i) ? (instruction.match(/^manage\s.+?\s(([^]+)?)?$/i)[1]).replace(/^ +$/, "") : null;
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
                    if (!(message.guild.id in serverthings)) {
                        var createguildthingstwo = "+";
                        var guildidtwo = message.guild.id;
                        serverthings[(guildidtwo)] = createguildthingstwo;
                        fs.writeFileSync("./Info/serverthings.json", JSON.stringify(serverthings));
                        serverthings = require ("./Info/serverthings.json");
                        message.reply(":thumbsup::skin-tone-2:");
                    }
                    if (!(message.guild.id in servercmds)) {
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
                if (argument === null && argument === undefined && argument === "") {
                    message.reply("trains");
                } else {
                    var argchannel = argument.match(/^(.+?)\s(?:[^]+)$/i)[1];
                    var argmessage = argument.match(/^(?:.+?)\s(.+)[^]*$/i)[1];
                    if (bot.channels.get(argchannel)) {
                        var channelfound = bot.channels.get(argchannel);
                        channelfound.sendMessage(argmessage);
                        message.reply("Message sent at the channel #" + channelfound.name + "!");
                    }
                }
            }
            if (/^addquote$/i.test(command)) {
                if (!argument) return message.reply("Apparently you forgot the argument. Wew.");
                if (!(/^"[^]+"\s{1,4}(?:\d+|<@!?\d+>)[^]*$/i.test(argument)) && !(/^\d+(?:\s{1,4}\d+)?/i.test(argument)) && !(/^"[^]+"\s{1,4}.+#\d+/i.test(argument))) return message.reply("Wrong usage! Syntax: \n1. Set quote: `\"quote goes here\" <author>` - Replace <author> by either their ID or name#discrim.\n2. From message: `<Msg Id> <Channel Id (optional)>`");
                let addquote = function(quote, author) {
                    if (!quote || !author) throw new SyntaxError("Missing quote or author. (addquote manage)");
                    if (typeof quote !== "string") throw new TypeError("Quote must be a string. (addquote manage)");
                    if (typeof author !== "object") throw new TypeError("Author must be an object (and user!!). (addquote manage)");
                    if (!(author instanceof Discord.User) && !(author instanceof Discord.GuildMember)) throw new TypeError("Author must be an User object (or GuildMember). (addquote manage)");
                    quotes.push({quote, author: {id: author.id, name: author.username, discriminator: author.discriminator}});
                    writeQuotes();
                    return "Success!";
                };
                if (/^\d+(?:\s{1,4}\d+)?$/.test(argument)) {
                    let msgid = argument.match(/^(\d+)(?:\s{1,4}\d+)?$/)[1];
                    let channelid = argument.match(/^\d+\s{1,4}(\d+)?$/)||undefined;
                    if (channelid) channelid = channelid[1];
                    if (channelid) {
                        if (!(bot.channels.has(channelid))) return message.reply("Channel not found!");
                        let channel = bot.channels.get(channelid);
                        let msg;
                        chanel.fetchMessage(msgid).then(m=>{
                            msg = m;
                            if (!msg) return message.reply("Message not found!");
                            addquote(msg.content, msg.author);
                            message.reply("Success!");
                        }).catch(err=>message.reply("Message not found!"));
                    }
                } else if (/^"[^]+"\s{1,4}(?:\d+|<@!?\d+>)$/i.test(argument)) {
                    let daid = argument.match(/^"[^]+"\s{1,4}(\d+|<@!?\d+>)$/i)[1];
                    if (/^<@!?\d+>$/i.test(daid)) daid = daid.match(/^<@!?(\d+)>$/)[1];
                    let user = bot.users.get(daid);
                    if (!user) return message.reply("User not found!");
                    let quote = argument.match(/^"([^]+)"/i)[1];
                    addquote(quote, user);
                    message.reply("Success!");
                } else {
                    message.reply("uh no use ids you lazy boi");
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
                        let beforealllife = ("true");
                        let key = JSON.parse(beforealllife);
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
        let p = checkperm("global.info.channels");
        if (p[2] && !(/^(?:bot|stats)$/i.test(ireq))) return disabledreply(p[2]);
        if (/^channels$/i.test(ireq)) {
            if (!p[0]) return message.reply("Missing permission node `global.info.channels`!");
            if (ireq !== null && ireq !== undefined && ireq !== "") {
                message.reply("Information has been sent by PM!");
                var chanelstosend = message.guild.channels.filter(v => v.type === "text").map(v=>"#"+v.name).join` | `;
                message.author.sendMessage("**Channels in server *" + message.guild.name + "*:**\n" + chanelstosend + "\n\n**===========================================**", {split: true});
            }
        }
        if (/^roles$/i.test(ireq)) {
            let p = checkperm("global.info.roles");
            if (!p[0]) return message.reply("Missing permission node `global.info.roles`!");
            if (ireq !== null && ireq !== undefined && ireq !== "") {
                message.reply("Information has been sent by PM!");
                var rolestosend = Array.from(message.guild.roles).map(v=>v[1]).sort((a,b)=>b.position-a.position).map(v=>v.name).join`, `;
                message.author.sendMessage("**Roles in server *" + message.guild.name + "*:**\n" + rolestosend + ".\n\n**===========================================**", {split: true});
            }
        }
        if (/^(?:usersamount|members)$/i.test(ireq)) {
            let p = checkperm("global.info.members");
            if (!p[0]) return message.reply("Missing permission node `global.info.members`!");
            if (ireq !== null && ireq !== undefined && ireq !== "") {
                message.reply("The current amount of users in this server is **" + message.guild.memberCount + "**!");
            }
        }
        if (/^(generalinfo|server)$/i.test(ireq)) {
            let p = checkperm("global.info.server");
            if (!p[0]) return message.reply("Missing permission node `global.info.server`!");
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
            let p = checkperm("global.info.amountusersonrole");
            if (!p[0]) return message.reply("Missing permission node `global.info.amountusersonrole`!");
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
                let p = checkperm("global.info.user");
                if (!p[0]) return message.reply("Missing permission node `global.info.user`!");
                chanel.sendMessage("Fetching data, please wait...").then(msg => {
                    const embedz = function(user, member, stuffs = null){
                        const avatarURL = user.avatarURL || user.defaultAvatarURL;
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
            let p = checkperm("global.info.amush");
            if (!p[0]) return message.reply("Missing permission node `global.info.amush`!");
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
            for (var iteratorr = message.guild.members.entries(), vall = iteratorr.next(), highrolecount = 0; vall.done === false; vall = iteratorr.next()) { //eslint-disable-line no-redeclare
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
            let p = checkperm("global.info.amush");
            if (!p[0]) return message.reply("Missing permission node `global.info.amush`!");
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
            for (var iteratorrr = message.guild.members.entries(), valll = iteratorrr.next(), highrolecountt = 0; valll.done === false; valll = iteratorrr.next()) {//eslint-disable-line no-redeclare
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
                let p = checkperm("global.info.role");
            if (!p[0]) return message.reply("Missing permission node `global.info.role`!");
                stillbeingmatched = ireq.match(/^role\s{1,4}(.+)$/i)[1];
                let stuffs = false;
                if (stillbeingmatched == "{everyone}") stillbeingmatched = "@everyone";
                let role;
                for (var iteratorr = message.guild.roles.entries(), vall = iteratorr.next(); vall.done === false; vall = iteratorr.next()) {//eslint-disable-line no-redeclare
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
                if (Number(role.members.size) < 51 && Number(role.members.size) !== 0) Array.from(role.members).map(v=>{
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
                        name: Number(role.members.size) > 50 ? "Member Amount" : `Members (${role.members.size})`,
                        value: Number(role.members.size) > 50 ? (role.members.size == message.guild.memberCount ? "Everyone" : role.members.size) : (arr ? arr.join(", ") : "Nobody"),
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
                let p = checkperm("global.info.channel");
            if (!p[0]) return message.reply("Missing permission node `global.info.channel`!");
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
                        for (var iteratorr = message.guild.channels.filter(v=>v.type=="voice").entries(), vall = iteratorr.next(); vall.done === false; vall = iteratorr.next()) {//eslint-disable-line no-redeclare
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
            let p = checkperm("global.info.bot");
            //if (!p[0]) return message.reply("Missing permission node `global.info.bot`!");
            let uptime = Math.floor(bot.uptime / 1000);
            let uptimemins = uptime / 60 >= 1 ? Math.floor(uptime / 60) : 0;
            let uptimehours = uptimemins / 60 >= 1 ? Math.floor(uptimemins / 60) : 0;
            let uptimedays = uptimehours / 24 >= 1 ? Math.floor(uptimehours / 60) : 0;
            let daembed = {
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
            };
            if (!p[0] || p[2]) {
                bot.rest.methods.sendMessage(message.author, "", {embed: daembed}).then(()=>message.reply("Sent bot info on DMs!")).catch(err=>message.reply("Could not send DM about bot info (Check if you blocked me)!"));
            } else
                chanel.sendMessage("", {embed: daembed});
            }
        } catch(err) {
            message.reply("An error was found! Sorry.");
            console.error("Error at info bot:\n"+err.message);
        }
    }
    if (/^info$/i.test(instruction)) {
        message.reply("This is a command that can show you information. Available commands are:\n`" + prefix + "info channels`\n`" + prefix + "info roles`\n`" + prefix + "info members`\n`" + prefix + "info server`\n`" + prefix + "info amountusersonrole <role name>`\n`" + prefix + "info user [user to get info (not required)]`\n`" + prefix + "info amountusersonhighrole(or amush) <role name to check users in it that it is their highest>`\n`"+prefix+"info role rolename`\n`"+prefix+"info channel #channel` <- TIP: Use &channel to look for voice channels!\n`"+prefix+"info bot`");
    }
    if (/^command\s(.+?)\s[^]+$/i.test(instruction)) {
    let p = checkperm("global.command");
    if (!p[0] && !p[1]) return message.reply("Missing permission node `global.command`!");
    if (p[2]) return disabledreply(p[2]);
    if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.command`! Could also use this command by having the permission `Manage Server`.");
        try {
            var cmdtrigger = instructioncase.match(/^command\s(.+?)\s[^]+$/i)[1];
            var cmdtext = instruction.match(/^command\s(?:.+?)\s([^]+)$/i)[1];
            let superregexp = new RegExp(`^(${permclass.cmdList.join("|")})(_|$)`, "i");
            if (superregexp.test(cmdtrigger)) {
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
    //} else {
        //message.reply("I'm sorry, but you don't have the permission `Manage Server`!");
    //} // End of the "else"
    } // End of the command "command"
    if (/^command$/i.test(instruction)) {
        message.reply("This command allows you to set custom commands for your server! They can only send text, but you can simulate arguments by adding underscores into the command name! Once you do an underscore, it is replaced by a space! Cool, isn't it?\nHowever, you need the permission `Manage Server` to edit commands!\n\nP.S: To delete commands write `" + prefix + "delcommand <command name>`! And, if the command name has spaces, to delete it write spaces, and not underscores!");
    }
    if (instructioncase in servercmds[gueldid]) {
        let p = checkperm(`custom.${instructioncase.toLowerCase().replace(/\s/g, "_")}`);
        if (!p[0] && !p[1]) return message.reply("Missing permission node `custom."+instructioncase.replace(/\s/g, "_")+"`!");
        if (p[2]) return disabledreply(p[2]);
        chanel.sendMessage("\u200B" + servercmds[gueldid][instructioncase]);
    }
    if (/^help(\s{1,4}.+)?$/i.test(instruction)) {
        if (!(instruction.match(/^help\s{1,4}(.+)$/i))) return chanel.sendMessage("```"+prefix+"help -> Sends help to PMs.\n\nAvailable options:\n- "+prefix+"help all\n- "+prefix+"help moderation\n- "+prefix+"help administration\n- "+prefix+"help fun\n- "+prefix+"help utility\n- "+prefix+"help automation\n- "+prefix+"help salt-related```");
        let h = instruction.match(/^help\s{1,4}(.+)$/i)[1];
        if (!(help.helps[h.toLowerCase().replace(/salt-related/i, "saltrelated")]) && h.toLowerCase() !== "all") return chanel.sendMessage("```"+prefix+"help -> Sends help to PMs.\n\nAvailable options:\n- "+prefix+"help all\n- "+prefix+"help moderation\n- "+prefix+"help administration\n- "+prefix+"help fun\n- "+prefix+"help utility\n- "+prefix+"help automation\n- "+prefix+"help salt-related```");
        h = h.toLowerCase();
        console.log(h);
        if (h == "all") {
            return message.reply("Sorry but there is a bug with +help all, do all categories instead :( Will be fixed soon.");
            /*message.author.sendMessage(help.helps.moderation.replace(/↪/g, "\↪"), {split: {prepend: "_ _\n"}});//.then(v=>{
                message.author.sendMessage(help.helps.administration.replace(/↪/g, "\↪"), {split: {prepend: "_ _\n"}});//.then(b=>{
                    message.author.sendMessage(help.helps.fun.replace(/↪/g, "\↪"), {split: {prepend: "_ _\n"}});//.then(c=>{
                        message.author.sendMessage(help.helps.utility.replace(/↪/g, "\↪"), {split: {prepend: "_ _\n"}});//.then(a=>{
                            message.author.sendMessage(help.helps.automation.replace(/↪/g, "\↪"), {split: {prepend: "_ _\n"}});//.then(n=>{
                                message.author.sendMessage(help.helps.saltrelated.replace(/↪/g, "\↪"), {split: {prepend: "_ _\n"}});//.then(()=>{
                                    message.author.sendMessage("\nCurrent prefix for the server you sent help from: `"+prefix+"`\n**============================**");
                                //});
                            //);
                        //});
                    //});
                //});
            //});*/
        } else {
            message.author.sendMessage(help.helps[h.replace(/salt-related/i, "saltrelated")], help.functions.splitter).then(()=>{
                message.author.sendMessage("\nCurrent prefix for the server you sent help from: `"+prefix+"`\n**============================**");
            });
        }
        message.reply("Help has been sent to your Private Messages!");
    }
    if (/^delcommand\s(.+)$/i.test(instruction)) {
        let p = checkperm("global.delcommand");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.delcommand`!");
        if (p[2]) return disabledreply(p[2]);
        var cmdtodelete = instructioncase.match(/^delcommand\s(.+)$/i)[1];
        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.delcommand`! Could also use this command by having the permission `Manage Server`."); 
            if (cmdtodelete in servercmds[gueldid]) {
                delete servercmds[gueldid][cmdtodelete];
                writeCmd();
                message.reply("Custom command \"" + cmdtodelete.toLowerCase() + "\" deleted successfully!");
            } else {
                message.reply("That is not a custom command of this server!");
            }
        //} else {
            //message.reply("I'm sorry, but you don't have the `Manage Server` permission!");
        //}
    }
    if (/^ban\s+<@!?\d+>(?:\s+[^]+)?$/i.test(instruction)) {
        try {
        let p = checkperm("global.ban");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.ban`!");
        if (p[2]) return disabledreply(p[2]);
        var fetchclientban = message.guild.members.get(bot.user.id);
        const binfo = {};
        if (instruction.match(/^ban\s+<@!?\d+>\s+([^]+)$/i))
            binfo.reason = instruction.match(/^ban\s+<@!?\d+>\s+([^]+)$/i)[1];
        else
            binfo.reason = "None";
        if (fetchclientban.hasPermission("BAN_MEMBERS")) {
            if (!(message.member.hasPermission("BAN_MEMBERS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.ban`! Could also use this command by having the permission `Ban Members`.");
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
                                let reasonembed = new Discord.RichEmbed();
                                reasonembed.setDescription(binfo.reason||"None");
                                let timeoutz = setTimeout(()=>usertoban.ban(1), 2600);
                                usertoban.user.send("You were banned at the server **"+message.guild.name.mdclean()+"** with the reason of:", {embed: reasonembed}).then(()=>{
                                    if (!timeoutz._called) {
                                        usertoban.ban(1);
                                        clearTimeout(timeoutz);
                                    }
                                });
                                message.reply("User banned successfully!");
                                if (servermods[gueldid].logs !== "")
                                    message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: actionLogs(0, 1, gueldid, "banned", message.author, usertoban.user, false, 1, binfo.reason)[0]});
                            }
                        }
                    }
                } else {
                    message.reply("Nobody is mentioned! You need to mention who to ban!");
                }
            //} else {
                //message.reply("You do not have the permission `Ban Members`!");
            //}
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
        let p = checkperm("global.listcommands");
        if (!p[0]) return message.reply("Missing permission `global.listcommands`!");
        if (p[2]) return disabledreply(p[2]);
        var commandlistthings = Object.keys(servercmds[gueldid]).join("\n• ").toLowerCase();
        message.reply("The list of custom commands has been sent to your Private Messages!");
        message.author.sendMessage("***Custom commands for guild \"" + message.guild.name + "\":***\n• " + commandlistthings + "\n\n**===========================================**");
    }
    if (/^kick\s+<@!?\d+>(?:\s+[^]+)?$/i.test(instruction)) {
        try {
        let p = checkperm("global.kick");
        if (!p[0] && !p[1]) return message.reply("Missing permission `global.kick`!");
        if (p[2]) return disabledreply(p[2]);
        var fetchclientkick = message.guild.members.get(bot.user.id);
        const kinfo = {};
        if (instruction.match(/^kick\s+<@!?\d+>\s+([^]+)$/i))
            kinfo.reason = instruction.match(/^kick\s+<@!?\d+>\s+([^]+)$/i)[1];
        else
            kinfo.reason = "None";
        if (fetchclientkick.hasPermission("KICK_MEMBERS")) {
            if (!(message.member.hasPermission("KICK_MEMBERS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission `global.kick`! Could also use this command by having the permission `Kick Members`.");
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
            //} else {
                //message.reply("You do not have the permission `Kick Members`!");
            //}
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
    if (/^welcfarew\s(?:.+?)(?:\s(?:.+))?$/i.test(instruction)) {
        /* jshint sub:true */
        try {
            //if (message.member.hasPermission("MANAGE_GUILD") || message.author.id == ownerID) {
                let p = checkperm("global.welcfarew.welcome.message");
                if (p[2]) return disabledreply(p[2]);
                var welcommand = instruction.match(/^welcfarew\s(.+?)(?:\s(?:.+))?$/i)[1];
                var welmessage = instruction.match(/^welcfarew\s(?:.+?)\s(.+)$/i)||null;
                if (welmessage)welmessage=welmessage[1];
                if (/^(?:disablewelcome|disablewelc)$/i.test(welcommand)){
                    let p = checkperm("global.welcfarew.welcome.disable");
                    if (!p[0] && !p[1]) return message.reply("Missing permission node `global.welcfarew.welcome.disable`!");
                    if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.welcfarew.welcome.disable`! Could also use this command by having the permission `Manage Server`.");
                    if (!(servermsgs[gueldid]["welcome"]["message"])) return message.reply("Welcome message is not enabled!");
                    servermsgs[gueldid]["welcome"]["message"] = "";
                    writeMsg();
                    message.reply("Welcome message disabled successfully! To re-enable, just set a new welcome message!");
                } else if (/^(?:disablefarewell|disablefarew)$/i.test(welcommand)) {
                    let p = checkperm("global.welcfarew.farewell.disable");
                    if (!p[0] && !p[1]) return message.reply("Missing permission node `global.welcfarew.farewell.disable`!");
                    if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.welcfarew.farewell.disable`! Could also use this command by having the permission `Manage Server`.");
                    if (!(servermsgs[gueldid]["goodbye"]["message"])) return message.reply("Farewell message is not enabled!");
                    servermsgs[gueldid]["goodbye"]["message"] = "";
                    writeMsg();
                    message.reply("Farewell message disabled successfully! To re-enable, just set a new farewell message!");
                } else if (/^welcome$/i.test(welcommand)) {
                    if (!welmessage) return message.reply("You must put something to be the message (or #channel)!");
                    if (/^<#([0-9])+>$/i.test(welmessage) && message.guild.channels.get(welmessage.replace(/[<#>]/ig, ""))) {
                        let p = checkperm("global.welcfarew.welcome.channel");
                        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.welcfarew.welcome.channel`!");
                        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.welcfarew.welcome.channel`! Could also use this command by having the permission `Manage Server`.");
                        servermsgs[gueldid]["welcome"]["channel"] = message.guild.channels.get(welmessage.replace(/[<#>]/ig, "")).id;
                        writeMsg();
                        message.reply("Welcome message channel set to " + welmessage + "!");
                    } else {
                        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.welcfarew.welcome.message`!");
                        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.welcfarew.welcome.message`! Could also use this command by having the permission `Manage Server`.");
                        servermsgs[gueldid]["welcome"]["message"] = welmessage;
                        writeMsg();
                        message.reply("Welcome message set!");
                        console.log(welmessage);
                    }
                } else if (/^farewell$/i.test(welcommand) || (/^goodbye$/i.test(welcommand))) {
                    if (!welmessage) return message.reply("You must put something to be the message (or #channel)!");
                    if (/^<#([0-9])+>$/i.test(welmessage) && message.guild.channels.get(welmessage.replace(/[<#>]/ig, ""))) {
                        let p = checkperm("global.welcfarew.farewell.channel");
                        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.welcfarew.farewell.channel`!");
                        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.welcfarew.farewell.channel`! Could also use this command by having the permission `Manage Server`.");
                        servermsgs[gueldid]["goodbye"]["channel"] = message.guild.channels.get(welmessage.replace(/[<#>]/ig, "")).id;
                        writeMsg();
                        message.reply("Farewell message channel set to " + welmessage + "!");
                    } else {
                        let p = checkperm("global.welcfarew.farewell.message");
                        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.welcfarew.farewell.message`!");
                        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.welcfarew.farewell.message`! Could also use this command by having the permission `Manage Server`.");
                        servermsgs[gueldid]["goodbye"]["message"] = welmessage;
                        writeMsg();
                        message.reply("Farewell message set!");
                    }
                }
            //} else {
                //message.reply("You need the permission `Manage Server` to do this command!");
            //}
        } catch (err) {
            message.reply("An error happened!");
            console.log("Error while doing welcome/farewell:\n" + err.message);
        }
    }
    if (/^welcfarew$/i.test(instruction)) {
        message.reply("`" + prefix + "welcfarew {welcome/farewell/disablewelcome/disablefarewell} {if option was welcome or farewell, message (or channel to set the channel where the message is sent)}`\n\nSets the message for members joining or leaving. {member} is replaced with the user mention.\n**Note:** If a channel is written in the message spot, it sets the channel of where the message is sent.\n**REQUIRES `Manage Server` PERMISSION**");
    }
    if (/^autorole\s(.+)$/i.test(instruction)) {
        let p = checkperm("global.autorole");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.autorole`!");
        if (p[2]) return disabledreply(p[2]);
        autoroletomatch = instruction.match(/^autorole\s(.+)$/i)[1];
        if (autoroletomatch !== undefined) {
            /* jshint -W080 */
            for(var iterator = message.guild.roles.entries(),val = iterator.next(),autorolematch = undefined; val.done === false; val = iterator.next()) {//eslint-disable-line no-redeclare
                if(autoroletomatch.toUpperCase() === val.value[1].name.toUpperCase()) {
                    autorolematch = val.value[1];
                }
            }
            /* jshint +W080 */
            if (autorolematch !== null && autorolematch !== undefined) {
                if (message.guild.members.get(bot.user.id).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                    if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.autorole`! Could also use this command by having `Manage Roles` permission.");
                        if (message.guild.roles.get(autorolematch.id)) {
                            serverroles[gueldid] = autorolematch.id;
                            writeRoles();
                            message.reply("Autorole (role given on join) set! Remember, that I must have the permission `Manage Roles`!");
                        } else {
                            message.reply("That role doesn't exist!");
                        }
                    //} else {
                        //message.reply("You do not have the permission `Manage Roles`!");
                    //}
                } else {
                    //if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID) {
                        message.reply("I do not have the permission `Manage Roles`!");
                    //} else {
                        //message.reply("Neither of us has the permission `Manage Roles`!");
                    //}
                }
            }
        }    
    }
    if (/^delautorole$/i.test(instruction)) {
        let p = checkperm("global.delautorole");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.delautorole`!");
        if (p[2]) return disabledreply(p[2]);
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.delautorole`! Could also use this command by having the permission `Manage Roles`.");
            if (serverroles[gueldid] === "") {
                message.reply("This server doesn't have an autorole!");
            } else {
                serverroles[gueldid] = "";
                writeRoles();
                message.reply("Autorole deleted successfully!");
            }
       // } else {
           // if (serverroles[gueldid] === "") {
              //  message.reply("This server doesn't have an autorole nor do you have the permission `Manage Roles`!");
            //}else {
              //  message.reply("You do not have the permission `Manage Roles`!");
            //}
        //}
    }
    if (/^mute\s{1,4}<@!?\d+>(?:\s{1,4}(?:\d+|"(?:\w+|[\w\s]+)")(?:\s{1,4}.+)?)?$/i.test(instruction)) {
        /* jshint sub:true */
        try {
        const p = checkperm("global.mute");
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && !(checkmodrole(message.member)) && p[1]) return message.reply("Missing permission node `global.mute`! Could also use this command by having permission `Manage Roles` or the _Moderator Role_ (for Salt).");
        if (!(p[0]) && !(p[1])) return message.reply("Missing permission node `global.mute`!");
        if (p[2]) return message.reply(":lock: That command has been disabled for this "+p[2]+"!");
        var notimespec = false;
        //var argbase = instruction.match(/^mute\s+(.+)$/i)[1];
        let argname = instruction.match(/^mute\s{1,4}<@!?(\d+)>(?:\s{1,4}(?:\d+|"(?:\w+|[\w\s]+)")(?:\s{1,4}.+)?)?$/i)[1]; // argbase.match(/^(.+?)\s(?:.+)$/i)[1];
        console.log(argname);
        argname = bot.users.get(argname.toString());
        console.log(argname);
        let isdated = false;
        if (!argname) return message.reply("User not found!");
        if (instruction.match(/^mute\s+<@!?\d+>\s+?(\d+|"(?:\w+|[\w\s]+)")?(?:\s{1,4}.+)?$/i)) {
            argtime = instruction.match(/^mute\s+<@!?\d+>\s+?(\d+|"(?:\w+|[\w\s]+)")?(?:\s{1,4}.+)?$/i)[1];
            if (instruction.match(/^mute\s+<@!?\d+>\s+?(?:\d+|"(\w+|[\w\s]+)")?(?:\s{1,4}.+)?$/i)) {
                isdated = true;
            }
        } else {
            argtime = "";
        }
        const muteobj = {};
        muteobj.reason = instruction.match(/^mute\s{1,4}<@!?\d+>(?:\s{1,4}(?:\d+|"(?:\w+|[\w\s]+)")(\s{1,4}.+))?$/i) ? instruction.match(/^mute\s{1,4}<@!?\d+>(?:\s{1,4}(?:\d+|"(?:\w+|[\w\s]+)")(\s{1,4}.+))?$/i)[1] : "None";
        var botmember = message.guild.members.get(bot.user.id);
        if (!(botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) || !(botmember.hasPermission("MANAGE_CHANNELS"))) return message.reply("Make sure I have both permission Manage Roles and Manage Channels!");
        if (argtime === null || argtime === undefined || argtime === "") {
            argtime = 10;
            var notimespec = true;//eslint-disable-line no-redeclare
        }
        let dated;
        if (isdated === true) {
            if (/^(?:"\d+"|\d+)$/.test(argtime)) {
                argtime = String(argtime).replace(/"/g, "");
                isdated = false;
            } else {
                dated = toDate(String(argtime).replace(/"/g, ""), true);
                if (dated == "Invalid Date String") return message.reply("Invalid date string (text between the \"\"s)! Format: `?w ?d ?h ?m ?s`.\nExample: `"+prefix+"mute @guy#0000 \"5h 1m 2s\" spam`");
                if (dated == "All zeros") {
                    isdated = false;
                    argtime = 0;
                }
            }
        }
        //if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID || checkmodrole(message.member) === true) {
            //if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                //if (botmember.hasPermission("MANAGE_CHANNELS")) {
                    if (message.guild.roles.find("name", "SaltMuted") && message.guild.roles.get(servermutes[gueldid]["muteRoleID"])) {
                        if (/*argname.id == ownerID || */argname.id == "244533925408538624") {
                            message.reply("***NO***");
                        } else {
                            if (argname.id in servermutes[gueldid]["mutes"]) {
                                message.reply("That user is already muted!");
                            } else {
                                servermutes[gueldid]["mutes"][argname.id] = {};
                                servermutes[gueldid]["mutes"][argname.id]["id"] = argname.id;
                                if (isdated === true)
                                    servermutes[gueldid]["mutes"][argname.id]["expire"] = new Date().getTime()+dated;
                                else
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
                                    if (isdated === true) {
                                        message.reply(`User muted successfully for **${String(argtime).replace(/"/g, "")}**!`);
                                    } else {
                                        if (argtime == "1" || argtime == 1) 
                                            message.reply(`User muted successfully for **1 minute**!`);
                                        else
                                            message.reply(`User muted successfully for **${argtime} minutes**!`);
                                    }
                                }
                                const timer = `${diffsecos === 0 ? `${diffmins} minutes` : diffsecos % 60 === 0 ? `${Math.floor(diffmins)+(diffsecos/60)} minute(s)` : `${Math.floor(diffmins)} minutes and ${diffsecos} seconds`}`;
                                if (servermods[gueldid].logs !== "") {
                                    const a = actionLogs(0, chanel.id, gueldid, "muted", message.author.toString(), argname.toString(), true, isdated ? argtime.replace(/"/g, "") : timer, muteobj.reason, isdated);
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
                                    if (isdated === true)
                                        servermutes[gueldid]["mutes"][argname.id]["expire"] = new Date().getTime()+dated;
                                    else
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
                                        if (isdated === true) {
                                            message.reply(`User muted successfully for **${argtime.replace(/"/g, "")}**!`);
                                        } else {
                                            if (argtime == "1" || argtime == 1) 
                                                message.reply(`User muted successfully for **1 minute**!`);
                                            else
                                                message.reply(`User muted successfully for **${argtime} minutes**!`);
                                        }
                                    }
                                    const timer = `${diffsecos === 0 ? `${diffmins} minutes` : diffsecos % 60 === 0 ? `${Math.floor(diffmins)+(diffsecos/60)} minute(s)` : `${Math.floor(diffmins)} minutes and ${diffsecos} seconds`}`;
                                    if (servermods[gueldid].logs !== "") {
                                        const a = actionLogs(0, chanel.id, gueldid, "muted", message.author, argname, true, isdated ? argtime.replace(/"/g, "") : timer, muteobj.reason, isdated);
                                        if (message.guild.channels.get(servermods[gueldid].logs)) {
                                            message.guild.channels.get(servermods[gueldid].logs).sendMessage("", {embed: a[0]});
                                        }
                                    }
                                }
                            }
                        })
                        .catch();
                    }     
                /*} else {
                    message.reply("I do not have the permission `Manage Channels`!");
                }*/
            /*} else {
                if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                    message.reply("I do not have the permission `Manage Channels`!");
                } else {
                    message.reply("I do not have the permissions `Manage Channels` and `Manage Roles`!");
                }
            }*/
        /*} else {
            if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                message.reply("You do not have the permission `Manage Roles`!");
            } else {
                message.reply("Neither of us have the permission `Manage Roles`!");
            }
        }*/
        } catch(err) {
            message.reply("An error was found! (Did you make sure you wrote a valid amount of minutes?)");
            console.log("Error while trying to mute:\n" + err.message);
        }
    }
    if (/^mute$/i.test(instruction)) {
        message.reply("```"+prefix+"mute @person#0000 time reason\n\n!! Time and reason are optional.\n!! Valid options for time:\n1. Number: Mutes the user for the amount of minutes specified as number.\n2. Date string: WARNING: Must be put between \"\". Date string is ?w ?d ?h ?m ?s.\nExample: "+prefix+"mute @guy#0001 \"4h 2m 1s\" NO --> Mutes guy for 4 hours, 2 minutes and 1 second with reason of \"NO\".```");
    }
    if (/^p?unmute\s{1,4}<@!?\d+>(?:\s{1,4}.+)?$/i.test(instruction)) {
        try {
        let p = checkperm("global.unmute");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.unmute`!");
        if (p[2]) return disabledreply(p[2]);
        var argbase = instruction.match(/^p?unmute\s(.+)(?:\s{1.4}.+)?/i)[1];
        let argname = instruction.match(/^p?unmute\s{1,4}<@!?(\d+)>(?:\s{1,4}.+)?$/i)[1];
        argname = bot.users.get(argname.toString());
        if (!argname) return message.reply("User not found!");
        var argmember = message.guild.members.get(argname.id);
        let botmember = message.guild.members.get(bot.user.id);
        let argreason = instruction.match(/^p?unmute\s{1,4}<@!?\d+>(\s{1,4}.+)$/i) ? instruction.match(/^p?unmute\s{1,4}<@!?\d+>\s{1,4}(.+)?$/i)[1] : "None";
        if (botmember.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
            if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && !(checkmodrole(message.member)) && p[1]) return message.reply("Missing permission node `global.unmute`! Could also use this command by having permission `Manage Roles` OR have the `Moderator Role` (for Salt).");
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
            //} else {
                //message.reply("You do not have the permission `Manage Roles`!");
            //}
        } else {
            //if (message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") || message.author.id == ownerID) {
                message.reply("I do not have the permission `Manage Roles`!");
            //} else {
               // message.reply("Neither of us have the permission `Manage Roles`!");
            //}
        }
        } catch (err) {
            message.reply("Uh-oh! An error happened! :(");
            console.log("Error while trying to unmute:" + err.message);
        }
    }
    if (/^mutetime(?:\s<@!?\d+>)?$/i.test(instruction)) {
        let p = checkperm("global.mutetime");
        if (!p[0]) return message.reply("Missing permission node `global.mutetime`!");
        if (p[2]) return disabledreply(p[2]);
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
                    var diffmins = Math.floor(diffmins);//eslint-disable-line no-redeclare
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
        let p = checkperm("global.coinflip");
        if (!p[0]) return message.reply("Missing permission node `global.coinflip`!");
        if (p[2]) return disabledreply(p[2]);
        if (Math.floor((Math.random() * 2) + 1) == 1) {
            message.reply("Tails!");
        } else {
            message.reply("Heads!");
        }
    }
    if (/^random\s\d+(?:(?:\.|,)\d+)?\s\d+(?:(?:\.|,)\d+)?$/i.test(instruction)) {
        let p = checkperm("global.random");
        if (!p[0]) return message.reply("Missing permission node `global.random`!");
        if (p[2]) return disabledreply(p[2]);
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
    if (/^feedme$/i.test(instruction)) {
        let p = checkperm("global.feedme");
        if (!p[0]) return message.reply("Missing permission node `global.feedme` :cry:");
        if (p[2]) return disabledreply(p[2]);
        if (message.author.id == ownerID)
            message.reply("Take a 🐟 for being my super handsome owner!");
        else
            if (message.author.id == "206561428432355328" || message.author.id == "229729055669354497")
                message.reply("Take a 🍕 for being a handsome tiger!");
            else
                if (message.author.id == "175729958323224576")
                    message.reply("Take a 🍕 for being a handsome person!");
                else if (message.author.id == "201765854990434304")
                    message.reply("Take a 🍭 for being a super handsome...uh...apletoot!");
                else if (message.author.id == "222369396214071297" && message.guild.id == "245744417619705859")
                    message.reply("Good riddance.").then(message.member.kick());
                else
                    message.reply("No.");
    }
    if (/^toggleinvites$/i.test(instruction)) {
        try {
            let p = checkperm("global.toggleinvites");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.toggleinvites`!");
            if (p[2]) return disabledreply(p[2]);
            const botmember = message.guild.members.get(bot.user.id);
            if (botmember.hasPermission("MANAGE_MESSAGES")) {
                //if (message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == ownerID) {
                if (!(message.member.hasPermission("MANAGE_MESSAGES")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.toggleinvites`! Could also use this command if you had the permission `Manage Messages`.");
                    if (gueldid in serverdetects && serverdetects[gueldid]["invite"]) {
                        if (serverdetects[gueldid]["invite"] == "true") {
                            serverdetects[gueldid]["invite"] = "false";
                            writeDetects();
                            message.reply("Invite link filter disabled!");
                        } else {
                            serverdetects[gueldid]["invite"] = "true";
                            writeDetects();
                            message.reply("Invite link filter enabled!");
                        }
                    }
                //} else {
                    //message.reply("You do not have the permission `Manage Messages`!");
                //}
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
        let p = checkperm("global.clear.normal");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.clear.normal`!");
        if (p[2]) return disabledreply(p[2]);
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
            if (!(message.member.hasPermission("MANAGE_MESSAGES")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.clear.normal`! Could also use this command by having the permission _Manage Messages_.");
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
            //} else {
                //message.reply("You do not have the permission `Manage Messages`!");
            //}
        } else {
            if (message.member.hasPermission("MANAGE_MESSAGES"))
                message.reply("I do not have the permission `Manage Messages`!");
            else
                message.reply("Neither of us has the permission `Manage Messages`!");
        }
    }
    if (/^hooktalk\s\[(?:.+?)\]\s\((?:.+?)\)\s{(?:.+?)}\s[^]+$/i.test(instruction)) {
        try {
            let p = checkperm("global.hooktalk");
            if (!p[0]) return message.reply("Missing permission node `global.hooktalk`!");
            if (p[2]) return disabledreply(p[2]);
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
        let p = checkperm("global.ping");
        if (!p[0] || p[2]) {
            bot.rest.methods.sendMessage(message.author, `Pong! The ping is ${Date.now() - message.createdAt.getTime()} milliseconds.`, {}).then(()=>message.reply("Sent ping to DMs!")).catch(err=>message.reply("Could not send DM about ping (Check if you blocked me)!"));
        } else
            message.reply(`Pong! The ping is ${Date.now() - message.createdAt.getTime()} milliseconds.`);
    }
    if (/^trigger(?:\s.+?\s[^]+)?$/i.test(instruction)) {
        try {
            let p = checkperm("global.trigger");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.trigger`!");
            if (p[2]) return disabledreply(p[2]);
            if (instruction.match(/^trigger(\s.+?\s.+)$/i)) {
                if (!(message.member.hasPermission("MANAGE_GUILD")) && !(message.member.hasPermission("MANAGE_MESSAGES")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.trigger`! Could also use this command by having the permission `Manage Server` OR `Manage Messages`.");
                    const trigger1 = instruction.match(/^trigger\s(.+?)\s.+$/i)[1];
                    const trigger2 = instruction.match(/^trigger\s.+?\s(.+)$/i)[1];
                    message.reply(`Trigger **${trigger1}** added!`);  
                    if ((/^ +$/i).test(trigger1) || trigger1 === "") return;              
                    serverdetects[gueldid].triggers[trigger1.toLowerCase()] = trigger2;
                    writeDetects();
                    antitrigger[message.id+chanel.id+trigger1] = true;
                //} else {
                    //message.reply("You do not have the permission `Manage Messages` (Although `Manage Server` also works)!");
                //}
            } else {
                message.reply("Please see `"+prefix+"triggers` for a list of triggers.");
            }
        } catch (err) {
            message.reply("RIP, something happened!");
            console.log(`Error while doing trigger: ${err.message}`);
        }
    }
    if (/^triggers$/i.test(instruction)) {
        let p = checkperm("global.triggers");
        if (!p[0]) return message.reply("Missing permission node `global.triggers`!");
        if (p[2]) return disabledreply(p[2]);
        if (Object.keys(serverdetects[gueldid].triggers).length <= 0) {
            message.reply("This server doesn't have any trigger!");
        } else {
            message.author.sendMessage(`List of triggers for server "${message.guild.name}":\n• ${Object.keys(serverdetects[gueldid].triggers).join("\n• ")}\n\n**===========================================**`, {split: true});
            message.reply("The list of triggers for this server has been sent to your private messages!");
        }
    }
    if (/^deltrigger\s(?:.+)$/i.test(instruction)) {
        try {
            let p = checkperm("global.deltrigger");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.deltrigger`!");
            if (p[2]) return disabledreply(p[2]);
            const deltrigger = instruction.match(/^deltrigger\s(.+)$/i)[1];
            if (!(message.member.hasPermission("MANAGE_GUILD")) && !(message.member.hasPermission("MANAGE_MESSAGES")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.deltrigger`! Could also use this command by having the permission `Manage Server` OR `Manage Messages`.");
                if (deltrigger.toLowerCase() in serverdetects[gueldid].triggers) {
                    delete serverdetects[gueldid].triggers[deltrigger.toLowerCase()];
                    writeDetects();
                    message.reply(`Trigger **${deltrigger}** deleted successfully!`);
                } else {
                    message.reply("That is not a trigger in this guild!");
                }
            //} else {
                //message.reply("You do not have the permission `Manage Messages` (Although `Manage Server` also works)!");
            //}
        } catch (err) {
            message.reply("RIP. Something happened!");
            console.log(`Error while doing deltrigger: ${err.message}`);
        }
    }
    if (/^saltrole\s(?:.+?)\s(?:.+)$/i.test(instruction)) {
        try {
        let p = checkperm("global.saltrole");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.saltrole`!");
        if (p[2]) return disabledreply(p[2]);
        const roletype = instruction.match(/^saltrole\s(.+?)\s(?:.+)$/i)[1];
        const rolematched = instruction.match(/^saltrole\s(?:.+?)\s(.+)$/i)[1];
        if (rolematched && roletype) {
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.saltrole`! Could also use this command by having the permission `Manage Server`.");
                 /* jshint -W080 */
                for(var iterator = message.guild.roles.entries(),val = iterator.next(),rolematk = undefined; val.done === false; val = iterator.next()) {//eslint-disable-line no-redeclare
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
            //} else {
                //message.reply("You don't have the permission `Manage Server`!");
            //}
        }
        } catch (err) {
            message.reply("Uh oh! I'm sorry, but an error happened!");
            console.log(`Error while doing saltrole:\n${err.message}`);
        }
    }
    if (/^delsaltrole\s(?:.+)$/i.test(instruction)) {
        try {
            let p = checkperm("global.delsaltrole");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.delsaltrole`!");
            if (p[2]) return disabledreply(p[2]);
            const roletyped = instruction.match(/^delsaltrole\s(.+)$/i)[1];
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.delsaltrole`! Could also use this command by having the permission `Manage Server`."); 
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
            //} else {
               // message.reply("You do not have the permission `Manage Server`!");
            //}
        } catch (e) {
            message.reply("Uh-oh! I'm sorry, but an error happened!");
            console.log(`Error while doing delsaltrole:\n${e.message}`);
        }
    }
    if (/^actionlogs\s{1,4}(?:.+?)(?:\s{1,4}<#\d+>)?$/i.test(instruction)) {
        try {
        let p = checkperm("global.actionlogs.set");
        if (p[2]) return disabledreply(p[2]);
        const option = instruction.match(/^actionlogs\s{1,4}(.+?)(\s{1,4}<#\d+>)?$/i)[1];
        const cchannel = {};
        if (instruction.match(/^actionlogs\s{1,4}(?:.+?)(?:\s{1,4}(<#\d+>))?$/i)[1]) {
            cchannel.channel = instruction.match(/^actionlogs\s{1,4}(?:.+?)(?:\s{1,4}(<#\d+>))?$/i)[1];
        }
        //if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) 
            if (cchannel.channel) {
                if (/^true$/i.test(option) || /^set$/i.test(option) || /^add$/i.test(option)) {
                    if (!p[0] && !p[1]) return message.reply("Missing permission node `global.actionlogs.set`!");
                    if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.actionlogs.set`! Could also use this command by having the permission `Manage Server`.");
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
                        let p = checkperm("global.actionlogs.disable");
                        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.actionlogs.disable`!");
                        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.actionlogs.disable`! Could also use this command by having the permission `Manage Server`.");
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
                        let p = checkperm("global.actionlogs.disable");
                        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.actionlogs.disable`!");
                        if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.actionlogs.disable`! Could also use this command by having the permission `Manage Server`.");
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
        //} else {
          //  message.reply("You do not have the permission `Manage Server`!");
        //}
        } catch (err) {
            message.reply("Eh? An error happened... Sorry!");
            console.log(`Error while doing setlogs: ${err.message}`);
        }
    }
    if (/^clear\s+<@!?\d+>(?:\s+\d+)?$/i.test(instruction)){
        try {
            let p = checkperm("global.clear.user");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.clear.user`!");
            if (p[2]) return disabledreply(p[2]);
            const clearargs = {};
            clearargs.mention = instruction.match(/^clear(\s+<@!?\d+>)(?:\s+\d+)?$/i) ? instruction.match(/^clear\s+<@!?(\d+)>(?:\s+\d+)?$/i)[1] : null;
            if (clearargs.mention) {
                clearargs.mention = bot.users.get(clearargs.mention);
                if (!(clearargs.mention)) return message.reply("User not found!");
            }
            clearargs.number = instruction.match(/^clear\s<@!?\d+>(?:\s(\d+))?$/i) ? instruction.match(/^clear\s<@!?\d+>(?:\s(\d+))?$/i)[1] : null;
            const botmember = message.guild.members.get(bot.user.id);
            if (!(clearargs.mention)) return message.reply("The user that is mentioned doesn't exist!");
            if (!(message.member.hasPermission("MANAGE_MESSAGES")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.clear.user`! Could also use this command by having the permission `Manage Messages`."); 
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
            //} else {
                //if (botmember.hasPermission("MANAGE_MESSAGES"))
                    //message.reply("You do not have the permission `Manage Messages`!");
                //else
                    //message.reply("Neither of us has the permission `Manage Messages`!");
            //}

        } catch (err) {
            message.reply("Hmm.. Sorry! But something happened..!");
            console.log("Error while doing clear (with users):\n" + err.message);
        }
    }
    if (/^rip\s+[^]+$/i.test(instruction)) {
        try {
            let p = checkperm("global.rip");
            if (!p[0]) return message.reply("Missing permission node `global.rip`!");
            if (p[2]) return disabledreply(p[2]);
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
            let p = checkperm("global.image.rotate");
            if (p[2]) return disabledreply(p[2]);
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
                if (!p[0]) return message.reply("Missing permission node `image.rotate`!");
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
                let p = checkperm("global.image.grayscale");
                if (!p[0]) return message.reply("Missing permission node `image.grayscale`!");
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
        let p = checkperm("global.warn");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.warn`!");
        const warning = {};
        warning.mention = instruction.match(/^warn(\s+<@!?\d+>)(?:\s+.+)?$/i) ? instruction.match(/^warn\s+<@!?(\d+)>(?:\s+.+)?$/i)[1] : null;
        if (warning.mention) {
            warning.mention = bot.users.get(warning.mention);
            if (!(warning.mention)) return message.reply("User not found!");
        }
        warning.reason = instruction.match(/^warn\s+<@!?\d+>\s+(.+)$/i) ? instruction.match(/^warn\s+<@!?\d+>\s+(.+)$/i)[1] : "None";
        if (!(warning.mention)) return message.reply("You must mention an user!");
        if (message.author.id == "206561428432355328") return message.reply("**NO**");
        //if (servermods[gueldid].moderator !== "") {
            if (servermods[gueldid].moderator === "" && p[1]) return message.reply(`This server does not have a Moderator role, which is required for this action (except if you have permission \`global.warn\`)! Someone with \`Manage Servers\` must write: \`${prefix}saltrole Moderator rolename\`, where rolename is the role's name.`, {split: true});
            if (!(checkmodrole(message.member)) && message.author.id !== ownerID && p[1]) return message.reply("You do not have this server's moderator role (But you could use this command anyway with permission \`global.warn\`!)");
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
                                    //if (false === 1) {
                                        //message.reply("User muted successfully! Since no time was specified, they were muted for **10 minutes** (default time)!");
                                    //} else {
                                        if (argtime == "1" || argtime == 1) 
                                            chanel.sendMessage(`The user ${argname} has been **muted** (${argtime} minute) for reaching the limit of warnings, as says the server's current setup!`);
                                        else
                                            chanel.sendMessage(`The user ${argname} has been **muted** (${argtime} minutes) for reaching the limit of warnings, as says the server's current setup!`);
                                    //}
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
        //} else {
            //message.reply(`This server does not have a Moderator role, which is required for this action! Someone with \`Manage Servers\` must write: \`${prefix}saltrole Moderator rolename\`, where rolename is the role's name.`, {split: true});
        //}
        } catch (err) {
            message.reply("oh noe! An error happened!");
            console.log(`Error while trying to do warn: ${err.message}`);
        }
    }//*/
    if (/^setwarns\s+.+?\s+.+$/i.test(instruction)) {
        try {
        let p = checkperm("global.setwarns.limit.set");
        if (p[2]) return disabledreply(p[2]);
        const setw = {};
        setw.cmd = instruction.match(/^setwarns\s+(.+?)(?:\s+.+)$/i)[1];
        setw.arg = instruction.match(/^setwarns\s+.+?(\s+.+)$/i) ? instruction.match(/^setwarns\s+.+?\s+(.+)$/i)[1] : null;
        const botmember = message.guild.member(bot.user);
        //if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID) return message.reply("You do not have the permission `Manage Server`!");
        if (!(setw.arg)) return message.reply("You need to provide an argument!");
        console.log(setw.arg+" and "+setw.cmd);
        if (/^limit$/i.test(setw.cmd)) {
            if (/^(?:false|remove)$/i.test(setw.arg)) {
                let p = checkperm("global.setwarns.limit.disable");
                if (!p[0] && !p[1]) return message.reply("Missing permission node `global.setwarns.limit.disable`!");
                if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.setwarns.limit.disable`! Could also use this command by having the permission `Manage Server`.");
                serverwarns[gueldid].setup.limit = 0;
                writeWarns();
                message.reply(`Warn limit removed successfully!`);
            } else if (/^\d+$/i.test(setw.arg)) {
                if (!p[0] && !p[1]) return message.reply("Missing permission node `global.setwarns.limit.set`!");
                if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.setwarns.limit.set`! Could also use this command by having the permission `Manage Server`.");
                if (Number(setw.arg) > 95) return message.reply("The ***limit*** of warn ***limit*** is 95!");
                serverwarns[gueldid].setup.limit = Number(setw.arg);
                writeWarns();
                message.reply(`Warn limit set to \`${setw.arg}\` successfully!`);
            } else {
                message.reply("Argument not valid! Valid arguments for `limit`: `false`/`remove` and `{a full number}` (to set limit).");
            }
        } else if (/^punishment$/i.test(setw.cmd)) {
            if (/^kick$/i.test(setw.arg)) {
                let p = checkperm("global.setwarns.punishment.kick");
                if (!p[0] && !p[1]) return message.reply("Missing permission node `global.setwarns.punishment.kick`!");
                if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.setwarns.punishment.kick`! Could also use this command by having the permission `Manage Server`.");
                if (!(botmember.hasPermission("KICK_MEMBERS"))) return message.reply("I do not have the permission `Kick Members`! :(");
                serverwarns[gueldid].setup.punishment = "kick";
                writeWarns();
                message.reply(`Warn limit punishment set to \`kick\` successfully!`);
            } else if (/^ban$/i.test(setw.arg)) {
                let p = checkperm("global.setwarns.punishment.ban");
                if (!p[0] && !p[1]) return message.reply("Missing permission node `global.setwarns.punishment.ban`!");
                if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.setwarns.punishment.ban`! Could also use this command by having the permission `Manage Server`.");
                if (!(botmember.hasPermission("BAN_MEMBERS"))) return message.reply("I do not have the permission `Ban Members`! :(");
                serverwarns[gueldid].setup.punishment = "ban";
                writeWarns();
                message.reply(`Warn limit punishment set to \`ban\` successfully!`);
            } else if (/^mute(.+)$/i.test(setw.arg)) {
                let p = checkperm("global.setwarns.punishment.mute");
                if (!p[0] && !p[1]) return message.reply("Missing permission node `global.setwarns.punishment.mute`!");
                if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.setwarns.punishment.mute`! Could also use this command by having the permission `Manage Server`.");
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
            let p = checkperm("global.clearwarns");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.clearwarns`!");
            if (p[2]) return disabledreply(p[2]);
            if (servermods[gueldid].moderator === "" && p[1]) return message.reply("This server does not have a Moderator role (although you can still use this command if you get the permission `global.clearwarns`)! Ask someone with `Manage Server` permissions to do **`"+prefix+"saltrole Moderator rolename`**, where rolename is the Moderator role!");
            if (!(checkmodrole(message.member)) && message.author.id !== ownerID && p[1]) return message.reply("You do not have the Moderator role!");
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
        const p = checkperm("global.pmute");
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && !(checkmodrole(message.member)) && p[1]) return message.reply("Missing permission node `global.pmute`! Could also use this command by having permission `Manage Roles` or the _Moderator Role_ (for Salt).");
        if (!(p[0]) && !(p[1])) return message.reply("Missing permission node `global.pmute`!");
        if (p[2]) return disabledreply(p[2]);
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
            let p = checkperm("global.numupper");
            if (!p[0]) return message.reply("Missing permission node `global.numupper`!");
            if (p[2]) return disabledreply(p[2]);
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
            let p = checkperm("global.autoname");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.autoname`!");
            if (p[2]) return disabledreply(p[2]);
            if (!(instruction.match(/^autoname(\s{1,4}.+)$/i))) return message.reply(`\`${prefix}autoname name\`\n\nThis command allows you to set what all members' nickname will be on join. You can write \`{name}\` as a placeholder for the actual name, such as, if you write \`{name} Hello\`, and the member's name is "Discord", their nickname will become \`Discord Hello\` on join.\n:warning: \`Manage Server\` permission required!`);
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.autoname`! Could also use this command by having the permission `Manage Server`.");
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
            let p = checkperm("global.delautoname");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.delautoname`!");
            if (p[2]) return disabledreply(p[2]);
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.delautoname`! Could also use this command by having the permission `Manage Server`.");
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
        let p = checkperm("global.invite");
        if (!p[0] || p[2]) {
            bot.rest.methods.sendMessage(message.author, "Invite Salt to your server: https://discordapp.com/oauth2/authorize?client_id=244533925408538624&scope=bot&permissions=2136472639\n\nOfficial Salt server: https://discord.gg/amQP9m3", {}).then(()=>message.reply("Sent invite info on DMs!")).catch(err=>message.reply("Could not send DM about invite info (Check if you blocked me)!"));
        } else
            message.reply("Invite Salt to your server: https://discordapp.com/oauth2/authorize?client_id=244533925408538624&scope=bot&permissions=2136472639\n\nOfficial Salt server: https://discord.gg/amQP9m3");
    }
    if (/^calc\s{1,2}/i.test(instruction)) {
        let p = checkperm("global.calc");
        if (!p[0]) return message.reply("Missing permission node `global.calc`!");
        if (p[2]) return disabledreply(p[2]);
        let apprefix = prefix.replace(/[-.\\\[\]|^$()+*{}]/g,m=>"\\"+m);
        let regexstuff = new RegExp(`${apprefix}calc `, "i");
        var txt = instruction.replace(regexstuff, "");
        var mat = txt.match(/(?:Math\.\w+)|[()+\-*/&|^%<>=,]|(?:\d+\.?\d*(?:e\d+)?)|(?:pi|Pi|PI|pI)/g);
        var evl = (mat === null ? [] : mat).join ``;
        //var newevl;
        //var powerregex = /((?:-?\d+\.?\d*(?:e\d+)?)|(?:\(.+\))|(?:pi)|(?:Math\.(?:\w|\d)+(?:\(.+\))?))\s*\*\*\s*((?:-?\d+\.?\d*(?:e\d+)?)|(?:\(.+\))|(?:pi)|(?:Math\.(?:\w|\d)+(?:\(.+\))?))/g;
        //while(newevl = evl.replace(powerregex, "Math.pow($1,$2)"), evl !== newevl) {
            //evl = newevl;
        //}
        console.log(evl + " ohM");
        evl = evl.replace(/Math.pi/ig, "pi");
        evl = evl.replace(/pi/ig, "Math.PI");
        evl = evl.replace(/Math.pi/ig, "Math.PI");
        var res;
        console.log(evl);
        try {
            /*jshint ignore:start*/
            res = eval(evl);
            /*jshint ignore:end*/
        } catch (err) {
            chanel.sendMessage("```js\nQuery:\n" + txt.replace(/^calc /, "") + "\n\nError:\n" + err + "```");
        }
        if (!/^\s*$/.test(String(res)) && !isNaN(Number(res)) && res !== undefined && res !== null) {
            chanel.sendMessage("```js\nQuery:\n" + txt.replace(/^calc /, "") + "\n\nOutput:\n" + res + "```");
        }
    }
    if (/^broadcast\s{1,4}.+$/i.test(instruction) && message.author.id == ownerID) {
        bot.guilds.map(v=>{
            if (v.id !== "110373943822540800")
                v.defaultChannel.sendMessage(instruction.match(/^broadcast\s{1,4}(.+)$/i)[1]);
        });
    }
    if (/^role\s{1,4}.+?\s{1,4}(?:<@!?\d+>\s{1,4}.+|.+\s{1,4}<@!?\d+>)$/i.test(instruction)) {
        let p = checkperm("global.role.add");
        if (p[2]) return disabledreply(p[2]);
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
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.role.add`!");
            if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.role.add`! Could also use this command by having the permission `Manage Roles`.");
            if (usermember.roles.get(role.id)) return message.reply(`Said member already has the role **${role.name}**!`);
            usermember.addRole(role).then(roole=>message.reply(`Role **${role.name}** given to ${user} successfully!`));
        } else if (/remove|take/i.test(cmd)) {
            let p = checkperm("global.role.remove");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.role.remove`!");
            if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.role.remove`! Could also use this command by having the permission `Manage Roles`.");
            if (!(usermember.roles.get(role.id))) return message.reply(`Said member doesn't have the role **${role.name}**!`);
            usermember.removeRole(role).then(roole=>message.reply(`Role **${role.name}** taken from ${user} successfully!`));
        }
    }
    if (/^addrole\s{1,4}(?:<@!?\d+>\s{1,4}.+|.+\s{1,4}<@!?\d+>)$/i.test(instruction)) {
        let p = checkperm("global.role.add");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.role.add`!");
        if (p[2]) return disabledreply(p[2]);
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.role.add`! Could also use this command by having the permission `Manage Roles`.");
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
        let p = checkperm("global.role.remove");
        if (!p[0] && !p[1]) return message.reply("Missing permission node `global.role.remove`!");
        if (p[2]) return disabledreply(p[2]);
        if (!(message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.role.remove`! Could also use this command by having the permission `Manage Roles`.");
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
            let p = checkperm("global.encrypt");
            if (!p[0]) return message.reply("Missing permission node `global.encrypt`!");
            if (p[2]) return disabledreply(p[2]);
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
            let p = checkperm("global.decrypt");
            if (!p[0]) return message.reply("Missing permission node `global.decrypt`!");
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
        let p = checkperm("global.setkey");
        if (!p[0]) return message.reply("Missing permission node `global.setkey`!");
        if (p[2]) return disabledreply(p[2]);
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
        let p = checkperm("global.getkey");
        if (!p[0]) return message.reply("Missing permission node `global.getkey`!");
        if (p[2]) return disabledreply(p[2]);
        if (!(/^<@!?\d+>$/i.test(instruction.match(/^getkey\s{1,4}(.+)$/i)[1]))) return message.reply("You must mention an user!");
        if (!(instruction.match(/^getkey\s{1,4}(<@!?\d+>)$/i))) return message.reply("You must mention an user!");
        let user = instruction.match(/^getkey\s{1,4}<@!?(\d+)>$/i)[1];
        user = bot.users.get(user);
        if (!user) return message.reply("User not found!");
        if (!(publickeys[user.id])) return message.reply("Said user doesn't have a PUBLIC key!");
        message.reply(`${user}'s public key: ${publickeys[user.id]}`);
    }
    if (/^manageselfrole\s{1,4}.+?\s{1,4}.+$/i.test(instruction)) {
        let p = checkperm("global.manageselfrole.add");
        if (p[2]) return disabledreply(p[2]);
        //abcdefg
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
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.manageselfrole.add`!");
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.manageselfrole.add`! Could also use this command by having permission `Manage Server`.");
            if (serverself[gueldid][role.id]) return message.reply("That is already a selfrole!");
            serverself[gueldid][role.id] = {};
            serverself[gueldid][role.id].id = role.id;
            writeSelfRoles();
            message.reply(`Role **${role.name}** is now a selfrole!`);
        } else if (/^remove$/i.test(cmd)) {
            let p = checkperm("global.manageselfrole.remove");
            if (!p[0] && !p[1]) return message.reply("Missing permission node `global.manageselfrole.remove`!");
            if (!(message.member.hasPermission("MANAGE_GUILD")) && message.author.id !== ownerID && p[1]) return message.reply("Missing permission node `global.manageselfrole.remove`! Could also use this command by having permission `Manage Server`.");
            if (!(serverself[gueldid][role.id])) return message.reply("Said role is not a selfrole!");
            delete serverself[gueldid][role.id];
            writeSelfRoles();
            message.reply(`Role **${role.name}** is no longer a selfrole!`);
        }
    }
    if (/^selfrole\s{1,4}.+$/i.test(instruction)) {
        let p = checkperm("global.selfrole");
        if (!p[0]) return message.reply("Missing permission node `global.selfrole`!");
        if (p[2]) return disabledreply(p[2]);
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
        const contactstuff = instruction.match(/^contact\s{1,4}(.+)$/i)[1];
        if (/^h[ea]lp(?:\s*me)?!*$/i.test(contactstuff)) return message.reply("Be more specific.......or do "+prefix+"help.");
        if (/^Do you love me[?!]*$/i.test(contactstuff)) return message.reply("No I don't. And don't use `contact` for that.");
        contacts.contacting[`${contacts.contacting.latestnumber}`] = {};
        contacts.contacting[`${contacts.contacting.latestnumber}`].guild = gueldid;
        contacts.contacting[`${contacts.contacting.latestnumber}`].channel = chanel.id;
        contacts.contacting[`${contacts.contacting.latestnumber}`].author = message.author.id;
        contacts.cooldowns[message.author.id] = 30000 + Date.now();
        contacts.contacting.latestnumber++;
        writeContacts();
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
    if (/^emoji(?:\s{1,4}[^]*)?$/i.test(instruction)) {
        try {
            let p = checkperm("global.emoji");
            if (!(p[0])) return message.reply("Missing permission node `global.emoji`!");
            if (p[2]) return message.reply(`:lock: That command has been locked for this ${p[2]}!`);
            if (!(instruction.match(/^emoji\s{1,4}(.+)$/i))) return message.reply("You must put an emoji after `"+prefix+"emoji`!");
            if (!(/<img class=[^]+>\s*$/.test(twemoji.parse(instruction))) && !(instruction.match(/^emoji\s{1,4}(<:.*?:.*?>)$/i))) return message.reply("You must put an emoji (AND ONLY ONE!) after `"+prefix+"emoji`!");
            let emoji;
            let emojitest = {iscustom: false};
            if (instruction.match(/^emoji\s{1,4}(<:.*?:.*?>)$/i)) {
                emoji = instruction.match(/^emoji\s{1,4}<:.*?:(.*?)>$/i)[1];
                emojitest.iscustom = true;
            }
            else 
                emoji = instruction.match(/^emoji\s{1,4}([^]+)$/i)[1];
            if (emojitest.iscustom) {
                chanel.sendFile(`https://cdn.discordapp.com/emojis/${emoji}.png`).then().catch(err=>{
                    if (err == "Error: Not Found") {
                        message.reply("Custom emoji not found :/");
                    } else if (err == "Forbidden") {
                        message.reply("I can't send attachments :/");
                    }
                });
            } else {
                let emojiparse = twemoji.parse(emoji);
                if (emojiparse.match(/[^]*<img class="emoji" draggable=".+" alt=".*" src="(.+)">[^]*/)) {
                    chanel.sendFile(emojiparse.match(/[^]*<img class="emoji" draggable=".+" alt=".*" src="(.+)">[^]*/)[1]).then().catch(err=>{
                        if (err == "Error: Forbidden") {
                            message.reply("I can't send attachments :/");
                        }
                    });
                } else {
                    message.reply("Uhhh... Stuffs happened... Please tell the bot developers about this, thanks.");
                }
            }
        } catch (err) {
            message.reply("Oh! An error has been spotted... Oh jeez...");
            console.log(`Error while doing emoji:\n${err.message}`);
        }    
    }
    if (/^p(?:\s{1,4}[^]*)?$/i.test(instruction)) {
        try {
            //if (message.author.id !== ownerID && message.author.id !== "201765854990434304" && message.author.id !== "195344901506859009") return;
            let findperm = function(permnode){
                return permclass.findPerm(permnode, servercmds, gueldid);
            };
            if (!(/^p\s{1,4}(?:giveuser|giverole|takeuser|takerole|disable|enable|list|clone)\s{1,4}.+\s{1,4}.+$/i.test(instruction)) && !(/^p\s{1,4}list[^]*$/i.test(instruction)) && !(/^p\s{1,4}clone/i.test(instruction))) return message.reply('```+p action arg subarg\n\n!! subarg is only applicable if using disable/enable and give/take, see below.\nAvailable options for "action":\n-> giveuser\n-> giverole\n-> takeuser\n-> takerole\n-> enable\n-> disable\n-> list\n-> clone\n\nAvailable options for "arg":\n-> give and take: Permission node (See +p list)\n!! Write - behind the permission node to negate it.\n-> list: Nothing\n-> Enable and disable: Write either "server" or "channel" (To disable/enable for the whole server or just for this channel)\n-> clone: #channel to clone disables from\n\nAvailable options for "subarg":\n-> give and take: Two valid options: Either mention (user to give/take) or role name (role to give/take)\n-> list: NOTHING!!\n-> clone: NOTHING TOO!\n-> Enable and disable: command name to disable/enable\n\nExample: +p giveuser global.avatar @​Aplet123#9551 -> Gives permission "global.avatar" to Aplet123.\nExample 2: +p giveuser -global.mute @​Salt#8489 -> Negates permission "global.mute" to Salt.\nExample 3: +p giverole * Developers -> Gives permission "*" (all) to Developers.```', {split: {prepend:"```",append:"```"}});
            let selected = instruction.match(/^p\s{1,4}(giveuser|giverole|takeuser|takerole|disable|enable|list|clone)[^]*/i)[1].toLowerCase();
            //console.log("Debug 0700: "+instruction);
            let semiselected = /^p\s{1,4}(?:giveuser|giverole|takeuser|takerole|disable|enable|list|clone)\s{1,4}.+(?:\s{1,4}.+)?$/i.test(instruction) ? [instruction.match(/^p\s{1,4}(?:giveuser|giverole|takeuser|takerole|disable|enable|list|clone)\s{1,4}(.+?)(?:\s{1,4}.+)?$/i)||null, instruction.match(/^p\s{1,4}(?:giveuser|giverole|takeuser|takerole|disable|enable|list|clone)\s{1,4}.+?\s{1,4}(.+)$/i)||null] : null;
            if (semiselected){
                if (semiselected[0]) semiselected[0] = semiselected[0][1];
                if (semiselected[1]) semiselected[1] = semiselected[1][1];
                if (semiselected[0] && !semiselected[1]) semiselected[0] = instruction.match(/^p\s{1,4}(?:giveuser|giverole|takeuser|takerole|disable|enable|list|clone)\s{1,4}(.+)(?:\s{1,4}.+)?$/i)[1];
            }
            let findrole = function(name) {
                let found;
                message.guild.roles.map(r=>{
                    if (r.name.toUpperCase() == name.toUpperCase())
                        found = r;
                });
                if (!found) {
                    let found = search("role", name, message.guild);
                    if (found[1] < 1) return null;
                    return found[0][0] || found[0];
                }
                return found;
            };
            if (selected == "list") {
                message.reply(`Permission list here: <http://pastebin.com/e5UAqaib>`);
            } else if (selected == "giveuser") {
                let p = checkperm("global.p.add", true);
                //console.log(p);
                if (p[1]) {
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && !(message.member.hasPermission("MANAGE_GUILD"))) return message.reply("Missing permission node `global.p.add`. Could use this by having administrator or manage server perms.");
                }
                if (!(p[0]) && !(p[1])) {
                    return message.reply("Missing permission node `global.p.add`!");
                } else if (p[2]) {
                    return message.reply(":lock: That command was disabled for this "+decapitalize(p[2])+"!");
                } else if (typeof p[0] == "boolean") {
                    if (!(semiselected)) return message.reply("No argument was given!");
                    let mention;
                    console.log(semiselected[0] + " are bro with " + semiselected[1]);
                    if (/^<@!?\d+>$/.test(semiselected[0])) mention = semiselected[0];
                    else if (/^<@!?\d+>$/.test(semiselected[1])) mention = semiselected[1];
                    else 
                        return message.reply("No user was mentioned!");
                    let oldmention = mention;
                    let oldmentionplace = oldmention == semiselected[0] ? 1 : 0;
                    mention = bot.users.get(mention.match(/^<@!?(\d+)>$/)[1]);
                    if (!mention) return message.reply("User not found!");
                    let permnode = oldmention == semiselected[0] ? findperm(semiselected[1].toLowerCase().replace(/^-/, "").replace(new RegExp("^"+semiselected[1]+"\\s{1,4}"), "")) : findperm(semiselected[0].toLowerCase().replace(/^-/, "").replace(new RegExp("\\s{1,4}"+semiselected[1]+"$"), ""));
                    if (!permnode) return message.reply(`Permission node \`${semiselected[oldmentionplace]}\` is not valid!`);
                    if (message.author.id != message.guild.owner.id && permnode == "*") return message.reply("You must be the server owner to manage the permission *!");
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && /^(?:global|custom)\.\*$/i.test(permnode)) return message.reply("You must have the Administrator permission to manage the permissions global.* and custom.*!");
                    if (!(perms[gueldid].users[mention.id])) {
                        perms[gueldid].users[mention.id] = {};
                        perms[gueldid].users[mention.id][permnode] = /^-/.test(semiselected[oldmentionplace]) ? false : true;
                        console.log("Debug 40444: "+perms[gueldid].users[mention.id][permnode]);
                        console.log("Debug 405433: "+require("util").inspect(perms[gueldid].users[mention.id]));
                        writePerms();
                    } else {
                        perms[gueldid].users[mention.id][permnode] = /^-/.test(semiselected[oldmentionplace]) ? false : true;
                        console.log("Debug 40444: "+perms[gueldid].users[mention.id][permnode]);
                        console.log("Debug 405433: "+require("util").inspect(perms[gueldid].users[mention.id]));
                        writePerms();
                    }
                    
                    return message.reply("Permission `"+semiselected[oldmentionplace].toLowerCase().replace(/^-/, "").replace(new RegExp("\\s{1,4}"+semiselected[1]+"$"), "")+"` given"+(/^-/.test(semiselected[oldmentionplace])?" (negated) ":"")+" to user "+mention+" successfully!");
                } else {
                    console.log(p);
                }

            } else if (selected == "giverole") {
                let p = checkperm("global.p.add", true);
                if (p[1]) {
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && !(message.member.hasPermission("MANAGE_GUILD"))) return message.reply("Missing permission node `global.p.add`. Could use this by having administrator or manage server perms.");
                }
                if (!(p[0]) && !(p[1])) {
                    return message.reply("Missing permission node `global.p.add`!");
                } else if (p[2]) {
                    return message.reply(":lock: That command was disabled for this "+decapitalize(p[2])+"!");
                } else if (typeof p[0] == "boolean") {
                    if (!(semiselected)) return message.reply("No argument was given!");
                    let role;
                    let oldrole;
                    let spot;
                    let subspot;
                    if (/^(?:[\w\*]+\.)+$/i.test(semiselected[1])) {
                        oldrole = semiselected[0];
                        spot = 1;
                        subspot = 0;
                    }
                    else {
                        oldrole = semiselected[1];
                        spot = 0;
                        subspot = 1;
                    }
                    role = findrole(semiselected[subspot]);
                    if (!role) return message.reply("Role not found! (Please make sure to put role name on the second argument spot)");
                    let permnode = findperm(semiselected[0].toLowerCase().replace(/^-/, "").replace(new RegExp("\\s{1,4}"+semiselected[1]+"$"), ""));
                    if (!permnode) return message.reply(`Permission node \`${semiselected[0]}\` is not valid!`);
                    if (message.author.id != message.guild.owner.id && permnode == "*") return message.reply("You must be the server owner to manage the permission *!");
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && /^(?:global|custom)\.\*$/i.test(permnode)) return message.reply("You must have the Administrator permission to manage the permissions global.* and custom.*!");
                    if (!(perms[gueldid].roles[role.id])) perms[gueldid].roles[role.id] = {};
                    perms[gueldid].roles[role.id][permnode] = /^-/.test(semiselected[0]) ? false : true;
                    let newrolesarr = [];
                    for (let rule of message.guild.roles.array().sort((a,b)=>{return a.position-b.position;}).reverse()) {
                        if (rule.id in perms[gueldid].roles) {
                            let zeobj = {};
                            zeobj[rule.id] = perms[gueldid].roles[rule.id];
                            newrolesarr.push(zeobj);
                        }
                    }
                    let newrolesobj = {};
                    for (let rule of newrolesarr) {
                        for (let prop in rule) {
                            newrolesobj[prop] = rule[prop];
                        }
                    }
                    perms[gueldid].roles = newrolesobj;
                    writePerms();
                    return message.reply("Permission `"+semiselected[0].toLowerCase().replace(/^-/, "").replace(new RegExp("\\s{1,4}"+semiselected[1]+"$"), "")+"` given"+(/^-/.test(semiselected[0])?" (negated) ":"")+" to role "+role.name+" successfully!");
                }
            } else if (selected == "takeuser") {
                let p = checkperm("global.p.remove", true);
                if (p[1]) {
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && !(message.member.hasPermission("MANAGE_GUILD"))) return message.reply("Missing permission node `global.p.remove`. Could use this by having administrator or manage server perms.");
                } 
                if (!(p[0]) && !(p[1])) {
                    return message.reply("Missing permission node `global.p.remove`!");
                } else if (p[2]) {
                    return message.reply(":lock: That command was disabled for this "+decapitalize(p[2])+"!");
                } else if (typeof p[0] == "boolean") {
                    if (!(semiselected)) return message.reply("No argument was given!");
                    let mention;
                    if (/^<@!?\d+>$/.test(semiselected[0])) mention = semiselected[0];
                    else if (/^<@!?\d+>$/.test(semiselected[1])) mention = semiselected[1];
                    else 
                        return message.reply("No user was mentioned!");
                    let oldmention = mention;
                    let oldmentionplace = oldmention == semiselected[0] ? 1 : 0;
                    mention = bot.users.get(mention.match(/^<@!?(\d+)>$/)[1]);
                    if (!mention) return message.reply("User not found!");
                    let permnode = semiselected[oldmentionplace];
                    if (oldmentionplace == 0)
                        permnode = permnode.replace(new RegExp("\\s{1,4}"+semiselected[1]+"$"), "");
                    else
                        permnode = permnode.replace(new RegExp("^"+semiselected[0]+"\\s{1,4}"), "");
                    //if (!permnode) return message.reply(`Permission node \`${semiselected[oldmentionplace]}\` is not valid!`);
                    if (message.author.id != message.guild.owner.id && permnode == "*") return message.reply("You must be the server owner to manage the permission *!");
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && /^(?:global|custom)\.\*$/i.test(permnode)) return message.reply("You must have the Administrator permission to manage the permissions global.* and custom.*!");
                    if (!(perms[gueldid].users[mention.id])) return message.reply("That user doesn't have the permission `"+permnode+"`!");
                    if (!(perms[gueldid].users[mention.id][permnode]) && perms[gueldid].users[mention.id][permnode] !== false) return message.reply("That user doesn't have the permission `"+permnode+"`!");
                    delete perms[gueldid].users[mention.id][permnode];
                    writePerms();
                    return message.reply("Permission `"+permnode.replace(/^-/, "")+"` taken away from user "+mention+" successfully!");
                }
            } else if (selected == "takerole") {
                let p = checkperm("global.p.remove", true);
                if (p[1]) {
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && !(message.member.hasPermission("MANAGE_GUILD"))) return message.reply("Missing permission node `global.p.remove`. Could use this by having administrator or manage server perms.");
                }
                if (!(p[0]) && !(p[1])) {
                    return message.reply("Missing permission node `global.p.remove`!");
                } else if (p[2]) {
                    return message.reply(":lock: That command was disabled for this "+decapitalize(p[2])+"!");
                } else if (typeof p[0] == "boolean") {
                    if (!(semiselected)) return message.reply("No argument was given!");
                    let role;
                    let oldrole = semiselected[1];
                    role = findrole(semiselected[1]);
                    if (!role) return message.reply("Role not found!");
                    let permnode = semiselected[0].replace(new RegExp("\\s{1,4}"+semiselected[1]+"$"), "");
                    //if (!permnode) return message.reply(`Permission node \`${semiselected[0]}\` is not valid!`);
                    if (message.author.id != message.guild.owner.id && permnode == "*") return message.reply("You must be the server owner to manage the permission *!");
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && /^(?:global|custom)\.\*$/i.test(permnode)) return message.reply("You must have the Administrator permission to manage the permissions global.* and custom.*!");
                    if (!(perms[gueldid].roles[role.id])) return message.reply("That role doesn't have the permission `"+permnode+"`!");
                    if (!(perms[gueldid].roles[role.id][permnode])) return message.reply("That role doesn't have the permission `"+permnode+"`!");
                    delete perms[gueldid].roles[role.id][permnode];
                    let newrolesarr = [];
                    for (let rule of message.guild.roles.array().sort((a,b)=>{return a.position-b.position;}).reverse()) {
                        if (rule.id in perms[gueldid].roles) {
                            let zeobj = {};
                            zeobj[rule.id] = perms[gueldid].roles[rule.id];
                            newrolesarr.push(zeobj);
                        }
                    }
                    let newrolesobj = {};
                    for (let rule of newrolesarr) {
                        for (let prop in rule) {
                            newrolesobj[prop] = rule[prop];
                        }
                    }
                    perms[gueldid].roles = newrolesobj;
                    if (perms[gueldid].roles[role.id].keysize < 1) delete perms[gueldid].roles[role.id];
                    writePerms();
                    return message.reply("Permission `"+semiselected[0].toLowerCase().replace(/^-/, "")+"` taken from role "+role.name+" successfully!");
                }
            } else if (selected == "disable") {
                let p = checkperm("global.p.disable", true);
                if (p[1]) {
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && !(message.member.hasPermission("MANAGE_GUILD"))) return message.reply("Missing permission node `global.p.disable`. Could use this by having administrator or manage server perms.");
                } 
                if (!(p[0]) && !(p[1])) {
                    return message.reply("Missing permission node `global.p.disable`!");
                } else if (p[2]) {
                    return message.reply(":lock: That command was disabled for this "+decapitalize(p[2])+"!");
                } else if (typeof p[0] == "boolean") {
                    if (!(semiselected)) return message.reply("No argument was given! Make sure you write server or channel and then command name! If it's a custom command, replace spaces with underlines `_`.");
                    let type = semiselected[0];
                    if (!(/^server$/i.test(type)) && !(/^channel$/i.test(type))) return message.reply("Valid options for `arg` (the first argument): `server` and `channel`.");
                    let cmdtodis = semiselected[1];
                    let checkvalidity = null;
                    for (let cmd in servercmds[gueldid]) {
                        if (cmd.toLowerCase().replace(/\s/g, "_") == cmdtodis.toLowerCase().replace(/\s/g, "_")) {
                            checkvalidity = cmd.toLowerCase().replace(/\s/g, "_");
                            break;
                        }
                    }
                    cmdtodis = cmdtodis.toLowerCase().replace(/\s/g, "_");
                    if ((!(permclass.cmdList.includes(cmdtodis)) && !checkvalidity) || (["manage", "say", "admin", "eval", "broadcast", "restart", "c"].includes(cmdtodis))) return message.reply("Command not found!");
                    if (["p", "invite", "help", "contact"].includes(cmdtodis)) return message.reply("You cannot disable the command `"+cmdtodis+"`!");
                    type = type.toLowerCase();
                    if (type == "server") {
                        if (perms[gueldid].disabled.server.includes("custom."+cmdtodis)||perms[gueldid].disabled.server.includes("global."+cmdtodis)) return message.reply(`The command \`${cmdtodis}\` is already disabled for this server!`);
                        if (checkvalidity)
                            perms[gueldid].disabled.server.push("custom."+checkvalidity);
                        else
                            perms[gueldid].disabled.server.push("global."+cmdtodis.replace(/^(?:addrole|removerole)$/, "role").replace(/^punmute$/, "unmute").replace(/^delreminder$/i, "delremind").replace(/^pong$/i, "ping"));
                    } else if (type == "channel") {
                        if (!(perms[gueldid].disabled.channels[chanel.id])) perms[gueldid].disabled.channels[chanel.id] = [];
                        if (perms[gueldid].disabled.channels[chanel.id].includes("custom."+cmdtodis)||perms[gueldid].disabled.channels[chanel.id].includes("global."+cmdtodis)) return message.reply(`The command \`${cmdtodis}\` is already disabled for this channel!`);
                        if (checkvalidity)
                            perms[gueldid].disabled.channels[chanel.id].push("custom."+checkvalidity);
                        else
                            perms[gueldid].disabled.channels[chanel.id].push("global."+cmdtodis.replace(/^(?:addrole|removerole)$/, "role").replace(/^punmute$/, "unmute").replace(/^delreminder$/i, "delremind").replace(/^pong$/i, "ping"));
                    }
                    writePerms();
                    message.reply("Command `"+cmdtodis+"` disabled for this "+type+" successfully! :lock:");
                }
            } else if (selected == "enable") {
                let p = checkperm("global.p.enable", true);
                if (p[1]) {
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && !(message.member.hasPermission("MANAGE_GUILD"))) return message.reply("Missing permission node `global.p.enable`. Could use this by having administrator or manage server perms.");
                } 
                if (!(p[0]) && !(p[1])) {
                    return message.reply("Missing permission node `global.p.enable`!");
                } else if (p[2]) {
                    return message.reply(":lock: That command was disabled for this "+decapitalize(p[2])+"!");
                } else if (typeof p[0] == "boolean") {
                    if (!(semiselected)) return message.reply("No argument was given! Make sure you write server or channel and then command name! If it's a custom command, replace spaces with underlines `_`.");
                    let type = semiselected[0];
                    if (!(/^server$/i.test(type)) && !(/^channel$/i.test(type))) return message.reply("Valid options for `arg` (the first argument): `server` and `channel`.");
                    let cmdtodis = semiselected[1];
                    let checkvalidity = null;
                    for (let cmd in servercmds[gueldid]) {
                        if (cmd.toLowerCase().replace(/\s/g, "_") == cmdtodis.toLowerCase().replace(/\s/g, "_")) {
                            checkvalidity = cmd.toLowerCase().replace(/\s/g, "_");
                            break;
                        }
                    }
                    cmdtodis = cmdtodis.toLowerCase().replace(/\s/g, "_");
                    console.log(cmdtodis);
                    //if ((["manage", "say", "admin"].includes(cmdtodis))) return message.reply("Command not found!");
                    //if (["p", "invite", "help", "contact"].includes(cmdtodis)) return message.reply("You cannot disable the command `"+cmdtodis+"`!");
                    type = type.toLowerCase();
                    if (type == "server") {
                        if (!(perms[gueldid].disabled.server.includes("custom."+cmdtodis))&&!(perms[gueldid].disabled.server.includes("global."+cmdtodis.replace(/^(?:addrole|removerole)$/, "role")))) return message.reply("That command is not disabled for the server!");
                        let newserverarr = [];
                        for (let disabledcmd of perms[gueldid].disabled.server) {
                            if (disabledcmd !== "global."+cmdtodis.replace(/^(?:addrole|removerole)$/, "role") && disabledcmd !== "custom."+cmdtodis)
                                newserverarr.push(disabledcmd);
                        }
                        perms[gueldid].disabled.server = newserverarr;
                    } else if (type == "channel") {
                        if (!(perms[gueldid].disabled.channels[chanel.id])) return message.reply("That command is not disabled for this channel!");
                        if (!(perms[gueldid].disabled.channels[chanel.id].includes("custom."+cmdtodis))&&!(perms[gueldid].disabled.channels[chanel.id].includes("global."+cmdtodis.replace(/^(?:addrole|removerole)$/, "role")))) return message.reply("That command is not disabled for this channel!");
                        let newchannelarr = [];
                        for (let disabledcmd of perms[gueldid].disabled.channels[chanel.id]) {
                            if (disabledcmd !== "global."+cmdtodis.replace(/^(?:addrole|removerole)$/, "role") && disabledcmd !== "custom."+cmdtodis)
                                newchannelarr.push(disabledcmd);
                        }
                        if (newchannelarr.length == 0) delete perms[gueldid].disabled.channels[chanel.id];
                        else perms[gueldid].disabled.channels[chanel.id] = newchannelarr;
                    }
                    writePerms();
                    message.reply("Command `"+cmdtodis+"` enabled for this "+type+" successfully! :unlock:");
                }
            } else if (selected == "clone") {
                let p = checkperm("global.p.disable", true);
                if (p[1]) {
                    if (!(message.member.hasPermission("ADMINISTRATOR")) && !(message.member.hasPermission("MANAGE_GUILD"))) return message.reply("Missing permission node `global.p.disable`. Could use this by having administrator or manage server perms.");
                } 
                if (!(p[0]) && !(p[1])) {
                    return message.reply("Missing permission node `global.p.disable`!");
                } else if (p[2]) {
                    return message.reply(":lock: That command was disabled for this "+decapitalize(p[2])+"!");
                } else if (typeof p[0] == "boolean") {
                    if (!(semiselected)) return message.reply("Please write the #channel to clone command disables from!");
                    if (!(/^<#\d+>$/.test(semiselected[0]))) return message.reply("Please write the #channel to clone command disables from!");
                    let channel = semiselected[0].match(/^<#(\d+)>$/)[1];
                    channel = message.guild.channels.get(channel);
                    if (!channel) return message.reply("Channel not found!");
                    if (!(perms[gueldid].disabled.channels[channel.id])) chanel.sendMessage("That channel has no disables set, cloning anyway: This channel will have no disables.");
                    else if (perms[gueldid].disabled.channels[channel.id].keysize < 1) chanel.sendMessage("That channel has no disables set, cloning anyway: This channel will have no disables.");
                    if (!(perms[gueldid].disabled.channels[chanel.id])) perms[gueldid].disabled.channels[chanel.id] = [];
                    if (!(perms[gueldid].disabled.channels[channel.id])) perms[gueldid].disabled.channels[chanel.id] = [];
                    else if (perms[gueldid].disabled.channels[channel.id].keysize < 1) perms[gueldid].disabled.channels[chanel.id] = [];
                    else
                    for (let disabledcmd of perms[gueldid].disabled.channels[channel.id]) {
                        perms[gueldid].disabled.channels[chanel.id].push(disabledcmd);
                    }
                    writePerms();
                    message.reply("Disabled Commands from channel <#"+channel.id+"> cloned to this channel successfully! ;)");
                }
            }
        } catch (err) {
            message.reply("Sorry, but an error happened. The devs have been notified though so don't worry ^-^");
            console.error(`Error while doing +p: ${err.message}`);
        }
    }
    if (/^listperms(?:\s{1,4}[^]*)?$/.test(instruction)) {
        //if (message.author.id !== ownerID && message.author.id !== "201765854990434304") return;
        try {
            if (!(/^listperms\s{1,4}(?:user|role)\s{1,4}.+?(?:\s{1,4}\d+)?$/i.test(instruction)) && !(/^listperms\s{1,4}user(?:\s{1,4}\d+)?$/i.test(instruction))) return chanel.sendMessage("```"+prefix+"listperms option arg page(optional, defaults to 1)\nList permissions of an user.\n\nValid options (for \"option\"):\n-> user\n-> role\n\nValid options for arg:\n-> If user was option, mention, or nothing to view of yourself (if viewing of yourself, consider this \"page\"). If not, role name.\n\nPage is the page (max of 10 permissions per page).```");
            let option = instruction.match(/^listperms\s{1,4}(user|role)(?:\s{1,4}.+(?:\s{1,4}\d+)?)?$/i)[1];
            let arg = instruction.match(/^listperms\s{1,4}(?:user|role)\s{1,4}(.+)(?:\s{1,4}\d+)?$/i) ? instruction.match(/^listperms\s{1,4}(?:user|role)\s{1,4}(.+)(?:\s{1,4}\d+)?$/i)[1] : null;
            let page = instruction.match(/^listperms\s{1,4}(?:user|role)\s{1,4}.+(\s{1,4}\d+)$/i) ? instruction.match(/^listperms\s{1,4}(?:user|role)\s{1,4}.+\s{1,4}(\d+)$/i)[1] : null;
            if (page) page = Number(page);
            if (isNaN(page)) return message.reply("You didn't specify a number for page!");
            let p = checkperm("global.listperms");
            if (!p[0]) return message.reply("Missing permission node `global.listperms`!");
            if (p[2]) return message.reply(":lock: That command was disabled for this "+p[2]+"!");
            let trueoption = option.toLowerCase();
            if (trueoption == "user") {
                if ((!(/^<@!?\d+>(?:\s{1,4}\d+)?$/.test(arg)) && !(/^\d+$/i.test(arg)))&&arg!==null) return message.reply(["Nobody was mentioned!", console.log(arg + "\n"+page)][0]);
                let user = /^\d+$/i.test(arg)||arg===null ? message.author : bot.users.get(arg.match(/^<@!?(\d+)>(?:\s{1,4}\d+)?$/)[1]);
                if (!user) return message.reply("User not found!");
                if (/^\d+$/i.test(arg)) page = arg;
                let permstringy;
                let permlength = 0;
                if (!(perms[gueldid].users[user.id]) || perms[gueldid].users[user.id].keysize < 1) permstringy = "";
                else {
                    permstringy = "";
                    for (let perm in perms[gueldid].users[user.id]) {
                        ++permlength;
                        if (perms[gueldid].users[user.id][perm] === true) {
                            permstringy += `+ ${perm}\n`;
                        } else {
                            permstringy += `- ${perm}\n`;
                        }
                    }
                }
                console.log("Debug 10101: "+permstringy);
                let embedo = new Discord.RichEmbed();
                embedo.setAuthor(`${user.username}#${user.discriminator}'s Permissions`, user.avatarURL || user.defaultAvatarURL, "http://google.com")
                    .setColor(0xF59F0C);
                let description = `\`\`\`diff\n${permstringy ? (page ? (Math.ceil(permlength/10) < page ? permstringy.getPage((Math.ceil(permlength/10)), 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n") : permstringy.getPage(page, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : permstringy.getPage(1, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : "===Has default perms"}\`\`\``;
                console.log(description);
                embedo.setDescription(description)
                    .setFooter(`Page ${page ? (permlength ? (Math.ceil(permlength/10)<page?Math.ceil(permlength/10):page):1) : 1}/${permlength?Math.ceil(permlength/10):1}${permlength?(Math.ceil(permlength/10)>1?' - Do command "listperms user '+(arg==page?"":"@insertuserhere#0000 ")+'<page>" to navigate':""):""}`);
                chanel.sendEmbed(embedo);
            } else if (trueoption == "role") {
                if (!arg) return message.reply("You must put a role name!");
                let ultraduperregexbecausewhynot = new RegExp(`\\s{1,4}${page}$`);
                if (page) arg = arg.replace(ultraduperregexbecausewhynot, "");
                let role;
                message.guild.roles.map(r=>{
                    if ([r.name].testprop(arg))
                        role = [console.log("WERKZPL"), r][1];
                });
                let foundrolesize;
                console.log(arg + " " + page);
                if (!role) {
                    role = search("role", arg, message.guild);
                    if (role[1] === 0) return message.reply("Role not found!");
                    foundrolesize = role[1];
                    role = role[0][0];
                }
                if (!role) return message.reply("Role not found!");
                if (!foundrolesize) foundrolesize = 1;
                let permstringy;
                let permlength = 0;
                if (!(perms[gueldid].roles[role.id]) || perms[gueldid].roles[role.id].keysize < 1) permstringy = "";
                else {
                    permstringy = "";
                    for (let perm in perms[gueldid].roles[role.id]) {
                        ++permlength;
                        if (perms[gueldid].roles[role.id][perm] === true) {
                            permstringy += `+ ${perm}\n`;
                        } else {
                            permstringy += `- ${perm}\n`;
                        }
                    }
                }
                let embedo = new Discord.RichEmbed();
                embedo.setAuthor(`Permissions for Role ${role.name}`, role.hexColor == "#000000" ? "http://www.colourlovers.com/img/8B99A4/100/100/" : `http://www.colourlovers.com/img/${role.hexColor.replace(/#/, "")}/100/100/`, "http://google.com")
                    .setColor(0xF59F0C);
                let description = `\`\`\`diff\n${permstringy ? (page ? (Math.ceil(permlength/10) < page ? permstringy.getPage((Math.ceil(permlength/10)), 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n") : permstringy.getPage(page, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : permstringy.getPage(1, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : "===None"}\`\`\``;
                console.log(description);
                embedo.setDescription(description)
                    .setFooter(`Page ${page ? (permlength ? (Math.ceil(permlength/10)<page?Math.ceil(permlength/10):page):1) : 1}/${permlength?Math.ceil(permlength/10):1}${permlength?(Math.ceil(permlength/10)>1?' - Do command "listperms role insertrolenamehere <page>" to navigate':""):""}`);
                chanel.sendEmbed(embedo);
            }
        } catch(err) {
            message.reply("An error happened! Sorry! The devs shall know it.");
            console.error("Error at listperms: "+err.message);
        }
    }
    if (/^listdisables(?:\s{1,4}[^]*)?$/.test(instruction)) {
        try {
        //if (message.author.id !== ownerID && message.author.id !== "201765854990434304") return;
        let p = checkperm("global.listdisables");
        if (!p[0]) return message.reply("Missing permission node `global.listdisables`!");
        if (p[2]) return message.reply(`:lock: That command has been disabled for this ${p[2]}!`);
        if (!(/^listdisables\s{1,4}(?:server|channel)(?:\s{1,4}\d+)?$/i.test(instruction))) return message.reply('```'+prefix+'listdisables type page(optional, defaults to 1)\nShows disabled commands for server or channel.\n\nValid options for "type":\n-> Server\n-> Channel```');
        let type = instruction.match(/^listdisables\s{1,4}(server|channel)(?:\s{1,4}\d+)?$/i)[1];
        let page;
        if (instruction.match(/^listdisables\s{1,4}(?:server|channel)(\s{1,4}\d+)$/i)) page = Number(instruction.match(/^listdisables\s{1,4}(?:server|channel)\s{1,4}(\d+)?$/i)[1]);
        if (["server"].testprop(type)) {
            let permstringy;
            let permlength = 0;
            if (!(perms[gueldid].disabled.server) || perms[gueldid].disabled.server?perms[gueldid].disabled.server.keysize < 1:false) permstringy = "";
            else {
                permstringy = "";
                for (let disabledcmd of perms[gueldid].disabled.server) {
                    ++permlength;
                    permstringy += `- ${disabledcmd}\n`;
                }
            }
            let embedo = new Discord.RichEmbed();
            embedo.setAuthor(`Disabled commands for this server`, message.guild.iconURL?message.guild.iconURL:undefined, "http://google.com")
                .setColor(0xF59F0C);
            let description = `\`\`\`diff\n${permstringy ? (page ? (Math.ceil(permlength/10) < page ? permstringy.getPage((Math.ceil(permlength/10)), 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n") : permstringy.getPage(page, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : permstringy.getPage(1, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : "===No disabled cmds for the whole server"}\`\`\``;
            console.log(description);
            embedo.setDescription(description)
                .setFooter(`Page ${page ? (permlength ? (Math.ceil(permlength/10)<page?Math.ceil(permlength/10):page):1) : 1}/${permlength?Math.ceil(permlength/10):1}${permlength?(Math.ceil(permlength/10)>1?' - Do command "listdisables server <page>" to navigate':""):""}`);
            chanel.sendEmbed(embedo);
        } else if (["channel"].testprop(type)) {
            let permstringy;
            let permlength = 0;
            if (!(perms[gueldid].disabled.channels[chanel.id])) permstringy = "";
            else if (perms[gueldid].disabled.channels[chanel.id].keysize < 1) permstringy = "";
            else {
                permstringy = "";
                for (let disabledcmd of perms[gueldid].disabled.channels[chanel.id]) {
                    ++permlength;
                    permstringy += `- ${disabledcmd}\n`;
                }
            }
            let embedo = new Discord.RichEmbed();
            embedo.setAuthor(`Disabled commands for this channel`, message.guild.iconURL?message.guild.iconURL:undefined, "http://google.com")
                .setColor(0xF59F0C);
            let description = `\`\`\`diff\n${permstringy ? (page ? (Math.ceil(permlength/10) < page ? permstringy.getPage((Math.ceil(permlength/10)), 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n") : permstringy.getPage(page, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : permstringy.getPage(1, 10, /[+-]\s(?:(?:global|custom)(?:\.[\w\*]+){1,3})|\*/g, "\n")) : "===No disabled cmds for this channel"}\`\`\``;
            console.log(description);
            embedo.setDescription(description)
                .setFooter(`Page ${page ? (permlength ? (Math.ceil(permlength/10)<page?Math.ceil(permlength/10):page):1) : 1}/${permlength?Math.ceil(permlength/10):1}${permlength?(Math.ceil(permlength/10)>1?' - Do command "listdisables server <page>" to navigate':""):""}`);
            chanel.sendEmbed(embedo);
        }
        } catch (err) {
            message.reply([console.error("Error while doing listdisables: "+err.message), "Sorry, an error happened! The devs will know ;)"][1]);
        }
    }
    if (/^bam(?:\s{1,4}[^]*)?$/i.test(instruction)) {
        try {
            let p = checkperm("global.bam");
            if (!p[0]) return message.reply("Missing permission `global.bam`!");
            if (p[2]) return disabledreply(p[2]);
            if (!(/^bam\s{1,4}.+$/i.test(instruction))) return chanel.sendMessage("**SWOOP** <@"+message.author.id+"> threw their hammer on the air because they almost threw it at the wall without knowing what they were doing! (Tip: Specify an user)");
            let usertobefound = instruction.match(/^bam\s{1,4}(.+)$/i)[1];
            if (/^<@!?\d+>$/i.test(usertobefound)) {
                usertobefound = usertobefound.match(/^<@!?(\d+)>$/i)[1];
                usertobefound = message.guild.members.get(usertobefound);
                if (!usertobefound) return chanel.sendMessage("**BANGG** <@"+message.author.id+"> threw their hammer on the wall. They were trying to target an user, but it was not found! 💥💥");
                chanel.sendMessage("**BAM** <@"+message.author.id+"> hit "+(usertobefound.id == message.author.id ? "themselves" : "<@"+usertobefound.id+">")+" with their hammer! 💥");
            } else {
                usertobefound = search("user", usertobefound, message.guild);
                if (!usertobefound[1]) return chanel.sendMessage("**BANGG** <@"+message.author.id+"> threw their hammer on the wall. They were trying to target an user, but it was not found! 💥💥");
                chanel.sendMessage((usertobefound[1] > 1 ? "("+usertobefound[1]+" users found, using first find.)\n" : "")+"**BAM** <@"+message.author.id+"> hit "+(usertobefound[0][0].id == message.author.id ? "themselves" : "<@"+usertobefound[0][0].id+">")+" with their hammer! 💥");
            }
        } catch (err) {
            console.error([message.reply("Sorry, but an error happened! The devs will know though :)"), `Error while doing bam:\n${err.message}`][1]);
        }
    }
    if (/^quote(?:\s{1,4}[^]*)?$/i.test(instruction)) {
        try {
            let option = /^quote\s{1,4}[^]+$/i.test(instruction)?instruction.match(/^quote\s{1,4}([^]+)$/i)[1]:"discord";
            if (!(["any", "options", "famous", "discord"].testprop(option))) return message.reply("Invalid option! Valid options are: `any` (Any kind of quote), `discord` (Quotes from discord), `options` (Shows this message) and `famous` (Famous quotes). If no option is specified, `discord` is used.");
            let promiseoptions = {
                    method: 'POST',
                    uri: "https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous",
                    headers: JSON.parse(`{"X-Mashape-Key": "${config.apiape}"}`),
                    json: true
            };
            if (["options"].testprop(option)) return message.reply("Options: `any` (Any kind of quote), `discord` (Quotes from discord), `options` (Shows this message) and `famous` (Famous quotes). If no option is specified, `discord` is used.");
            else if (["discord"].testprop(option)) {
                let embed = new Discord.RichEmbed();
                let quote = quotes.random;
                let user = bot.users.get(quote.author.id);
                let nouser = false;
                if (!user) nouser = [user = `${quote.author.name}#${quote.author.discriminator}`, true][1];
                embed.setAuthor(nouser?quote.author.name+"#"+quote.author.discriminator:`${user.username}#${user.discriminator}`+` said...${nouser?"":` (ID: ${user.id})`}`, nouser?undefined:(user.avatarURL||user.defaultAvatarURL), "http://google.com")
                    .setColor(0x009881)
                    .setDescription(quote.quote)
                    .setFooter(`See "${prefix}quote options" for more options`);
                let didtheembedsend = true;
                chanel.sendEmbed(embed).then(wut=>{
                    if (wut === undefined) didtheembedsend = false;
                });
                if (!didtheembedsend) return message.reply("Could not send embed, please make sure I have the permission `Embed Links`!");
            } else if (["famous"].testprop(option)) {
                let embed = new Discord.RichEmbed();
                let quotedata = {};
                let errored = false;
                requestp.post(promiseoptions).then(body=>{
                        quotedata = body;
                        let quote = quotedata.quote;
                        let user = quotedata.author;
                        embed.setAuthor(`${user} said...`, undefined, "http://google.com")
                            .setColor(0x009881)
                            .setDescription(quote)
                            .setFooter(`See "${prefix}quote options" for more options`);
                        let didtheembedsend = true;
                        chanel.sendEmbed(embed).then(wut=>{
                            if (wut === undefined) didtheembedsend = false;
                        });
                        if (!didtheembedsend) return message.reply("Could not send embed, please make sure I have the permission `Embed Links`!");
                }).catch(err=>{
                        console.error("Error at requesting famous quote:\n"+err);
                        message.reply("Sorry, but an error happened at grabbing a famous quote! The devs shall know though. ;)");
                });
                //if (errored) return message.reply("Sorry, but an error happened at grabbing a famous quote! The devs shall know though. ;)");
            } else if (["any"].testprop(option)) {
                let famousordiscord = Math.floor(Math.random() * (3 - 1)) + 1;
                if (famousordiscord == 1) {
                    let embed = new Discord.RichEmbed();
                    let quote = quotes.random;
                    let user = bot.users.get(quote.author.id);
                    let nouser = false;
                    if (!user) nouser = [user = `${quote.author.name}#${quote.author.discriminator}`, true][1];
                    embed.setAuthor(nouser?quote.author.name+"#"+quote.author.discriminator:`${user.username}#${user.discriminator}`+` said...${nouser?"":` (ID: ${user.id})`}`, nouser?undefined:(user.avatarURL||user.defaultAvatarURL), "http://google.com")
                        .setColor(0x009881)
                        .setDescription(quote.quote)
                        .setFooter(`See "${prefix}quote options" for more options`);
                    let didtheembedsend = true;
                    chanel.sendEmbed(embed).then(wut=>{
                        if (wut === undefined) didtheembedsend = false;
                    });
                    if (!didtheembedsend) return message.reply("Could not send embed, please make sure I have the permission `Embed Links`!");
                } else {
                    let embed = new Discord.RichEmbed();
                    let quotedata = {};
                    let errored = false;
                    requestp.post(promiseoptions).then(body=>{
                        quotedata = body;
                        let quote = quotedata.quote;
                        let user = quotedata.author;
                        embed.setAuthor(`${user} said...`, undefined, "http://google.com")
                            .setColor(0x009881)
                            .setDescription(quote)
                            .setFooter(`See "${prefix}quote options" for more options`);
                        let didtheembedsend = true;
                        chanel.sendEmbed(embed).then(wut=>{
                            if (wut === undefined) didtheembedsend = false;
                        });
                        if (!didtheembedsend) return message.reply("Could not send embed, please make sure I have the permission `Embed Links`!");
                    }).catch(err=>{
                            console.error("Error at requesting famous quote:\n"+err);
                            message.reply("Sorry, but an error happened at grabbing a famous quote! The devs shall know though. ;)");
                    });
                }
            } else {
                message.reply("Invalid option! Valid options are: `any` (Any kind of quote), `discord` (Quotes from discord), `options` (Shows this message) and `famous` (Famous quotes). If no option is specified, `discord` is used.");
            }
        } catch (err) {
            message.reply("Sorry, but an error happened! The devs shall know though. ;)");
            console.error("Error while doing quote:\n"+err.message);
        }
    }
    if (/^perms(?:\s{1,4}[^]*)?$/i.test(instruction)) {
        try {
        let p = checkperm("global.perms");
        if (!p[0]) return message.reply("Missing permission node `global.perms`!");
        if (p[2]) return disabledreply(p[2]);
        if (!(/^perms\s{1,4}.+$/i.test(instruction))) return chanel.sendMessage("```"+prefix+"perms arg --flag(optional)\nLists permissions of a role, user or permission number.\nNote: It will always search for a role unless an user is mentioned, the --user flag is used, or the --number flag is used.\n\nValid flags: --user (Searches for user), --role (Searches for role, not necessary unless name has \"--role\" in it) and --number (for permission numbers)\n\nExample 1: "+prefix+"perms Developer -> Lists permissions for role Developer.\nExample 2: "+prefix+"perms 🔥PgSuper🔥 --user -> Lists permissions for user PgSuper.```");
        let cmdusage = instruction.match(/^perms\s{1,4}(.+)$/i)[1];
        let flag = null;
        if (/(?:--user|--role|--number)$/i.test(cmdusage)) flag = cmdusage.match(/(--user|--role|--number)$/i)[1].match(/^--(.+)$/i)[1];
        let nameforsearch = flag ? cmdusage.match(/^(.+)\s{1,4}--(?:user|role|number)$/i)[1] : cmdusage;
        if (!nameforsearch || /^\s+$/.test(nameforsearch)) flag = "role";
        if ((!flag && !(/^<@!?\d+>$/.test(nameforsearch))) || flag == "role" || /^<@&\d+>$/.test(nameforsearch)) {
            let role;
            if (!(/^<@&\d+>$/.test(nameforsearch)))
                message.guild.roles.map(r=>{
                    if (r.name.toUpperCase() == nameforsearch.toUpperCase()) {
                        role = r;
                    }
                });
            else {
                let actualid = nameforsearch.match(/^<@&(\d+)>$/)[1];
                if (!(message.guild.roles.has(actualid))) return message.reply("Role not found!");
                role = message.guild.roles.get(actualid);
            }
            let found;
            if (!role) {
                found = search("role", nameforsearch, message.guild);
                if (!found[1]) return message.reply("Role not found!");
                role = found[0][0];
            }
            let perms = dperms.convertperms(role.permissions, true);
            let permlist = "```diff\n";
            for (let perm in perms) {
                permlist += (`${perms[perm]?"+":"-"} ${perm}\n`);
                if (perm == "Administrator" && perms[perm]) {
                    permlist = "```diff\n+ All (has Administrator perm)";
                    break;
                }
            }
            permlist += "\n```";
            console.log("kek");
            chanel.sendMessage(`${found?(found[1] > 1?`(${found[1]} roles found on search, using first find.)\n`:""):""}Permissions for role **${role.name.replace(/\\_*~`/g, md=>md.replace("\\", "")).replace(/_*~`/g, md=>`\\${md}`)}**:\n${permlist}`);
        } else if (flag == "user" || /^<@!?\d+>$/.test(nameforsearch)) {
            let user;
            if (/^<@!?\d+>$/.test(nameforsearch)) {
                let actualid = nameforsearch.match(/^<@!?(\d+)>$/)[1];
                if (!(message.guild.members.has(actualid))) return message.reply("User not found!");
                user = message.guild.members.get(actualid);
            } else {
                console.log(nameforsearch + "\n" + cmdusage);
                message.guild.members.map(m=>{
                    if (m.user.username.toLowerCase() == nameforsearch.toLowerCase()) {
                        user = m;
                    }
                });
            }
            let found;
            if (!user) {
                found = search("user", nameforsearch, message.guild);
                if (!found[1]) return message.reply("User not found!");
                user = message.guild.member(found[0][0]);
                if (!user) return message.reply("User not found!");
            }
            let perms = dperms.convertperms(user.permissions.raw, true);
            let permlist = "```diff\n";
            for (let perm in perms) {
                permlist += (`${perms[perm]?"+":"-"} ${perm}\n`);
                if (perm == "Administrator" && perms[perm]) {
                    permlist = "```diff\n+ All (has Administrator perm)";
                    break;
                }
            }
            permlist += "\n```";
            chanel.sendMessage(`${found?(found[1] > 1?`(${found[1]} users found on search, using first find.)\n`:""):""}Permissions for user **${user.user.username.replace(/\\_*~`/g, md=>md.replace("\\", "")).replace(/_*~`/g, md=>`\\${md}`)}**_#${user.user.discriminator}_:\n${permlist}`);
        } else if (flag == "number") {
            if (isNaN(Number(nameforsearch))) return message.reply("That's not a number! (Also make sure it's a **permissions** number)");
            let perms = dperms.convertperms(nameforsearch, true);
            let permlist = "```diff\n";
            for (let perm in perms) {
                permlist += (`${perms[perm]?"+":"-"} ${perm}\n`);
                if (perm == "Administrator" && perms[perm]) {
                    permlist = "```diff\n+ All (has Administrator perm)";
                    break;
                }
            }
            permlist += "\n```";
            message.reply("Permissions stored at number **"+nameforsearch+"**:\n"+permlist);
        } else {
            message.reply("Uh");
            console.log(flag);
        }
        } catch (err) {
            message.reply("Sorry but an error happened :frowning:. The devs shall be aware, though.");
            console.error(`Error at perms command:\n${err.message}`);
        }
    }
    } // End of the whole prefix checking If
    /*if (!(/^[\w\s\+\-$#@!%ˆ&\*\(\)\[\]{}!:;"'`.,><\?/\\\|=\n~]+$/i.test(input)) && message.author.id == "249047754943365121" && message.guild.id == "245744417619705859") {
        message.delete().catch(err=>console.error(err.message));
    }*/
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
    if (/^\+eval\s([^]+)$/i.test(input)) {
        if (message.author.id == ownerID) {
            var functionToEval = input.match(/^\+eval\s([^]+)$/i)[1];
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
    shrug(1, message);
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
        let input = message.content;
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
bot.on("disconnect", ()=>{
    process.exit(1);
});
bot.on("reconnect", ()=>{
    process.exit(1);
});
bot.on("roleDelete", role=>{
    if (role.guild.id in serverself) {
        if (role.id in serverself[role.guild.id]) {
            delete serverself[role.guild.id][role.id];
            writeSelfRoles();
        }
    }
});
process.on("unhandledRejection", (rej, p)=>{
    console.error("Unhandled Rejection:\n"+rej);
    if (rej instanceof Error) {
        if (/Error: Something took too long to do.|read ECONNRESET/i.test(rej.message)) {
            process.exit(1);
        }
    }
});

bot.login(saltandsugar);
//Object.defineProperty(Object.prototype, "keysize", {
  //  get: function(){return Object.keys(this).length;}
//}); 
