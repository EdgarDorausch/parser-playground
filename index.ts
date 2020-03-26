import { calcParse } from './grammar';

let ast = calcParse(
  '1 - 4 * 5'
).ast;
ast = ast.opSort()
console.log(ast.toString())
console.log(ast.eval())

