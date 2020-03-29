import { createToken, Lexer } from 'chevrotain';

const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /[ \t\n\r]+/, group: Lexer.SKIPPED});

const Keywords = {
  LET: 'let',
  DELETE: 'delete',
}
const withoutKeywords = new RegExp(`(?!${Object.values(Keywords).join('|')}\\b)\\b\\w+`)
console.log(withoutKeywords.source)

export const Tokens = {
  LetToken:           createToken({ name: "LetToken",           pattern: Keywords.LET}),
  LBracket:           createToken({ name: "LBracket",           pattern: /\(/ }),
  RBracket:           createToken({ name: "RBracket",           pattern: /\)/ }),
  OpName:             createToken({ name: "OpName",             pattern: /(\*|\+|\\|=|-|~|%|!|<|>|\/)+/}),
  NumberLiteral:      createToken({ name: "NumberLiteral",      pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/}),
  VarName:            createToken({ name: "VarName",            pattern: withoutKeywords}),
  // FunctionIdentifier: createToken({ name: "FunctionIdentifier", pattern: /[a-z]+/}),
}

export const allTokens = [WhiteSpace, ...Object.values(Tokens)]