/*jshint esversion:6*/
        const moderation = `_ _
            -===**__Moderation__**===-
            • **(prefix)ban** {mention: who to ban} -> Bans someone, deleting their last messages in 24h.
            \\↪ Permissions required:
                \\↪ Bot: _Ban Members_
                \\↪ User: _Ban Members_\n
            • **(prefix)kick** {mention: who to kick} (_Requires both bot and user to have Kick Members permission_) -> Kicks someone.
            \\↪ Permissions required:
                \\↪ Bot: _Kick Members_
                \\↪ User: _Kick Members_\n
            • **(prefix)mute** {mention: user to mute} [time in minutes to mute (Default: 10 mins) OR date String (See below)] [reason] -> Mutes an user for the time specified, in minutes.
            \\↪ Permissions required:
                \\↪ Bot: _Manage Roles and Manage Channels_
                \\↪ User: _Manage Roles_ **OR** _Moderator Role_ (see \`setrole\`)\n
            \\↪ About date strings: You must write them between " "! And they are like this: \`?w ?d ?h ?m ?s\`.
            \\↪ Example 1, assuming the server's prefix is **+**:
                \\↪ \`+mute @guy#0001 "4h 2m 5s" Spamming\` -> This will mute the user \`guy\` for 4 hours, 2 minutes and 5 seconds, with reason of "Spamming".
            \\↪ Example 2, also assuming the prefix is **+**:
                \\↪ \`+mute @guy#0001 5 Spamming\` -> This will mute the user \`guy\` for 5 minutes, with reason of "Spamming".
            • **(prefix)unmute** {mention: user to unmute} [reason] -> Unmutes a muted user.
            \\↪ Permissions required:
                \\↪ Bot: _Manage Roles_
                \\↪ User: _Manage Roles_ **OR** _Moderator Role_ (see \`setrole\`)\n
            • **(prefix)mutetime** [mention: user to view time left] -> Views for how much time an user or yourself will stay muted.
            \\↪ Permissions required: None\n
            • **(prefix)pmute** {user to mute} [reason (optional)] -> Permanently mutes an user.
            \\↪ Permissions required:
                \\↪ Bot: _Manage Roles and Manage Channels_
                \\↪ User: _Manage Roles_ **OR** _Moderator Role_ (see \`setrole\`)
            \\↪ Additional Notes: The user can still be unmuted (using \`unmute\`).\n
            • **(prefix)warn** {mention: user to warn} [reason (optional, but recommended!)] -> Warns an user.
            \\↪ Permissions required:
                \\↪ User: _Moderator Role_
            \\↪ Additional Notes: See **(prefix)setwarns** at Administration for how to setup warn limit and punishment.
            • **(prefix)clearwarns** {mention: user to clear warns} -> Clears an user's warns.
            \\↪ Permissions required:
                \\↪ User: _Moderator Role_
            \\↪ Important Note: This requires warn limit to be enabled (if it isn't, then warns aren't stored). See **(prefix)setwarns** at Administration.`;
        const fun = `_ _
            -===**_Fun_**===-
            • **(prefix)coinflip** -> Flips a coin.
            \\↪ Notes: None\n
            • **(prefix)random** {num 1} {num 2} -> Gives a random number between two numbers.
            \\↪ Notes: The numbers must not have decimals, but can be negative.\n
            • **(prefix)calc** {expression} -> Math!
            \\↪ Notes: Use \`**\` as operator for potency. Also, write \`pi\` for pi.\n
            • **(prefix)feedme** -> Feeds certain people only.
            \\↪ Notes: Why is this on Fun... I don't know.
            • **(prefix)rip** {whatever} -> RIP. Sends you a ripme link based on whatever you put.
            \\↪ Notes: Mentions are accepted, and are replaced by the mentioned user's name!\n
            • **(prefix)encrypt** -> Encrypts a message.
            \\↪ Notes: Write (prefix)encrypt for more information.\n
            • **(prefix)decrypt** -> Decrypts a encrypted message.
            \\↪ Notes: Write (prefix)decrypt for more information.\n
            • **(prefix)setkey** {key} -> Sets your PRIVATE key.
            \\↪ Notes: PRIVATE key is to decrypt messages that were encrypted using the _associated_ PUBLIC key.\n
            • **(prefix)getkey** {user (mention)} -> Gets PUBLIC key of an user.
            \\↪ Notes: PUBLIC key is to encrypt, and is always associated to a PRIVATE key, which can be used to decrypt.
            • **(prefix)emoji** {emoji/custom emoji} -> Returns a bigger version of the emoji you're providing.
            \\↪ Notes: None
            • **(prefix)bam** [user (optional)] -> BAM!!!!! Strikes a hammer on the user specified.
            \\↪ Notes: Search can be used here too! You can mention the user to strike hammer, but you can also write text to search for users with that name (if none, then it searches for nickname)!
            • **(prefix)quote** [option (optional)] -> Gets a random quote.
            \\↪ Notes: If no option is specified, \`discord\` is used as option. Use \`options\` as option to see a list of them.`;
        const utility = `_ _
            -===**Utility**===--
            • **(prefix)selfrole** {role} -> Give or take away a role marked as selfrole to/from yourself.
            \\↪ Notes: About roles marked as selfroles, see \`manageselfrole\`.\n
            • **(prefix)contact** {What do you need help with?} -> Contacts the bot developers and support, has cooldown of 30 secs unless you get answered.
            \\↪ Notes: This command has 2 categories: Utility and Salt-Related. Also, please do not abuse this command; doing so results in being unable to use this command.\n
            • **(prefix)avatar** [mentioned user to view avatar] -> Gives the avatar of the user mentioned.
            \\↪ Notes: Not mentioning anyone returns your own avatar.\n_ _
            • **(prefix)info** [argument] -> Gives info about something.
            \\↪ Notes: Write (prefix)info for a list of available arguments.\n
            • **(prefix)remind** -> Reminds you of something in the future.
            \\↪ Notes: Do (prefix)remind on information of how to use this command.\n
            • **(prefix)delremind** -> Deletes your active reminder.
            \\↪ Notes: This only works if you have an active reminder (obviously).
            \\↪ Alias: **(prefix)delreminder**\n
            • **(prefix)listperms** {user/role} {user mention or role name} [page (optional, defaults to 1] -> View permission list of a role or user.
            \\↪ Notes: None\n
            • **(prefix)listdisables** {server/channel} -> Lists the disabled commands for the actual server or the actual channel.
            \\↪ Notes: None\n
            • **(prefix)perms** {name/number} [flag (optional, can be: --user, --role or --number. Default is --role.)] -> View the permission of an user or role. Or view permissions packed in a permission number.
            \\↪ Notes: None`;
        const administration = `_ _
            -===**Administration**===--
            • **(prefix)logs** {option} [arg (only for setting log channel)] -> Sets logging for the server.
            \\↪ Permissions required:
                \\↪ User: _Manage Server_
            \\↪ Please write **(prefix)logs** for more info!
            • **(prefix)saltrole** {role type} {role name} -> Sets a role as a role type for me (e.g. Moderator role).
            \\↪ Permissions required:
                \\↪ User: _Manage Server_ **OR** _Administrator Role_ (that is set here).
            \\↪ Avaible role types:
                \\↪ Moderator: Enables most Moderation commands.
                \\↪ Administrator: Enables most Administration commands.
            \\↪ Example - Setting Moderator Role, assuming that the prefix for your server is **+**:
                \\↪ \`+saltrole Moderator Mod\` -> This sets Salt's \`MODERATOR\` role to a role named "Mod".\n
            • **(prefix)delsaltrole** {role type} -> Makes a role that is set as a role type be no longer said role type (e.g. Moderator role).
            \\↪ Permissions required:
                \\↪ User: _Manage Server_ **OR** _Administrator Role_
            \\↪ Avaible role types:
                \\↪ Moderator: Enables most Moderation commands.
                \\↪ Administrator: Enables most Administration commands. 
            \\↪ Example - Deleting a set Moderator Role, assuming that the prefix is **+** and that "Mod" is the Moderator Role:
                \\↪ \`+delsaltrole Moderator Mod\` -> Now, the role named "Mod" is no longer the \`MODERATOR\` role for Salt.\n   
            • **(prefix)actionlogs** {(true/set/add) for yes, (false/remove) for no} [#channel (if yes)] -> Enables (with specified channel) / Disables action logs for the server.
            \\↪ Permissions required:
                \\↪ User: _Manage Server_ **OR** _Administrator Role_
            \\↪ Additional Notes: When writing "false" or "remove" as option, this will disable logs for the server.
            • **(prefix)role** {add/give or remove/take} {user (mention)} {role name} -> Add/remove a role from an user.
            \\↪ Permissions required:
                \\↪ Bot: _Manage Roles_
                \\↪ User: _Manage Roles_
            \\↪ Example, assuming that your server's prefix is **+**:
                \\↪ \`+role give @Guy#0000 Member\` -> Gives user "Guy" the role named "Member".
            \\↪ Aliases: \`addrole\` and \`removerole\`\n
            • **(prefix)setwarns** {option} {argument} -> Sets the warnings' configuration.
            \\↪ Permissions required:
                \\↪ Bot: Depends if a punishment is set and if it is, depends on the punishment.
                \\↪ User: _Manage Server_ **OR** _Administrator Role_
            \\↪ Valid options (for {option}):
                \\↪ limit -> To set the limit of warnings (What to set the limit to goes on argument).
                \\↪ punishment -> To set the punishment of reaching said limit (What to set it to goes on argument).
            \\↪ Valid arguments (for {argument}):
                \\↪ If the option is "limit": Put either a number (the limit) or write "false" to disable it.
                \\↪ If the option is "punishment": Put either "kick", "ban" or "mute", and if you put "mute", put the amount of minutes after "mute".
            \\↪ Example, assuming that your server's prefix is **+**:
                \\↪ \`+setwarns limit 5\` -> This sets the warning limit to "5".\n
            • **(prefix)manageselfrole** {add or remove} {role name} -> Manage selfroles for the server.
            \\↪ Permissions required:
                \\↪ User: _Manage Server_ **OR** _Administrator Role_
            \\↪ Example, assuming that the prefix is **+**:
                \\↪ \`+manageselfrole add Event Notify\` -> This makes the role named "Event Notify" a selfrole (see \`selfrole\` command).\n
            • **(prefix)p** -> Please do (prefix)p for more information.
            \\↪ Permissions required:
                \\↪ User: _Manage Server_\n
            • **+prefix** -> Changes or views the actual prefix of the server.
            \\↪ Important Note: Has always the prefix **\`+\`**.
            \\↪ Has two forms:
                \\↪ Form 1: **+prefix** {prefix} -> Changes the actual prefix for the server.
                \\↪ Form 2: **+prefix** -> Views the current prefix and some additional information.
            \\↪ Permissions required:
                \\↪ Form 1:
                    \\↪ User: _Manage Server_
                \\↪ Form 2: None`;
        const automation = `_ _        
            -===**Automation**===-
            • **(prefix)autoname** {autoname} -> Sets a nickname given to members on join.
            \\↪ Permissions required:
                \\↪ User: _Manage Server_
            \\↪ Special Replacement:
                \\↪ Write {name} in the autoname part and it gets replaced by their actual name.
            \\↪ Example (Assuming the prefix is **+**):
                \\↪ \`+autoname The Salty {name}\` -> This makes it so when someone joins, their nickname is changed; assuming their name is "Guy", their name would change to "The Salty Guy".\n
            • **(prefix)delautoname** -> Disables autoname, if it was enabled.
            \\↪ Permissions required:
                \\↪ User: _Manage Server_\n
            • **(prefix)autorole** {role} -> Sets role given to members that join the server.
            \\↪ Permissions required:
                \\↪ Bot: _Manage Roles_
                \\↪ User: _Manage Roles_
            \\↪ Example (assuming that the prefix is **+**):
                \\↪ \`+autorole Member\` -> This makes it so when anyone joins, the role "Member" is given to them.\n
            • **(prefix)delautorole** -> Disables autorole, if there is one.
            \\↪ Permissions required:
                \\↪ User: _Manage Roles_\n
            • **(prefix)trigger** -> Sets or views triggers.
            \\↪ Has 2 forms:
                \\↪ Form 1: **(prefix)trigger** {trigger} {response} -> Sets a trigger check (trigger) for certain text (response) in messages.
                \\↪ Form 2: **(prefix)trigger** -> Views the list of triggers for the server.
            \\↪ Permissions required:
                \\↪ Form 1:
                    \\↪ User: _Manage Messages_ **OR** _Manage Server_
                \\↪ Form 2: None
            \\↪ Example (Assuming that the prefix is **+**):
                \\↪ \`+trigger Hi Hello!\` -> This will make it so whenever someone says Hi in any message, the bot will answer "Hello!".
            • **(prefix)deltrigger** {trigger} -> Deletes a trigger in the current server.
            \\↪ Permissions required:
                \\↪ User: _Manage Messages_ **OR** _Manage Server_`;
        /*message.author.sendMessage(`_ _
\n**===========================================**
            `);*/
        const saltrelated = `_ _
            -===**Salt Related**===-
            • **(prefix)contact** {What do you need help with} -> Contacts to the bot's official server, has cooldown of 30 secs unless you get answered.
            \\↪ Important Note: Do not abuse this command, or you will be blacklisted from using it.
            • **(prefix)c** -> A command used by bot support to respond to contact requests.
            \\↪ Permissions required:
                \\↪ User: **\`MUST BE BOT SUPPORT OR BOT DEVELOPER\`**
            \\↪ Note: Does nothing if not bot support / developer.
            • **(prefix)command** -> Manages custom commands of the server or views info about.
            \\↪ Has 2 forms:
                \\↪ Form 1: **(prefix)command** {command name} {command text} -> Adds a custom command.
                \\↪ Form 2: **(prefix)command** -> Views some information about this command.
            \\↪ Permissions required:
                \\↪ Form 1:
                    \\↪ User: _Manage Server_
                \\↪ Form 2: None
            • **(prefix)delcommand** {command to delete} -> Deletes the custom command specified.
            \\↪ Permissions required:
                \\↪ User: _Manage Server_
            • (prefix)listcommands -> Lists all custom commands of the server.
            \\↪ Permissions required: None
        `;
        const splitter = {split: {prepend: "_ _\n"}};
        const arrowify = function(text){return text.replace(/↪/g, "\\↪");};
module.exports = {
	helps: {
        moderation,
    	administration,
    	saltrelated,
    	fun,
    	utility,
    	automation
    },
    functions: {
        splitter,
        arrowify
    }
};
