// old Time file

export type timeUnit = "year" | "years"
  | "month"  | "months"
  | "week"   | "weeks"
  | "day"    | "days"
  | "hour"   | "hours"
  | "minute" | "minutes"
  | "second" | "seconds";
/**
 * Helper class for representing timespans.
 */
class Time {
  public static years: typeof years;
  public static months: typeof months;
  public static weeks: typeof weeks;
  public static days: typeof days;
  public static hours: typeof hours;
  public static minutes: typeof minutes;
  public static seconds: typeof seconds;
  /**
   * Time stored.
   * @type {number}
   */
  public time: number;
  /**
   * @param {Date|number|Time} [dateOrMsOrTime=0] An optional date to get its time since Jan 1, 1970;
   * an initial amount of milliseconds or a Time instance.
   */
  constructor(dateOrMsOrTime: Date | number | Time = 0) {
    this.time = dateOrMsOrTime instanceof Date ?
    dateOrMsOrTime.getTime() :
    dateOrMsOrTime instanceof Time ?
    dateOrMsOrTime.time :
    dateOrMsOrTime;
  }

  /**
   * Add a certain amount of time.
   * @param {string|number|Time} unitOrMsOrTime A number in milliseconds, a string of time unit to use
   * (years, months, weeks, days, hours, minutes or seconds) or a Time instance.
   * @param {number} [amount] An amount of the unit (ONLY in case the first one is a time unit string).
   * @returns {number} The old total time.
   */
  public add(unit: timeUnit, amount: number): number;
  public add(msOrTime: number | Time): number;
  public add(unitOrMsOrTime: timeUnit | number | Time, amount?: number): number {
    const oldTime = this.time;
    if (unitOrMsOrTime instanceof Time) {
      this.time += unitOrMsOrTime.time;
    } else if (typeof unitOrMsOrTime !== "number") {
      const unitCase = unitOrMsOrTime.toLowerCase();
      const map: string[] = ["year", "month", "week", "day", "hour", "minute", "second"];
      const mapPlural: string[] = map.map((str: string) => str + "s");
      let funcToUse: string;
      if (map.includes(unitCase)) {
        funcToUse = unitCase + "s";
      } else if (mapPlural.includes(unitCase)) {
        funcToUse = unitCase;
      } else {
        throw new TypeError("Invalid unit!");
      }
      this.time += Time[funcToUse](amount);
    } else {
      this.time += unitOrMsOrTime;
    }
    return oldTime;
  }

  /**
   * Remove a certain amount of time.
   * @param {string|number|Time} unitOrMsOrTime A number in milliseconds, a string of time unit to use
   * (years, months, weeks, days, hours, minutes or seconds) or a Time instance.
   * @param {number} [amount] An amount of the unit (ONLY in case the first one is a time unit string).
   * @returns {number} The old total time.
   */
  public remove(unit: timeUnit, amount: number): number;
  public remove(msOrTime: number | Time): number;
  public remove(unitOrMsOrTime: timeUnit | number | Time, amount?: number): number {
    if (unitOrMsOrTime instanceof Time) {
      return this.add(-unitOrMsOrTime.time);
    }
    if (typeof unitOrMsOrTime !== "number") {
      return this.add(unitOrMsOrTime, -amount);
    }
    return this.add(-unitOrMsOrTime);
  }

  /**
   * Clear this timespan.
   * @returns {number} The old time.
   */
  public clear(): number {
    const oldSpan = this.time;
    this.time = 0;
    return oldSpan;
  }

  /**
   * When concatenated with a string, this returns the units and their respective
   * amounts, separated by comma. E.g.: "1 year, 2 months and 4 seconds".
   */
  public toString(): string {
    const unitObj: {[method: string]: number} = this.units;
    let result = "";
    Object.entries(unitObj).forEach(([unit, amount]: [timeUnit, number]) => {
      if (amount === 0) {
        if (!result && unit === "seconds") {
          result = "0 seconds";
        }
        return;
      }
      const toUse = amount === 1 ? unit.replace(/s$/i, "") : unit;
      if (!result) {
        result = `${amount} ${toUse}`;
      } else if (result.includes("and")) {
        result = result.replace(/\s*and(\s*\d+\s*\w+)$/i, ",$1 and");
        result += ` ${amount} ${toUse}`;
      } else {
        result += ` and ${amount} ${toUse}`;
      }
    });
    return result;
  }
  /**
   * This timespan separated in units.
   * @type {Object<timeUnit, number>}
   */
  get units() {
    let diff: number = this.time;
    const years: number = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 4 * 12));
    diff -= years * (1000 * 60 * 60 * 24 * 7 * 4 * 12);

    const months: number = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 4));
    diff -= months * (1000 * 60 * 60 * 24 * 7 * 4);

    const weeks: number = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    diff -= weeks * (1000 * 60 * 60 * 24 * 7);

    const days: number = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours: number = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const mins: number = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    const seconds: number = Math.floor(diff / (1000));
    diff -= seconds * (1000);
    return { years, months, weeks, days, hours, minutes: mins, seconds };
  }
  /**
   * How many years this timespan holds.
   * @type {number}
   */
  get years(): number {
    return this.units.years;
  }
  /**
   * How many months this timespan holds.
   * @type {number}
   */
  get months(): number {
    return this.units.months;
  }
  /**
   * How many weeks this timespan holds.
   * @type {number}
   */
  get weeks(): number {
    return this.units.weeks;
  }
  /**
   * How many days this timespan holds.
   * @type {number}
   */
  get days(): number {
    return this.units.days;
  }
  /**
   * How many hours this timespan holds.
   * @type {number}
   */
  get hours(): number {
    return this.units.hours;
  }
  /**
   * How many minutes this timespan holds.
   * @type {number}
   */
  get minutes(): number {
    return this.units.minutes;
  }
  /**
   * How many seconds this timespan holds.
   * @type {number}
   */
  get seconds(): number {
    return this.units.seconds;
  }
}

function years(amount: number) {
  return amount * 290304e5;
}

function months(amount: number) { // in here we consider months are 4 weeks
  return amount * 24192e5;
}

function weeks(amount: number) {
  return amount * 6048e5;
}

function days(amount: number) {
  return amount * 864e5;
}

function hours(amount: number) {
  return amount * 36e5;
}

function minutes(amount: number) {
  return amount * 6e4;
}

function seconds(amount: number) {
  return amount * 1e3;
}

Time.years = years;
Time.months = months;
Time.weeks = weeks;
Time.days = days;
Time.hours = hours;
Time.minutes = minutes;
Time.seconds = seconds;

export default Time;
