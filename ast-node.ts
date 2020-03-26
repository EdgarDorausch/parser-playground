interface OperationSpec {
  prec: number,
  fun: (a: number, b: number) => number
}

type OpMap = {[k: string]: OperationSpec}

function getPrecedence(opName: string): number {
  const spec = opMap[opName];

  if(spec === undefined)
    throw new Error();

  return spec.prec;
}




const opMap: OpMap = {
  '+': {prec: 0, fun: (a,b) => a+b},
  '-': {prec: 0, fun: (a,b) => a-b},
  '*': {prec: 1, fun: (a,b) => a*b},
  '/': {prec: 1, fun: (a,b) => a/b},
}

export abstract class AstNode {
  toString(): string {
    return this._toString(0);
  }

  abstract _toString(indent: number): string
  abstract eval(): number;
  abstract precSort(): AstNode;
}

export class AstNode_Number extends AstNode {
  constructor(public value: number) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Number: ${this.value}`;
  }

  eval() {
    return this.value;
  }

  precSort() {
    return this;
  }

}

export class AstNode_Operation extends AstNode {
  constructor(public opName: string, public left: AstNode, public right: AstNode) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Operator: ${this.opName}\n` +
      this.left._toString(indent+1) + '\n' +
      this.right._toString(indent+1);
  }

  eval() {
    const spec = opMap[this.opName];
    if (spec === undefined)
      throw new Error()

    return spec.fun(this.left.eval(), this.right.eval())
  }

  precSort(): AstNode {
    const alpha = this.left;
    const op = this.opName;
    const x = this.right;

    const sorted = alpha.precSort();
    if (sorted instanceof AstNode_Operation) {
      const beta = sorted.left;
      const op_ = sorted.opName;
      const gamma = sorted.right;
      return getPrecedence(op_) >= getPrecedence(op) ?
        // (b op' c) op x
        new AstNode_Operation(op, sorted, x) :
        // b op' (c op x)
        new AstNode_Operation(op_, beta, new AstNode_Operation(op, gamma, x))
    } else {
      return new AstNode_Operation(this.opName, sorted, x)
    }

  }
}

export class AstNode_Bracket extends AstNode {
  constructor(public child: AstNode) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Brackets:\n` +
      this.child._toString(indent+1)
  }

  eval() {
    return this.child.eval()
  }

  precSort() {
    return this.child.precSort()
  }
}