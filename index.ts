import { toAst } from './visitor';
import { Tokens, allTokens } from './tokens';
import * as readline from 'readline';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question('>>> ', (answer) => {
  
  let ast = toAst(answer);
  console.log(ast.toString())
  console.log(ast.eval())

  rl.close();
});

const str = '1 - 2 * 6 + 7';

// let ast = toAst(str);
// console.log(ast.toString())