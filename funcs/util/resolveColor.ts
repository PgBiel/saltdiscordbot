import * as Discord from "discord.js";
import colorNumToHex from "./colorNumToHex";

const { Constants }: { Constants: { [name: string]: any } } = Discord as any;

type ColorResolvable = Discord.ColorResolvable;

export default function resolveColor(color: ColorResolvable, hex: true): string;
export default function resolveColor(color: ColorResolvable, hex?: false): number;
export default function resolveColor(color: ColorResolvable, hex: boolean = false): string | number {
  let clrNum: number = 0;
  if (typeof color === "string") {
    if (color === "RANDOM") {
      clrNum = Math.floor(Math.random() * (0xFFFFFF + 1));
    } else if (color === "DEFAULT") {
      clrNum = 0;
    } else {
      clrNum = Constants.Colors[color] || parseInt(color.replace("#", ""), 16);
    }
  } else if (color instanceof Array) {
    clrNum = (color[0] << 16) + (color[1] << 8) + color[2]; // tslint:disable-line:no-bitwise
  } else if (!isNaN(Number(color))) {
    clrNum = Number(color);
  }

  if (clrNum < 0 || clrNum > 0xFFFFFF || clrNum && isNaN(Number(clrNum))) return null;
  if (hex) return colorNumToHex(clrNum);

  return clrNum;
}
