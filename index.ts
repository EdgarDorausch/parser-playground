import { toAst } from './visitor';
import { Tokens, allTokens } from './tokens';
import { DefinitionTable } from './intermediate-ast-node';
import { ReplSession, AutoInterface, CliInterface } from './session';

const defTable = new DefinitionTable();
defTable.add('x', 100);

function *expressions() {
  yield 'let y = 7';
  yield 'y + 3';
  yield 'let x = 5*y';
  yield 'let x = 5*x';
}
const clii = new CliInterface();
const ai = new AutoInterface(expressions(), clii)
const session = new ReplSession(ai)
session.run()



// rl.question('>>> ', (answer) => {
  
//   let ast = toAst(answer, defTable);
//   console.log(ast.toString())
//   console.log(ast.eval({defTable}))

//   rl.close();
// });
