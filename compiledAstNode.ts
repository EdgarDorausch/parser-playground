export abstract class CompiledAstNode {
  toString(): string {
    return this._toString(0);
  }

  abstract _toString(indent: number): string
  abstract eval(): number;
}

export class CompiledAstNode_Number extends CompiledAstNode {
  constructor(public value: number) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Number: ${this.value}`;
  }

  eval() {
    return this.value;
  }
}

export class CompiledAstNode_Operation extends CompiledAstNode {
  constructor(
    public opName: string,
    public fun: (a: number, b: number) => number,
    public left: CompiledAstNode,
    public right: CompiledAstNode) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Operator: ${this.opName}\n` +
      this.left._toString(indent+1) + '\n' +
      this.right._toString(indent+1);
  }

  eval() {
    return this.fun(this.left.eval(), this.right.eval())
  }
}
