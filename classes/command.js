const Command = class Command {
  constructor({ name, func, description = "", example = "", args = null, category = "Uncategorized", devonly = false }) {
    assert(!!name, "No name given.");
    assert(!!func, "No function given for " + name + ".");
    Object.assign(this, {
      name,
      description,
      example,
      args,
      category,
      private: !!devonly
    });
  }

  help(p) {
    assert(!!p, "No prefix given.");
    let usedargs = "";
    if (this.args) Object.entries([this.args, usedargs += " "][0]).map(([a, v]) => {
          if (v.optional) {
            usedargs += (usedargs.endsWith(" ") ? `[${a}]` : ` [${a}]`);
          } else {
            usedargs += (usedargs.endsWith(" ") ? `{${a}}` : ` {${a}}`);
          }
        });
    return `\`\`\`
${p}${this.name}${this.private ? " (Dev-only)" : ""}
${this.description}
Usage: ${p}${this.name}${usedargs}${this.example ? `\n\nExample: ${_.trim(this.example).replace("{p}", p)}` : ``}
\`\`\``;
  }
};

module.exports = Command;