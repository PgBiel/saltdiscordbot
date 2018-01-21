const Storage = require("saltjs").Storage;

class Question {
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

  addBranch(name, str, func) {
    const quest = new Question(str, func);
    quest.parent = this;
    quest.prompt = this.prompt;
    this.branches.set(name, quest);
    return quest;
  }

  branch(name) {
    if (!this.prompt) throw new SyntaxError("To go to a branch, this question must be constructed inside a MultiPrompt.");
    if (this.branches.has(name)) {
      this.prompt.current = this.branches.get(name);
    }
    return this.prompt.current;
  }

  changeText(str) {
    this.text = str || "";
    return this;
  }

  changeFunc(func) {
    if (typeof func == "function") {
      this.func = func;
    } else {
      this.func = function () {};
    }
    return this;
  }

  exec(...args) {
    this.func.apply(this, args);
    return this;
  }
}

class MultiPrompt {
  constructor(str, func) {
    this.first = new Question(str, func);
    this.first.prompt = this;
    this.current = this.first;
  }
  addBranch(...args) {
    this.current.addBranch.apply(this.current, args);
    return this.current;
  }
  branch(...args) {
    this.current.branch.apply(this.current, args);
    return this.current;
  }
  changeText(...args) {
    this.current.changeText.apply(this.current, args);
    return this.current;
  }
  changeFunc(...args) {
    this.current.changeFunc.apply(this.current, args);
    return this.current;
  }
  exec(...args) {
    this.current.exec.apply(this.current, args);
    return this.current;
  }
  toFirst() {
    this.current = this.first;
    return this.current;
  }
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
