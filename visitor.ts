import { calcParse, Visitor, CalculatorLexer, CalculatorParser, parser } from './parser';
import { CstChildrenDictionary, CstNode } from 'chevrotain';

class CalculatorInterpreter extends Visitor {
  constructor() {
    super()
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor()
  }

  Expr(ctx: CstChildrenDictionary) {
    console.log(ctx)
    this.visit(ctx.$rightSide as CstNode[])
  }

  Expr$rightSide(ctx: CstChildrenDictionary) {
    console.log(ctx)
  }

  Operand(ctx: CstChildrenDictionary) {

  }

  bracketExpr(ctx: CstChildrenDictionary) {

  }
}

const toAstVisitorInstance = new CalculatorInterpreter()

export function toAst(inputText: string) {
  // Lex
  const lexResult = CalculatorLexer.tokenize(inputText)
  parser.input = lexResult.tokens

  // Automatic CST created when parsing
  const cst = parser.Expr()
  if (parser.errors.length > 0) {
      throw Error(
          "Sad sad panda, parsing errors detected!\n" +
              parser.errors[0].message
      )
  }

  // Visit
  const ast = toAstVisitorInstance.visit(cst)
  return ast
}