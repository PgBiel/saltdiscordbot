// old Time file
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper class for representing timespans.
 */
class Time {
    /**
     * @param {Date|number|Time} [dateOrMsOrTime=0] An optional date to get its time since Jan 1, 1970;
     * an initial amount of milliseconds or a Time instance.
     */
    constructor(dateOrMsOrTime = 0) {
        this.time = dateOrMsOrTime instanceof Date ?
            dateOrMsOrTime.getTime() :
            dateOrMsOrTime instanceof Time ?
                dateOrMsOrTime.time :
                dateOrMsOrTime;
    }
    add(unitOrMsOrTime, amount) {
        const oldTime = this.time;
        if (unitOrMsOrTime instanceof Time) {
            this.time += unitOrMsOrTime.time;
        }
        else if (typeof unitOrMsOrTime !== "number") {
            const unitCase = unitOrMsOrTime.toLowerCase();
            const map = ["year", "month", "week", "day", "hour", "minute", "second"];
            const mapPlural = map.map((str) => str + "s");
            let funcToUse;
            if (map.includes(unitCase)) {
                funcToUse = unitCase + "s";
            }
            else if (mapPlural.includes(unitCase)) {
                funcToUse = unitCase;
            }
            else {
                throw new TypeError("Invalid unit!");
            }
            this.time += Time[funcToUse](amount);
        }
        else {
            this.time += unitOrMsOrTime;
        }
        return oldTime;
    }
    remove(unitOrMsOrTime, amount) {
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
    clear() {
        const oldSpan = this.time;
        this.time = 0;
        return oldSpan;
    }
    /**
     * When concatenated with a string, this returns the units and their respective
     * amounts, separated by comma. E.g.: "1 year, 2 months and 4 seconds".
     */
    toString() {
        const unitObj = this.units;
        let result = "";
        Object.entries(unitObj).forEach(([unit, amount]) => {
            if (amount === 0) {
                if (!result && unit === "seconds") {
                    result = "0 seconds";
                }
                return;
            }
            const toUse = amount === 1 ? unit.replace(/s$/i, "") : unit;
            if (!result) {
                result = `${amount} ${toUse}`;
            }
            else if (result.includes("and")) {
                result = result.replace(/\s*and(\s*\d+\s*\w+)$/i, ",$1 and");
                result += ` ${amount} ${toUse}`;
            }
            else {
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
        let diff = this.time;
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 4 * 12));
        diff -= years * (1000 * 60 * 60 * 24 * 7 * 4 * 12);
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 4));
        diff -= months * (1000 * 60 * 60 * 24 * 7 * 4);
        const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
        diff -= weeks * (1000 * 60 * 60 * 24 * 7);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const mins = Math.floor(diff / (1000 * 60));
        diff -= mins * (1000 * 60);
        const seconds = Math.floor(diff / (1000));
        diff -= seconds * (1000);
        return { years, months, weeks, days, hours, minutes: mins, seconds };
    }
    /**
     * How many years this timespan holds.
     * @type {number}
     */
    get years() {
        return this.units.years;
    }
    /**
     * How many months this timespan holds.
     * @type {number}
     */
    get months() {
        return this.units.months;
    }
    /**
     * How many weeks this timespan holds.
     * @type {number}
     */
    get weeks() {
        return this.units.weeks;
    }
    /**
     * How many days this timespan holds.
     * @type {number}
     */
    get days() {
        return this.units.days;
    }
    /**
     * How many hours this timespan holds.
     * @type {number}
     */
    get hours() {
        return this.units.hours;
    }
    /**
     * How many minutes this timespan holds.
     * @type {number}
     */
    get minutes() {
        return this.units.minutes;
    }
    /**
     * How many seconds this timespan holds.
     * @type {number}
     */
    get seconds() {
        return this.units.seconds;
    }
}
function years(amount) {
    return amount * 290304e5;
}
function months(amount) {
    return amount * 24192e5;
}
function weeks(amount) {
    return amount * 6048e5;
}
function days(amount) {
    return amount * 864e5;
}
function hours(amount) {
    return amount * 36e5;
}
function minutes(amount) {
    return amount * 6e4;
}
function seconds(amount) {
    return amount * 1e3;
}
Time.years = years;
Time.months = months;
Time.weeks = weeks;
Time.days = days;
Time.hours = hours;
Time.minutes = minutes;
Time.seconds = seconds;
exports.default = Time;
