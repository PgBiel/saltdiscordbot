import { https } from "../../util/deps";

const imagedir = c => https.cdn.discordapp.com("/").attachments(c).toString();
export default {
  CHANNEL_INFO: {
    TEXT: imagedir("/417865953121009665/419704103200096278/text.png"),
    TEXT_NSFW: imagedir("/417865953121009665/419704104911241227/text-nsfw.png"),
    VOICE: imagedir("/417865953121009665/419704101530632192/voice.png"),
    CATEGORY: imagedir("/417865953121009665/419704124276342784/category.png")
  },
  SERVER_INFO: {
    NO_ICON: imagedir("/417865953121009665/419987639387684866/NOICON.png")
  }
};
