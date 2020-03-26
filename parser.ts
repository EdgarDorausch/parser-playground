import { createToken, Lexer, CstParser, EmbeddedActionsParser } from "chevrotain";
import { allTokens, Tokens } from './tokens';








const funMap: any = {
  sin: Math.sin,
  cos: Math.cos,
  sqrt: Math.sqrt
}

export class CalculatorParser extends CstParser {
  constructor() {
    super(allTokens)
    this.performSelfAnalysis()
  }

  public Expr = this.RULE("Expr", () => {
    // let val = 0;

    // let astRoot: AstNode = 
    this.SUBRULE1(this.Operand, {LABEL: 'leftOperand'});

    this.MANY({
      DEF: () => {
        // const opName = 
        this.CONSUME(Tokens.OpName).image;
        // let newOperand: AstNode = 
        this.SUBRULE2(this.Operand, {LABEL: 'manyOperand'});

        // astRoot = new AstNode_Operation(opName, astRoot, newOperand)
      }
    })

    // return astRoot;
  })

  public bracketExpr = this.RULE("bracketExpr", () => {
    this.CONSUME(Tokens.LBracket)
    // let astNode = new AstNode_Bracket(
    this.SUBRULE(this.Expr)
      // );
    this.CONSUME(Tokens.RBracket)

    // return astNode;
  })

  public Operand = this.RULE("Operand", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.bracketExpr) },
      { ALT: () => {
        // const num = Number(
        this.CONSUME(Tokens.NumberLiteral).image
        // )
        // return new AstNode_Number(num)
      } },
    ])
  })
}

// reuse the same parser instance.
export const parser = new CalculatorParser()


// export function calcParse(text: string) {
//   const lexResult = CalculatorLexer.tokenize(text)
//   // setting a new input will RESET the parser instance's state.
//   parser.input = log(lexResult.tokens)
//   // any top level rule may be used as an entry point
//   const ast = parser.Expr();

//   // this would be a TypeScript compilation error because our parser now has a clear API.
//   // let value = parser.json_OopsTypo()

//   return {
//     // This is a pure grammar, the value will be undefined until we add embedded actions
//     // or enable automatic CST creation.
//     ast: ast,
//     lexErrors: lexResult.errors,
//     parseErrors: parser.errors
//   }
// }

function log<T>(x: T): T {
  // console.log(x);
  return x;
}

