import { calcParse } from './grammar';

let ast = calcParse(
  '1 - 4 * 2 + 5'
).ast;
ast = ast.precSort()
console.log(ast.toString())
console.log(ast.eval())

