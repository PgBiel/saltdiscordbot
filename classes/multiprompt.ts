import { Storage } from "saltjs";

export type MPromptFunc<R = any> = (this: Question, q: Question) => R;
export class Question {
  public text: string;
  public func: MPromptFunc;
  public branches: Storage<string, Question>;
  public prompt: MultiPrompt;
  public parent?: Question;

  /**
   * Constructs a question
   * @param {string} str The question
   * @param {Function} func The function
   */
  constructor(str: string, func: MPromptFunc) {
    this.text = str || "";
    if (typeof func === "function") {
      this.func = func;
    }
    this.branches = new Storage<string, Question>();
    this.parent = null;
  }

  /**
   * Add a branch from this question
   * @param {*} name A name for the branch
   * @param {string} str The next question (or blank string if dead-end)
   * @param {Function} func The function
   * @returns {Question} The new branch
   */
  public addBranch(name: string, str: string, func: MPromptFunc) {
    const quest = new Question(str, func);
    quest.parent = this;
    quest.prompt = this.prompt;
    this.branches.set(name, quest);
    return quest;
  }

  /**
   * Go to a branch
   * @param {string} name Branch name
   * @returns {Question} The branch that it was switched to
   */
  public branch(name: string) {
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
  public changeText(str: string) {
    this.text = str || "";
    return this;
  }

  /**
   * Change the question function
   * @param {Function} func The new function
   * @returns {this}
   */
  public changeFunc(func: MPromptFunc) {
    if (typeof func === "function") {
      this.func = func;
    } else {
      this.func = function() {/* merp */};
    }
    return this;
  }

  /**
   * Execute this question
   * @param {...*} args
   * @returns {*}
   */
  public exec(...args) {
    return this.func.apply(this, [this, ...args]);
  }
}

/**
 * Allows you to prompt multiple times
 */
export class MultiPrompt { // tslint:disable-line:max-classes-per-file
  public static Question: typeof Question;
  public static MultiPrompt: typeof MultiPrompt;

  public first: Question;
  public current: Question;

  /**
   * Create a multiprompt. This sets the first question
   * @param {string} str The question text
   * @param {Function} func The function
   */
  constructor(str: string, func: MPromptFunc) {
    this.first = new Question(str, func);
    this.first.prompt = this;
    this.current = this.first;
  }

  /**
   * Add a branch from the current question
   * @param {string} name A name for the branch
   * @param {string} str The question text
   * @param {Function} func The function
   * @returns {Question}
   */
  public addBranch(name: string, str: string, func: MPromptFunc): Question {
    return this.current.addBranch(name, str, func);
  }

  /**
   * Go to a branch
   * @param {string} name Branch name
   * @returns {Question}
   */
  public branch(name: string): Question {
    return this.current.branch(name);
  }

  /**
   * Change the current question's text
   * @param {string} str The new question text
   * @returns {Question}
   */
  public changeText(str: string): Question {
    return this.current.changeText(str);
  }

  /**
   * Change the current question's function
   * @param {Function} func The new function
   * @returns {Question}
   */
  public changeFunc(func: MPromptFunc) {
    return this.current.changeFunc(func);
  }

  /**
   * Execute the current question
   * @param {...*} args args to pass (...)
   * @returns {*}
   */
  public exec(...args) {
    return this.current.exec.apply(this.current, args);
  }

  /**
   * Goes to the first question
   * @returns {Question}
   */
  public toFirst() {
    this.current = this.first;
    return this.current;
  }

  /**
   * Goes to the parent question
   * @returns {Question}
   */
  public parent() {
    if (this.current.parent) {
      this.current = this.current.parent;
    }
    return this.current;
  }
}

MultiPrompt.MultiPrompt = MultiPrompt;
MultiPrompt.Question = Question;

export default MultiPrompt;
