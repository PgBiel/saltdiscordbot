import { MessageEmbed, DiscordAPIError } from "discord.js";

export default function friendlyError(err: any): MessageEmbed {
  if (err instanceof DiscordAPIError) {
    const embed = new MessageEmbed();
    embed
      .setTitle("Discord Error!")
      .setDescription(err.message)
      .setColor("RED")
      .setFooter(`Error code: ${err.code}`);
    return embed;
  } else {
    return null;
  }
}
