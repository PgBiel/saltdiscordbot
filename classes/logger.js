class Logger extends EventEmitter {
  /**
   * Print information
   * @param {string} text The text to print in console
   * @returns {void}
   */
  info(...text) {
    console.log.apply(this, [colors.blue("[INFO]"), ...text]);
    this.emit("info", text);
  }

  /**
   * Print debug
   * @param {string} text The text to print in console
   * @returns {void}
   */
  debug(...text) {
    console.log.apply(this, [colors.green("[DEBUG]"), ...text]);
    this.emit("debug", text);
  }

  /**
   * Print an error
   * @param {string} text The text to print in console
   * @returns {void}
   */
  error(...text) {
    console.error.apply(this, [colors.red("[ERROR]"), ...text]);
    this.emit("info", text);
  }

  /**
   * Print a warning
   * @param {string} text The text to print in console
   * @returns {void}
   */
  warn(...text) {
    console.log.apply(this, [colors.yellow("[WARN]"), ...text]);
    this.emit("warn", text);
  }

  /**
   * Custom-print some text
   * @param {string} text The text to print in console
   * @param {string} [prefix="[GENERIC]"] The prefix
   * @param {string} [color="cyan"] The color
   * @param {string} [type="log"] The type (Console property to use as function)
   */
  custom(text, prefix = "[GENERIC]", color = "cyan", type = "log") {
    console[type].apply(this, [colors[color](prefix), text]);
    this.emit("custom", { text, prefix, color, type });
  }

  /**
   * Print information
   * @param {string} text The text to print in console
   * @returns {void}
   */
  log(...text) {
    return this.info.apply(this, text);
  }
}

module.exports = new Logger;