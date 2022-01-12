import CommandClient from "../classes/commandClient";
import { Intents } from "discord.js";

export const bot = new CommandClient({
  allowedMentions: { parse: ["roles", "users"] },
  intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_MEMBERS | Intents.FLAGS.GUILD_BANS | Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS | Intents.FLAGS.GUILD_INTEGRATIONS | Intents.FLAGS.GUILD_WEBHOOKS | Intents.FLAGS.GUILD_INVITES | Intents.FLAGS.GUILD_MESSAGES | Intents.FLAGS.GUILD_MESSAGE_REACTIONS | Intents.FLAGS.DIRECT_MESSAGES | Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
  // disabledEvents: ["TYPING_START"],
  // fetchAllMembers: true
});
bot.bot = bot;

export default bot;
