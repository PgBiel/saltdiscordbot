const { _, moment, Time } = require("../misc/d");
const dur = (...args) => moment.duration(...args);

const ALIASES = {
  years: ["years", "year", "y"],
  year: ["years", "year", "y"],
  y: ["years", "year", "y"],

  months: ["months", "month", "mo"],
  month: ["months", "month", "mo"],
  mo: ["months", "month", "mo"],

  weeks: ["weeks", "week", "w"],
  week: ["weeks", "week", "w"],
  w: ["weeks", "week", "w"],

  days: ["days", "day", "d"],
  day: ["days", "day", "d"],
  d: ["days", "day", "d"],

  hours: ["hours", "hour", "h"],
  hour: ["hours", "hour", "h"],
  h: ["hours", "hour", "h"],

  minutes: ["minutes", "minute", "mins", "min", "m"],
  minute: ["minutes", "minute", "mins", "min", "m"],
  mins: ["minutes", "minute", "mins", "min", "m"],
  min: ["minutes", "minute", "mins", "min", "m"],
  m: ["minutes", "minute", "mins", "min", "m"],

  seconds: ["seconds", "second", "secs", "sec", "s"],
  second: ["seconds", "second", "secs", "sec", "s"],
  sec: ["seconds", "second", "secs", "sec", "s"],
  secs: ["seconds", "second", "secs", "sec", "s"],
  s: ["seconds", "second", "secs", "sec", "s"]
};

class Interval {
  constructor(initialVal) {
    this.duration = dur();
    if (!isNaN(initialVal)) this.add(initialVal);
  }
  
  /**
   * Modify the current value.
   * @param {string} type The type. Must be either "add" or "remove".
   * @param {Interval|Date|Time|string|number|Array<[string, number]>} unitOrQuantity Unit or quantity.
   * @param {number} [amount=0] The amount, if unit is specified.
   * @returns {this}
   */
  modify(type, unitOrQuantity, amount) {
    if (amount == null) amount = 0;
    if (typeof type !== "string") return this;
    const lowerType = type.toLowerCase();
    if (!["add", "remove"].includes(lowerType)) return this;
    let func;
    if (lowerType === "add") {
      func = (...args) => this.duration.add(...args);
    } else {
      func = (...args) => this.duration.subtract(...args);
    }
    if (unitOrQuantity instanceof Interval) {
      func(unitOrQuantity.duration);
    } else if (moment.isDuration(unitOrQuantity)) {
      func(unitOrQuantity);
    } else if (unitOrQuantity instanceof Date) {
      func(unitOrQuantity.getTime());
    } else if (unitOrQuantity instanceof Time) {
      func(unitOrQuantity.time);
    } else if (typeof unitOrQuantity === "number") {
      if (isNaN(unitOrQuantity)) return this;
      func(unitOrQuantity);
    } else if (typeof unitOrQuantity === "string") {
      const str = unitOrQuantity.toLowerCase();
      if (!(str in ALIASES)) throw new TypeError("Invalid unit!");
      const num = Number(amount);
      if (isNaN(num)) return this;
      func(num, ALIASES[str][0]);
    } else if (Array.isArray(unitOrQuantity)) {
      if (unitOrQuantity.length < 1) return this;
      const arr = _.flatten(unitOrQuantity);
      for (let i = 0; i < arr.length; i += 2) {
        const item = String(item).toLowerCase();
        if (!(item in ALIASES)) continue;
        if (i + 1 >= arr.length) continue;
        const amount = arr[i + 1];
        if (isNaN(amount)) continue;
        func(amount, ALIASES[item][0]);
      }
    } else {
      return this;
    }
  }

  /**
   * Adds to the current value.
   * @param {Interval|Date|Time|string|number|Array<[string, number]>} unitOrQuantity Unit or quantity.
   * @param {number} [amount=0] The amount, if unit is specified.
   * @returns {this}
   */
  add(unitOrQuantity, amount) {
    return this.modify("add", unitOrQuantity, amount);
  }

  /**
   * Removes from the current value.
   * @param {Interval|Date|Time|string|number|Array<[string, number]>} unitOrQuantity Unit or quantity.
   * @param {number} [amount=0] The amount, if unit is specified.
   * @returns {this}
   */
  remove(unitOrQuantity, amount) {
    return this.modify("remove", unitOrQuantity, amount);
  }

  /**
   * Removes from the current value.
   * @param {Interval|Date|Time|string|number|Array<[string, number]>} unitOrQuantity Unit or quantity.
   * @param {number} [amount=0] The amount, if unit is specified.
   * @returns {this}
   */
  subtract(unitOrQuantity, amount) {
    return this.remove(unitOrQuantity, amount);
  }
  
  /**
   * Clears the current duration.
   * @returns {this}
   */
  clear() {
    this.duration = dur();
    return this;
  }
  
  toString() {
    const units = this.units;
    let result = "";
    for (const [unit, num] of Object.entries(units)) {
      if (num === 0) {
        if (!result && unit === "seconds") {
          result = "0 seconds";
        }
        continue;
      }
      const strToUse = num === 1 ? unit.replace(/s$/i, "") : unit;
      if (!result) {
        result = `${num} ${strToUse}`;
      } else if (result.includes("and")) {
        result = result.replace(/\s*and(\s*\d+\s*\w+)$/i, ",$1 and");
        result += ` ${num} ${strToUse}`;
      } else {
        result += ` and ${num} ${strToUse}`;
      }
    }
    return result;
  }

  // getters
  get years() { return this.duration.years(); }
  get months() { return this.duration.months(); }
  get weeks() { return this.duration.weeks(); }
  get days() { return this.duration.days(); }
  get hours() { return this.duration.hours(); }
  get minutes() { return this.duration.minutes(); }
  get seconds() { return this.duration.seconds(); }

  get totalYears() { return this.duration.asYears(); }
  get totalMonths() { return this.duration.asMonths(); }
  get totalWeeks() { return this.duration.asWeeks(); }
  get totalDays() { return this.duration.asDays(); }
  get totalHours() { return this.duration.asHours(); }
  get totalMinutes() { return this.duration.asMinutes(); }
  get totalSeconds() { return this.duration.asSeconds(); }
  get time() { return this.duration.asMilliseconds(); }

  get ISO() { return this.duration.toISOString(); }
  get valueOf() { return this.ISO; }
  get date() { return new Date(this.time); }

  get units() {
    return {
      years: this.years,
      months: this.months,
      weeks: this.weeks,
      days: this.days,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds
    };
  }
}

// utilities
Interval.Interval = Interval;
Interval.Interval = Interval;
Interval.ALIASES = ALIASES;
Interval.validUnit = str => String(str).toLowerCase() in ALIASES;

// methods
Interval.years = (num = 1) => Interval(["years", 1]);
Interval.months = (num = 1) => Interval(["months", 1]);
Interval.weeks = (num = 1) => Interval(["weeks", 1]);
Interval.days = (num = 1) => Interval(["days", 1]);
Interval.hours = (num = 1) => Interval(["hours", 1]);
Interval.minutes = (num = 1) => Interval(["minutes", 1]);
Interval.seconds = (num = 1) => Interval(["seconds", 1]);

module.exports = Interval;