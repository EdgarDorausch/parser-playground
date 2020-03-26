import { createToken, Lexer, CstParser, EmbeddedActionsParser } from "chevrotain";


type OpSpec = {prec: number, fun: (a: number, b: number) => number}
type OpMap = {[k: string]: OpSpec}
const opMap: OpMap = {
  '+': {prec: 0, fun: (a,b) => a+b},
  '-': {prec: 0, fun: (a,b) => a-b},
  '*': {prec: 1, fun: (a,b) => a*b},
  '/': {prec: 1, fun: (a,b) => a/b},
}

abstract class AstNode {
  // constructor(protected type: string) {}
  toString(): string {
    return this._toString(0);
  }

  abstract _toString(indent: number): string
  abstract eval(): number;
  abstract precSort(): AstNode;
}

class AstNode_Number extends AstNode {
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

class AstNode_Operation extends AstNode {
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
    const left1 = this.left;
    const right1 = this.right;
    const op1 = this.opName;

    if (left1 instanceof AstNode_Operation) {
      const left2 = left1.left;
      const right2 = left1.right;
      const op2 = left1.opName;
      return getPrecedence(op2) >= getPrecedence(op1) ?
        new AstNode_Operation(op1, left1.precSort(), right1.precSort()) :
        new AstNode_Operation(op2, left2.precSort(), new AstNode_Operation(op1, right2, right1).precSort())
    } else {
      return new AstNode_Operation(this.opName, left1.precSort(), right1.precSort())
    }

  }
}

class AstNode_Bracket extends AstNode {
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







const LBracket = createToken({ name: "LBracket", pattern: /\(/ });
const RBracket = createToken({ name: "RBracket", pattern: /\)/ });
const OpName = createToken({ name: "OpName", pattern: /(\*|\+|\\|=|-|~|%|!|<|>|\/)+/});


const FunctionIdentifier = createToken({
  name: "FunctionIdentifier",
  pattern: /[a-z]+/
})

const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
})
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /[ \t\n\r]+/,
  group: Lexer.SKIPPED
})

const allTokens = [
  WhiteSpace,
  NumberLiteral,
  FunctionIdentifier,
  LBracket,
  RBracket,
  OpName
]
const CalculatorLexer = new Lexer(allTokens)

const funMap: any = {
  sin: Math.sin,
  cos: Math.cos,
  sqrt: Math.sqrt
}

class CalculatorParser extends EmbeddedActionsParser {
  constructor() {
    super(allTokens)
    this.performSelfAnalysis()
  }

  // In TypeScript the parsing rules are explicitly defined as class instance properties
  // This allows for using access control (public/private/protected) and more importantly "informs" the TypeScript compiler
  // about the API of our Parser, so referencing an invalid rule name (this.SUBRULE(this.oopsType);)
  // is now a TypeScript compilation error.
  public Expr = this.RULE<AstNode>("Expr", () => {
    let val = 0;

    let astRoot: AstNode = this.SUBRULE1(this.Operand);

    this.MANY({
      DEF: () => {
        const opName = this.CONSUME(OpName).image;
        let newOperand: AstNode = this.SUBRULE2(this.Operand);

        astRoot = new AstNode_Operation(opName, astRoot, newOperand)
      }
    })

    return astRoot;
  })

  public bracketExpr = this.RULE<AstNode>("bracketExpr", () => {
    this.CONSUME(LBracket)
    let astNode = new AstNode_Bracket(this.SUBRULE(this.Expr));
    this.CONSUME(RBracket)

    return astNode;
  })

  public Operand = this.RULE<AstNode>("Operand", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.bracketExpr) },
      { ALT: () => {
        const num = Number(this.CONSUME(NumberLiteral).image)
        return new AstNode_Number(num)
      } },
    ])
  })
}

// reuse the same parser instance.
const parser = new CalculatorParser()

export function calcParse(text: string) {
  const lexResult = CalculatorLexer.tokenize(text)
  // setting a new input will RESET the parser instance's state.
  parser.input = log(lexResult.tokens)
  // any top level rule may be used as an entry point
  const ast = parser.Expr();

  // this would be a TypeScript compilation error because our parser now has a clear API.
  // let value = parser.json_OopsTypo()

  return {
    // This is a pure grammar, the value will be undefined until we add embedded actions
    // or enable automatic CST creation.
    ast: ast,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors
  }
}

function log<T>(x: T): T {
  // console.log(x);
  return x;
}

function getPrecedence(opName: string): number {
  const spec = opMap[opName];

  if(spec === undefined)
    throw new Error();

  return spec.prec;
}

