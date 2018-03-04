const { Time } = require("../classes/time");
const { combineRegex } = require("../funcs/funcs");

exports.sql = {
  UNIQUE_CONSTRAINT: "SequelizeUniqueConstraintError"
};

exports.times = {
  AMBIGUITY_EXPIRE: Time.seconds(25)
};

exports.maps = {
  YESNO: {
    true: "Yes",
    false: "No"
  },
  VERIF: [
    "None",
    "Low",
    "Medium",
    "(╯°□°）╯︵ ┻━┻",
    "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻"
  ],
  PUNISHMENTS: {
    m: ["mute", "**{target}** was muted", "GOLD", [["Muted For", "<d>"]]],
    p: ["mute", "**{target}** was muted", "GOLD", [["Muted For", "Until they're unmuted"]]],
    w: ["warn", "**{target}** was warned", "AQUA"],
    u: ["unmute", "**{target}** was unmuted", "GREEN"],
    U: ["unban", "**{target}** was unbanned", "DARK_GREEN"],
    k: ["kick", "**{target}** was kicked", "ORANGE"],
    s: ["softban", "**{target}** was softbanned", "ORANGE"],
    b: ["ban", "**{target}** was banned", "RED"]
  },
  FILTER: {
    replace: {
      "4":  "a", "1": "i", /* l = i */ "3": "e", "@":  "a", "$":  "s",
      "0": "o", "7": "t", "5": "s", "&":  "e", "§": "s",
      "∑": "e", "®":  "r", "©": "c", "ß": "b", "∂": "g",
      "∆":  "a", "˚":  "o", "Ω": "o", "√": "v", "∫": "s",
      "™": "tm", "£": "i", /* l = i */ "•": "o", "∞": "oo", "€":  "e",
      "°": "o", "∏": "n", "◊": "o", "Ԁ": "d", "ѧ": "a",
      "∪": "u", "Ϲ": "c", "Ϝ": "f", "К": "k", "Ρ": "p",
      "ℏ": "h", "ҳ": "x", "l": "i", "|": "i", "!": "i",
      "¡": "i", "2": "z", "()": "o", "[]": "o", "{}": "o",
      "<>": "o", "6": "g", "8": "b", "〰": "w", "(": "c"
    },
    greekCyrilic: {
      "Φ": "o", "Χ": "x", "Ψ": "y", "Ω": "o", "ή": "n",
      "γ": "y", "η": "n", "Η": "h", "Θ": "o", "Λ": "a",
      "Ή": "h", "Ͷ": "n", "Σ": "e", "ρ": "p", "χ": "x",
      "ω": "w", "ϋ": "u", "ύ": "u", "ώ": "w", "Ϗ": "k",
      "Ϻ": "m", "ϻ": "m", "Н": "h", "Р": "p", "С": "c",
      "У": "y", "Х": "x", "Ъ": "b", "Ы": "bi", "Ь": "b",
      "Ю": "io", "Я": "r", "в": "b", "г": "r", "Γ": "r",
      "ϝ": "f", "Ϟ": "n", "ϰ": "x", "Ѕ": "s", "Ї": "i",
      "Ќ": "k", "Ў": "y", "Ф": "o", "Ѥ": "ie", "阝": "b",
      "乙": "z"
    }
  }
};

exports.strings = {
  DATE_FORMAT: "ddd MMM DD YYYY hh:mm:ss A",
  DEFAULT_ROLE_COLOR: "#000000",
  DISPLAY_DEFAULT_ROLE_COLOR: "#9CAAB3"
};

