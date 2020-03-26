import { createToken, Lexer, CstParser, EmbeddedActionsParser } from "chevrotain";
import { allTokens, Tokens } from './tokens';

export class CalculatorParser extends CstParser {
  constructor() {
    super(allTokens)
    this.performSelfAnalysis()
  }

  public Expr = this.RULE("Expr", () => {
    this.SUBRULE1(this.Operand, {LABEL: 'leftOperand'});

    this.MANY({
      DEF: () => {
        this.CONSUME(Tokens.OpName).image;
        this.SUBRULE2(this.Operand, {LABEL: 'manyOperand'});
      }
    })
  })

  public bracketExpr = this.RULE("bracketExpr", () => {
    this.CONSUME(Tokens.LBracket)
    this.SUBRULE(this.Expr)
    this.CONSUME(Tokens.RBracket)
  })

  public Operand = this.RULE("Operand", () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.bracketExpr) },
      { ALT: () => {
        this.CONSUME(Tokens.NumberLiteral).image
      } },
    ])
  })
}

// reuse the same parser instance.
export const parser = new CalculatorParser()


function log<T>(x: T): T {
  // console.log(x);
  return x;
}

