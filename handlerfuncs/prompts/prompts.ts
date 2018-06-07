import { default as genPrompt } from "./genPrompt";
import { default as genPromptD } from "./genPromptD";

import { default as prompt } from "./prompt";
import { default as promptAmbig } from "./promptAmbig";

import { Message } from "discord.js";

export default (msg: Message) => ({
  genPrompt: genPrompt(msg), genPromptD: genPromptD(msg), prompt: prompt(msg), promptAmbig: promptAmbig(msg)
});
