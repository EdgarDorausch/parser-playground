import { CompiledAstNode, CompiledAstNode_Operation, CompiledAstNode_Number } from './compiledAstNode';

class DefinitionTable {
  map: {[k: string]: number} = {}

  add(varName: string, value: number) {
    this.map[varName] = value;
  }

  get(varName: string) {
    const value = this.map[varName];

    if(value === undefined)
      throw new Error(`Variable '${varName}' is not defined!`);

    return value;
  }
}

const myTable = new DefinitionTable();
myTable.add('x', 100);


interface OperationSpec {
  prec: number,
  fun: (a: number, b: number) => number
}

type OpMap = {[k: string]: OperationSpec}

class OperationMap{
  constructor(private opSpecs: OpMap) {}

  getOpSpec(opName: string): OperationSpec {
    const spec = this.opSpecs[opName];

    if(spec === undefined)
      throw new Error();

    return spec;
  }
}

const opMap = new OperationMap({
  '+': {prec: 0, fun: (a,b) => a+b},
  '-': {prec: 0, fun: (a,b) => a-b},
  '*': {prec: 1, fun: (a,b) => a*b},
  '/': {prec: 1, fun: (a,b) => a/b},
})

export abstract class IntermediateAstNode {
  toString(): string {
    return this._toString(0);
  }

  abstract _toString(indent: number): string
  abstract compile(): CompiledAstNode;
}

export class IntermediateAstNode_Number extends IntermediateAstNode {
  constructor(public value: number) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Number: ${this.value}`;
  }

  eval() {
    return this.value;
  }

  compile(): CompiledAstNode {
    return new CompiledAstNode_Number(this.value);
  }

}

export class IntermediateAstNode_Operation extends IntermediateAstNode {
  constructor(public opName: string, public left: IntermediateAstNode, public right: IntermediateAstNode) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Operator: ${this.opName}\n` +
      this.left._toString(indent+1) + '\n' +
      this.right._toString(indent+1);
  }

  compile(): CompiledAstNode {
    const alpha = this.left;
    const op = this.opName;
    const spec = opMap.getOpSpec(op);
    const x = this.right.compile();

    const sorted = alpha.compile();
    if (sorted instanceof CompiledAstNode_Operation) {
      const beta = sorted.left;
      const op_ = sorted.opName;
      const spec_ = opMap.getOpSpec(op_);

      const gamma = sorted.right;

      return spec_.prec >= spec.prec ?
        // (b op' c) op x
        new CompiledAstNode_Operation(op, spec.fun ,sorted, x) :
        // b op' (c op x)
        new CompiledAstNode_Operation(op_, spec_.fun, beta, new CompiledAstNode_Operation(op, spec.fun,gamma, x))
    } else {
      return new CompiledAstNode_Operation(op, spec.fun, sorted, x)
    }

  }
}

export class IntermediateAstNode_Bracket extends IntermediateAstNode {
  constructor(public child: IntermediateAstNode) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `Brackets:\n` +
      this.child._toString(indent+1)
  }

  compile(): CompiledAstNode {
    return this.child.compile()
  }
}

export class IntermediateAstNode_VariableUsage extends IntermediateAstNode {
  constructor(public varName: string) {
    super();
  }

  _toString(indent: number) {
    return '  '.repeat(indent) + `VariableUsage: ${this.varName}`;
  }

  compile(): CompiledAstNode {
    return new CompiledAstNode_Number(myTable.get(this.varName));
  }
}