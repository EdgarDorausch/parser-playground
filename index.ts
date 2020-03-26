import { toAst } from './visitor';
import { Tokens, allTokens } from './tokens';


const str = '1 - (2 * 6)';

let ast = toAst(str);
// ast = ast.precSort()
console.log(ast)
// console.log(ast.eval())