const { moment, Time } = require("../misc/d");
const dur = (...args) => moment.duration(...args);

class IntervalClass {
    constructor(initialVal) {
        this.duration = dur();
        this.add(initialVal);
    }
    
    /**
     * Modify the current value.
     * @param {string} type The type. Must be either "add" or "remove".
     * @param {IntervalClass|Date|Time|string|number|Array<[string, number]>} unitOrQuantity Unit or quantity.
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
        if (unitOrQuantity instanceof IntervalClass) {
            func(unitOrQuantity.duration);
        } else if (moment.isDuration(unitOrQuantity)) {
            func(unitOrQuantity);
        } else if (unitOrQuantity instanceof Date) {
            func(unitOrQuantity.getTime());
        } else if (unitOrQuantity instanceof Time) {
            func(unitOrQuantity.time);
        } else if (typeof unitOrQuantity === "string") {

        }
    }

    /**
     * Adds to the current value.
     * @param {IntervalClass|Date|Time|string} unitOrQuantity Unit or quantity.
     * @param {number} [amount=0] The amount, if unit is specified.
     * @returns {this}
     */
    add(unitOrQuantity, amount) {
        return this.modify("add", unitOrQuantity, amount);
    }

    /**
     * Removes from the current value.
     * @param {IntervalClass|Date|Time|string} unitOrQuantity Unit or quantity.
     * @param {number} [amount=0] The amount, if unit is specified.
     * @returns {this}
     */
    remove(unitOrQuantity, amount) {
        return this.modify("remove", unitOrQuantity, amount);
    }
}

const Interval = function (...args) { return new IntervalClass(...args); };
Interval.Interval = Interval;
Interval.IntervalClass = IntervalClass;