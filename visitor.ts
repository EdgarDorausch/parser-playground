import { CalculatorParser, parser } from './parser';
import { CstChildrenDictionary, CstNode, ICstVisitor, IToken } from 'chevrotain';
import { lexer } from './lexer';
import { AstNode, AstNode_Operation, AstNode_Number, AstNode_Bracket } from './ast-node';
import { IntermediateAstNode_Number, IntermediateAstNode, IntermediateAstNode_Operation, IntermediateAstNode_Bracket, IntermediateAstNode_VariableUsage } from './intermediate-ast-node';


const VisitorCnstr: {new (...args: any[]): ICstVisitor<any, IntermediateAstNode>}  = parser.getBaseCstVisitorConstructor();


class CalculatorInterpreter extends VisitorCnstr {
  constructor() {
    super()
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor()
  }

  Expr(ctx: CstChildrenDictionary): IntermediateAstNode {
    // console.log(ctx)

    let astRoot = this.visit(<CstNode>ctx.leftOperand[0]);

    for(let i=0; i < ctx.OpName?.length ?? 0; i++) {
      const opName = (<IToken>ctx.OpName[i]).image;
      const rightOperand = this.visit(<CstNode>ctx.manyOperand[i])

      astRoot = new IntermediateAstNode_Operation(opName, astRoot, rightOperand);
    }

    return astRoot;
  }

  Operand(ctx: CstChildrenDictionary) {
    // console.log(ctx);

    if(ctx.NumberLiteral) {
      return new IntermediateAstNode_Number(Number((<IToken>ctx.NumberLiteral[0]).image));
    } else if(ctx.VarName) {
      return new IntermediateAstNode_VariableUsage((<IToken>ctx.VarName[0]).image);
    } else {
      return this.visit(<CstNode>ctx.bracketExpr[0]);
    }   
  }

  bracketExpr(ctx: CstChildrenDictionary) {
    const child =  this.visit(<CstNode>ctx.Expr[0]);
    return new IntermediateAstNode_Bracket(child);
  }
}




const toAstVisitorInstance = new CalculatorInterpreter()

export function toAst(inputText: string) {
  // Lex
  const lexResult = lexer.tokenize(inputText)
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
  return ast //.compile()
}