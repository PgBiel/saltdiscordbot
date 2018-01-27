const Storage = require("saltjs").Storage;

class Question {
  /**
   * Constructs a question
   * @param {string} str The question
   * @param {Function} func The function
   */
  constructor(str, func) {
    this.text = str || "";
    if (typeof func == "function") {
      this.func = func;
    } else {
      this.func = function () {};
    }
    this.branches = new Storage();
    this.parent = null;
  }

  /**
   * Add a branch from this question
   * @param {*} name A name for the branch
   * @param {string} str The next question (or blank string if dead-end)
   * @param {Function} func The function
   * @returns {Question} The new branch
   */
  addBranch(name, str, func) {
    const quest = new Question(str, func);
    quest.parent = this;
    quest.prompt = this.prompt;
    this.branches.set(name, quest);
    return quest;
  }

  /**
   * Go to a branch
   * @param {*} name Branch name
   * @returns {Question} The branch that it was switched to
   */
  branch(name) {
    if (!this.prompt) throw new SyntaxError("To go to a branch, this question must be constructed inside a MultiPrompt.");
    if (this.branches.has(name)) {
      this.prompt.current = this.branches.get(name);
    }
    return this.prompt.current;
  }

  /**
   * Change the question text
   * @param {string} str The new question text
   * @returns {this} 
   */
  changeText(str) {
    this.text = str || "";
    return this;
  }

  /**
   * Change the question function
   * @param {Function} func The new function
   * @returns {this}
   */
  changeFunc(func) {
    if (typeof func == "function") {
      this.func = func;
    } else {
      this.func = function () {};
    }
    return this;
  }

  /**
   * Execute this question
   * @param {...*} args 
   * @returns {this}
   */
  exec(...args) {
    this.func.apply(this, args);
    return this;
  }
}

/**
 * Allows you to prompt multiple times
 */
class MultiPrompt {
  /**
   * Create a multiprompt. This sets the first question
   * @param {string} str The question text
   * @param {Function} func The function
   */
  constructor(str, func) {
    this.first = new Question(str, func);
    this.first.prompt = this;
    this.current = this.first;
  }

  /**
   * Add a branch from the current question
   * @param {*} name A name for the branch
   * @param {string} str The question text
   * @param {Function} func The function
   * @returns {Question}
   */
  addBranch(name, str, func) {
    this.current.addBranch(name, str, func);
    return this.current;
  }

  /**
   * Go to a branch
   * @param {*} name Branch name
   * @returns {Question}
   */
  branch(name) {
    this.current.branch(name);
    return this.current;
  }

  /**
   * Change the current question's text
   * @param {string} str The new question text
   * @returns {Question}
   */
  changeText(str) {
    this.current.changeText(str);
    return this.current;
  }

  /**
   * Change the current question's function
   * @param {Function} func The new function 
   * @returns {Question}
   */
  changeFunc(func) {
    this.current.changeFunc(func);
    return this.current;
  }

  /**
   * Execute the current question
   * @param {...*} args 
   * @returns {Question}
   */
  exec(...args) {
    this.current.exec.apply(this.current, args);
    return this.current;
  }

  /**
   * Goes to the first question
   * @returns {Question}
   */
  toFirst() {
    this.current = this.first;
    return this.current;
  }

  /**
   * Goes to the parent question
   * @returns {Question}
   */
  parent() {
    if (this.current.parent) {
      this.current = this.current.parent;
    }
    return this.current;
  }
}

MultiPrompt.MultiPrompt = MultiPrompt;
MultiPrompt.Question = Question;

module.exports = MultiPrompt;
