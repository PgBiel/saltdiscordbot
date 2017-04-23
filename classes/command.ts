import { Message, RichEmbed } from "discord.js";
import * as _ from "lodash";

interface Argument {
  optional: boolean;
}

export default class Command {
  public name: string;
  public func: (message: Message, context: {[prop: string]: any}) => any;
  public description?: string;
  public example?: string;
  public args?: {[prop: string]: boolean | Argument};
  public category?: string;
  public private?: boolean;
  constructor(
    { name, func, description = "", example = "", args = null, category = "Uncategorized", devonly = false }) {
    assert(!!name, "No name given.");
    assert(!!func, "No function given for " + name + ".");
    Object.assign(this, {
      name,
      description,
      example,
      args,
      category,
      private: !!devonly,
    });
  }

  public help(p, useEmbed = false) {
    assert(!!p, "No prefix given.");
    let usedargs = "";
    if (this.args) {
      Object.entries([this.args, usedargs += " "][0]).map(([a, v]) => {
        if (v.optional) {
          usedargs += (usedargs.endsWith(" ") ? `[${a}]` : ` [${a}]`);
        } else {
          usedargs += (usedargs.endsWith(" ") ? `{${a}}` : ` {${a}}`);
        }
      });
    }
    if (!useEmbed) {
      return `\`\`\`
${p}${this.name}${this.private ? " (Dev-only)" : ""}
${this.description}
Usage: ${p}${this.name}${usedargs}${this.example ? `\n\nExample: ${_.trim(this.example).replace("{p}", p)}` : ``}
\`\`\``;
    }
    const embed = new RichEmbed();
    embed
      .setTitle(`\`${p}${this.name}\` ${this.private ? " (Dev-only)" : ""}`)
      .setDescription(this.description || "\u200B")
      .addField("Usage", "${p}${this.name}${usedargs}");
    if (this.example) {
      embed.addField("Example", _.trim(this.example).replace("{p}", p));
    }
    return embed;
  }
}
