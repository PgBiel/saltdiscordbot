import Parser from "./parser";
import Time from "./time";

class TimeParser extends Parser {
  public useUser: boolean;
  constructor(text: string, useUser: boolean = false) {
    super(text);
    this.useUser = Boolean(useUser);
  }
  public parse() {
    const text = this.text;
    let temp: string = "";
    let timeTemp: Array<string|number> = [];
    let user: string = "";
    const time: Time = new Time();
    let expected = /[^]/;
    let reason: string = "";
    let count: number = 0;
    let phase: 1 | 2 | 3 = this.useUser ? 1 : 2;
    for (let letter = text[0]; count < text.length; letter = text[++count]) {
      if (phase === 1) {
        if (count < 32) {
          if (letter === " ") {
            phase = 2;
            expected = /\d/;
            continue;
          }
        } else if (count === 32) {
          if (text[33] === "#") {
            temp = "";
          } else {
            phase = 2;
          }
          expected = /\d/;
        } else if (count === 33) {
          temp += "#";
          continue;
        } else if (count > 33 && count < 38) {
          if (!expected.test(letter)) {
            phase = 3;
            temp += letter;
            continue;
          }
        } else {
          user += temp;
          temp = "";
          phase = 2;
          continue;
        }
        user += letter;
      } else if (phase === 2) {
        if (temp) {
          phase = 3;
          temp += letter;
          continue;
        }
        if (letter === " ") {
          if (timeTemp.length > 0) {
            const [amount, ...unitArr] = timeTemp;
            const unit: string = unitArr.join("");
            if (!unit) {
              if (!amount) { continue; }

            } else if (Time.validUnit(unit)) {

            }
            temp += timeTemp.join("");
            phase = 3;
            continue;
          }
          expected = /\d/;
          continue;
        }
        if (!expected.test(letter)) {
          phase = 3;
          temp += letter;
          continue;
        }
        if (/\d/.test(letter)) {
          expected = /[ymdhs]/;
          timeTemp.push(Number(letter));
          continue;
        } else if (/[ymdhs]/.test(letter)) {
          timeTemp.push(letter);
          expected =  /
        }
      }
    }
  }
}
