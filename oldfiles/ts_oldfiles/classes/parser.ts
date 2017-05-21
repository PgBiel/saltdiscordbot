export abstract class Parser {
  public text: string;
  constructor(text: string) {
    this.text = text;
  }

  public abstract parse(...args: any[]): any;
}

export default Parser;
