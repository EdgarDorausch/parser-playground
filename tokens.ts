import { createToken, Lexer } from 'chevrotain';

const WhiteSpace =createToken({ name: "WhiteSpace", pattern: /[ \t\n\r]+/, group: Lexer.SKIPPED});

export const Tokens = {
  LBracket:           createToken({ name: "LBracket",           pattern: /\(/ }),
  RBracket:           createToken({ name: "RBracket",           pattern: /\)/ }),
  OpName:             createToken({ name: "OpName",             pattern: /(\*|\+|\\|=|-|~|%|!|<|>|\/)+/}),
  VarName:            createToken({ name: "VarName",            pattern: /[a-z]+/}),
  // FunctionIdentifier: createToken({ name: "FunctionIdentifier", pattern: /[a-z]+/}),
  NumberLiteral:      createToken({ name: "NumberLiteral",      pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/}),
}

export const allTokens = [WhiteSpace, ...Object.values(Tokens)]