exports.regex = {
  HAS_DECIMAL: /\.(?!0+$)/,
  NAME_AND_DISCRIM: /^([^]{1,32})#(\d{4})$/,
  ID: /^(\d{16,21})$/,
  MENTION: /^<@!?(\d{16,21})>$/,
  ROLE_MENTION: /^<@&(\d{16,21})>$/,
  CHANNEL_MENTION: /^<#(\d{16,21})>$/,
  BAN_MATCH: /^([^]+?(?:#\d{4})?)(?:\s+([^]*))?$/,
  CASE_MATCH: /^(?:([\s\S]+)\s+(\d+)\s+([\s\S]+)|([\s\S]+)\s+([\s\S]+)|([\s\S]+))/,
  LIST_WARNS_MATCH: /^([\s\S]{1,32}|[\s\S]{1,32}\#\d{4})\s+(\d+)|([\s\S]{1,32}|[\s\S]{1,32}\#\d{4})$/,
  LIST_PUNISH_MATCH: `
  ^(?:((?:all|kick|ban|unban|unmute|softban|mute|warn)s?)(?:\\s+(\\d+))?)|(?:([\\s\\S]{1,32}|[\\s\\S]{1,32}\\#\\d{4})\\s+["']*
  ((?:all|kick|ban|unban|unmute|softban|mute|warn)s?)["']*(?![^\\s])(?:\\s+(\\d+))?)|([\\s\\S]{1,32}|[\\s\\S]{1,32}\\#\\d{4})$`,
  MUTE: {
    /**
     * Mute regex.
     * @param {number} type One of 1 (user match), 2 (time match) and 3 (reason match).
     * @returns {RegExp}
     */
    /* MATCH: (type: 1 | 2 | 3) => {
      let regexs: [string|RegExp];
      if (type === 1) {
        regexs = [
          "^([^]{1,32}?(?:#\\d{4})?)(?:(?:\\s+(?:\"|'|'')?(?:\\d+|(?:\\d+\\s*(?:s(?:ec(?:ond)s?)",
          "|m(?:in(?:ute)?s?)?|(?:h(?:ours?)?)|(?:d(?:ays?)?)|(?:w(?:eeks?)?)|(?:mo(?:nths?)?))+))(?:\"|'|'')?)",
          "(?:\\s+[^]*)?|(?:\\s+[^]*))?$",
        ];
      } else if (type === 2) {
        regexs = [
          "^(?:[^]{1,32}?(?:#\\d{4})?)(?:(?:\\s+(?:\"|'|'')?(\\d+|(?:\\d+\\s*(?:s(?:ec(?:ond)s?)",
          "|m(?:in(?:ute)?s?)?|(?:h(?:ours?)?)|(?:d(?:ays?)?)|(?:w(?:eeks?)?)|(?:mo(?:nths?)?))+))(?:\"|'|'')?)",
          "(?:\\s+[^]*)?|(?:\\s+[^]*))?$",
        ];
      } else if (type === 3) {
        regexs = [
          "^(?:[^]{1,32}?(?:#\\d{4})?)(?:(?:\\s+(?:\"|'|'')?(?:\\d+|(?:\\d+\\s*(?:s(?:ec(?:ond)s?)",
          "|m(?:in(?:ute)?s?)?|(?:h(?:ours?)?)|(?:d(?:ays?)?)|(?:w(?:eeks?)?)|(?:mo(?:nths?)?))+))(?:\"|'|'')?)",
          "(\\s+[^]*)?|(\\s+[^]*))?$",
        ];
      } else {
        throw new RangeError(`Invalid type, must be one of 1, 2, 3, but was given ${type}!`);
      }
      return combineRegex(regexs, "i");
    }, */
    MATCH_REG: `
    ^ # Start of string.
    (?: # User & Time.
      ( # Possibility 1 starts here. This group is the user name
        [\\s\\S]{1,32} # Any character up to 32 times
        |[\\s\\S]{1,32} # Or, up to 32 times...
        \\#\\d{4} # ...and a discrim.
      )
      \\s+ # Any whitespace
      ["']* # Optional quotes
      ( # The group of time units.
        (?: # First time unit.
          \\d+ # Amount of it.
          \\s* # Whitespace if you desire.
          (?: # Entering valid time units.
            (?:mo|(?:months?)) # mo, month, months
            |(?:s|(sec|second)s?) # s, sec, secs, second, seconds
            |(?:m|(?:min|minute)s?) # m, min, mins, minute, minutes
            |(?:h|(?:hours?)) # h, hour, hours
            |(?:d|(?:days?)) # d, day, days
            |(?:w|(?:weeks?)) # w, week, weeks
            |(?:y|(?:years?)) # y, year, years
          ) # Leaving valid time units.
        ) # End of first time unit.
        (?: # Holder for any extra time units.
          \\s* # Whitespace if you want.
          \\d+ # Amount of time unit.
          \\s* # Optional Whitespace.
          (?: # Once again, entering valid time units.
            (?:mo|(?:months?)) # mo, month, months
            |(?:s|(sec|second)s?) # s, sec, secs, second, seconds
            |(?:m|(?:min|minute)s?) # m, min, mins, minute, minutes
            |(?:h|(?:hours?)) # h, hour, hours
            |(?:d|(?:days?)) # d, day, days
            |(?:w|(?:weeks?)) # w, week, weeks
            |(?:y|(?:years?)) # y, year, years
          ) # Leaving valid time units.
        )* # Exiting holder for extra time units. Can be any amount.
      ) # Exiting the group of time units.
      ["']* # Optional quotes
      (?! # Do not match if there's...
        [^\\s] # ...Anything other than whitespace after this.
      )
      | # Possibility 1 ends here. Possibility 2 starts here.
      ( # User name matching.
        [^\\s]{1,32} # Any character, matching up to 32 times.
      )
      \\s+ # Whitespaces
      ["']* # Optional quotes
      ( # Match...
        \\d+ # ...Numbers. (Naked numbers are converted to minutes)
      )
      ["']* # Optional quotes
      (?! # Do not match if there's...
        [^\\s] # ...Anything other than whitespace after this.
      )
      | # Possibility 2 ends here, and Possibility 3 starts here.
      ( # User name matcing.
        [^\\s]{1,32} # Any character up to 32 times.
        \\#\\d{4} # Discriminator.
      )
      \\s+ # Whitespaces
      ["']* # Optional quotes
      ( # Match...
        \\d+ # ...Numbers. (Naked numbers are converted to minutes)
      )
      ["']* # Optional quotes
      (?! # Do not match if there's...
        [^\\s] # ...Anything other than whitespace after this.
      )
      | # Possibility 3 ends here, Possibility 4 starts here.
      ( # Just user name. (Default to 10 min)
        [^\\s]{1,32} # Match any character up to 32 times...
        |[^\\s]{1,32} # Or, any character up to 32 times with...
        \\#\\d{4}# ...A discrim.
      ) # Possibility 4 ends here.
    ) # All the matching ends here. Phew!
    (?: # Reason group.
      \\s+ # Whitespace to indicate reason.
      ([^]+) # The reason itself, any character any amount of times.
    )? # It is also optional.
    $ # End of string.`,
    IS_JUST_NUMBER: /^(?:"|'|'')?(\d+)(?:"|'|'')?$/,
    IS_NOTHING: /^(?:|\s+|(?:"|'|'')\s*(?:"|'|''))$/,
    TIME_MATCH:
    /\d+\s*(?:(?:mo|(?:months?))|(?:s|(?:sec|second)s?)|(?:m|(?:min|minute?s?))|(?:h|(?:hours?))|(?:d|(?:days?))|(?:w|(?:weeks?))|(?:y|(?:years?)))/g,
    SINGLE_TIME_MATCH: isNumber => {
      return isNumber ? /^(\d+)\s*\w+$/ : /^\d+\s*(\w+)$/;
    }
  }
};

exports.numbers = {
  MAX_PROMPT: 5,
  MAX_CASES: (members = 0) => {
    if (members >= 5000) {
      return 2000;
    } else if (members >= 700) {
      return 1000;
    } else {
      return 500;
    }
  },
  MAX_FIELD_CHARS: 1024,
  MAX_DESC_CHARS: 2048,
  MAX_MSG_CHARS: 2000,
  MAX_PAGE_LENGTH: 5
};

exports.emoji = {
  WASTEBASKET: "🗑"
};

exports.identifiers = {
  OWNER: "180813971853410305",
  APLET: "201765854990434304"
};
