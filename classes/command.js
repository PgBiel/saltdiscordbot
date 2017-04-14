const Command = class Command {
  constructor(data) {
    Object.entries(data).map(([ k, v ]) => {
      this[k] = v;
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
Usage: ${p}${this.name}${usedargs}${this.example ? `\n\nExample: ${_.trim(this.example)}` : ``}
\`\`\``;
  }
};

module.exports = Command;