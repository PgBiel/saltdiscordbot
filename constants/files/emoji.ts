import mkEmoji from "../../funcs/parsers/mkEmoji";

const mkEmjProto = (isMention: boolean) => (name: string, id: string) => mkEmoji(id, name, { isEmj: false, isMention });
const retRjt = (isMention: boolean) => {
  const mkEmj = mkEmjProto(isMention);
  return {
    purple: {
      numbers: [
        mkEmj("0_", "420012546246967306"),
        mkEmj("1_", "420012546171469859"),
        mkEmj("2_", "420012546129657867"),
        mkEmj("3_", "420012546095841300"),
        mkEmj("4_", "420012546255486992"),
        mkEmj("5_", "420012546276458522"),
        mkEmj("6_", "420012546381053952"),
        mkEmj("7_", "420012546247098379"),
        mkEmj("8_", "420012546553282560"),
        mkEmj("9_", "420012546553282560"),
        mkEmj("10", "420012546297430017"),
        mkEmj("11", "420012546506883073"),
        mkEmj("12", "420012546351955970"),
        mkEmj("13", "420012546620260374"),
        mkEmj("14", "420012546725117952"),
        mkEmj("15", "420012546637037569"),
        mkEmj("16", "420012546636906497"),
        mkEmj("17", "420012546842689546"),
        mkEmj("18", "420012546926575626"),
        mkEmj("19", "420012546918055946")
      ],
      arrows: {
        left: {
          END: mkEmj("left_end", "420030570970611713"),
          SUP: mkEmj("up_to_five_left", "420030571054366741"),
          ONE: mkEmj("one_left", "420030571054366721")
        },
        right: {
          ONE: mkEmj("one_right", "420030570752507905"),
          SUP: mkEmj("up_to_five_right", "420030571033657347"),
          END: mkEmj("right_end", "420030571301961758")
        }
      }
    },
    FLAG: mkEmj("flag", "420013148565798913"),
    WHAT: mkEmj("what", "420013148976840714"),
    CANCEL: mkEmj("cancel", "420030761928753153"),
    DELETE: mkEmj("delete", "420030812269051915"),
    OWNER: mkEmj("owner", "421875630544781318"),
    ONLINE: mkEmj("online", "471892230039273483")
  };
};
const retChannels = (isMention: boolean) => {
  const mkEmj = mkEmjProto(isMention);
  return {
    TEXT: mkEmj("text", "421869420470599680"),
    VOICE: mkEmj("voice", "421869420672057344"),
    CATEGORY: mkEmj("category", "421869420198232075")
  };
};
export default {
  WASTEBASKET: "🗑",
  REDX: "❌",
  numbers: [ "0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟" ],
  arrows: {
    left: {
      END: "⏮",
      SUP: "⏪",
      ONE: "◀"
    },
    right: {
      ONE: "▶",
      SUP: "⏩",
      END: "⏭"
    }
  },
  resolved: {
    rjt: retRjt(false),
    channels: retChannels(false)
  },
  rjt: retRjt(true),
  channels: retChannels(true)
};
