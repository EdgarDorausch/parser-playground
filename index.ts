import { calcParse } from './parser';
import { toAst } from './visitor';


const str = '1 - 2 * 3';

let ast = toAst(str);
// ast = ast.precSort()
console.log(ast)
// console.log(ast.eval())

