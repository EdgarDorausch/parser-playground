import { createToken, Lexer, CstParser, EmbeddedActionsParser } from "chevrotain";
import { allTokens, Tokens } from './tokens';

export class CalculatorParser extends CstParser {
  constructor() {
    super(allTokens)
    this.performSelfAnalysis()
  }

  public Statement = this.RULE("Statement", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.VarDefinition) },
      { ALT: () => this.SUBRULE(this.Expr) }
    ])
  })

  public VarDefinition = this.RULE("VarDefinition", () => {
    this.CONSUME(Tokens.LetToken);
    this.CONSUME(Tokens.VarName);
    this.CONSUME(Tokens.EqualSign);
    this.SUBRULE(this.Expr);
  })

  public Expr = this.RULE("Expr", () => {
    this.SUBRULE1(this.Operand, {LABEL: 'leftOperand'});

    this.MANY({
      DEF: () => {
        this.CONSUME(Tokens.OpName);
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
    this.OR([
      { ALT: () => this.SUBRULE(this.bracketExpr) },
      { ALT: () => this.CONSUME(Tokens.VarName) },
      { ALT: () => this.CONSUME(Tokens.NumberLiteral) },
    ])
  })
}

// reuse the same parser instance.
export const parser = new CalculatorParser()
