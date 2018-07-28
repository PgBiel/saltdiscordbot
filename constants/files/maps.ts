interface IPunishmentList {
  m: [string, string, string, [[string, string]]];
  p: [string, string, string, [[string, string]]];
  w: [string, string, string];
  u: [string, string, string];
  U: [string, string, string];
  k: [string, string, string];
  s: [string, string, string];
  b: [string, string, string];
}

const PUNISHMENTS: IPunishmentList = {
  m: ["mute", "**{target}** was muted", "GOLD", [["Muted For", "<d>"]]],
  p: ["mute", "**{target}** was muted", "GOLD", [["Muted For", "Until they're unmuted"]]],
  w: ["warn", "**{target}** was warned", "AQUA"],
  u: ["unmute", "**{target}** was unmuted", "GREEN"],
  U: ["unban", "**{target}** was unbanned", "DARK_GREEN"],
  k: ["kick", "**{target}** was kicked", "ORANGE"],
  s: ["softban", "**{target}** was softbanned", "ORANGE"],
  b: ["ban", "**{target}** was banned", "RED"]
};

export default {
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
  modsettings: {
    VERIF: [
      { name: "None", desc: "Unrestricted" },
      { name: "Low", desc: "Must have a verified email on their Discord account." },
      { name: "Medium", desc: "Must also be registered on Discord for longer than 5 minutes." },
      { name: "(╯°□°）╯︵ ┻━┻", desc: "Must also be a member of this server for longer than 10 minutes." },
      { name: "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻", desc: "Must have a verified phone on their Discord account." }
    ],
    EXPLICIT: [
      { name: "Don't scan any messages.", desc: "Ain't no party like my grandma's tea party." },
      {
        name: "Scan messages from members without a role.",
        desc: "Recommended option for servers that use roles for trusted membership."
      },
      { name: "Scan messages sent by all members.", desc: "Recommended option for when you want that squeaky clean shine." }
    ]
  },
  DEFNOTIF: {
    ALL: "All Messages",
    MENTIONS: "Only Mentions"
  },
  PUNISHMENTS,
  FILTER: {
    replace: {
      4:  "a", 1: "i", /* l = i */ 3: "e", "@":  "a", $:  "s",
      0: "o", 7: "t", 5: "s", "&":  "e", "§": "s",
      "∑": "e", "®":  "r", "©": "c", ß: "b", "∂": "g",
      "∆":  "a", "˚":  "o", Ω: "o", "√": "v", "∫": "s",
      "™": "tm", "£": "e", /* l = i */ "•": "o", "∞": "oo", "€":  "e",
      "°": "o", "∏": "n", "◊": "o", Ԁ: "d", ѧ: "a",
      "∪": "u", Ϲ: "c", Ϝ: "f", К: "k", Ρ: "p",
      ℏ: "h", ҳ: "x", l: "i", "|": "i", "!": "i",
      "¡": "i", 2: "z", "()": "o", "[]": "o", "{}": "o",
      "<>": "o", 6: "g", 8: "b", "〰": "w", "(": "c",
      ñ: "n"
    },
    greekCyrilic: {
      Φ: "o", Χ: "x", Ψ: "y", Ω: "o", ή: "n",
      γ: "y", η: "n", Η: "h", Θ: "o", Λ: "a",
      Ή: "h", Ͷ: "n", Σ: "e", ρ: "p", χ: "x",
      ω: "w", ϋ: "u", ύ: "u", ώ: "w", Ϗ: "k",
      Ϻ: "m", ϻ: "m", Н: "h", Р: "p", С: "c",
      У: "y", Х: "x", Ъ: "b", Ы: "bi", Ь: "b",
      Ю: "io", Я: "r", в: "b", г: "r", Γ: "r",
      ϝ: "f", Ϟ: "n", ϰ: "x", Ѕ: "s", Ї: "i",
      Ќ: "k", Ў: "y", Ф: "o", Ѥ: "ie", 阝: "b",
      乙: "z",
// russian kbd
      к: "k", К: "k", й: "n", Й: "n", ц: "u",
      Ц: "u", у: "y", е: "e", Е: "e",
      н: "h", ш: "w", щ: "w", Ш: "w", Щ: "w",
      х: "x", ъ: "b", ф: "o"
    }
  }
};
