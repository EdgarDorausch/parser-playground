import { toAst } from './visitor';
import { Tokens, allTokens } from './tokens';
import * as readline from 'readline';
import { DefinitionTable } from './intermediate-ast-node';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const defTable = new DefinitionTable();
defTable.add('x', 100);


// rl.question('>>> ', (answer) => {
  
//   let ast = toAst(answer, defTable);
//   console.log(ast.toString())
//   console.log(ast.eval({defTable}))

//   rl.close();
// });

const str = 'let y = 7';
let ast = toAst(str, defTable);
console.log(ast.toString())
console.log(ast.eval({defTable}))

ast = toAst('y + 3', defTable);
console.log(ast.toString())
console.log(ast.eval({defTable}))