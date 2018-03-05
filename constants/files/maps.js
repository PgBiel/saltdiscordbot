module.exports = {
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