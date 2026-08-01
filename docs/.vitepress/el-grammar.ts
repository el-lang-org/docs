const keywords = [
  'def', 'defp', 'defmodule', 'defstruct', 'defprotocol', 'defimpl',
  'defer', 'do', 'else', 'end', 'if', 'for', 'in', 'match', 'mut',
  'return', 'when', 'while',
]

const builtinTypes = [
  'Self',
  'bool', 'i8', 'i16', 'i32', 'i64', 'isize',
  'u8', 'u16', 'u32', 'u64', 'usize',
  'f32', 'f64', 'rune', 'string', 'bytes', 'bits',
]

export const elLanguage = {
  name: 'el',
  scopeName: 'source.el',
  displayName: 'EL',
  aliases: ['ell'],
  patterns: [
    {
      match: '(#(?!\\[).*)',
      name: 'comment.line.number-sign.el',
    },
    {
      begin: '"',
      end: '"',
      name: 'string.quoted.double.el',
      patterns: [{ match: '\\\\.', name: 'constant.character.escape.el' }],
    },
    {
      begin: "'",
      end: "'",
      name: 'string.quoted.single.el',
      patterns: [{ match: '\\\\.', name: 'constant.character.escape.el' }],
    },
    { match: ':[a-z_][a-zA-Z0-9_]*', name: 'constant.other.atom.el' },
    { match: '#\\[', name: 'punctuation.section.array.begin.el' },
    { match: '%\\{', name: 'punctuation.section.map.el' },
    { match: '%[A-Z][A-Za-z0-9_]*', name: 'entity.name.type.el' },
    { match: `\\b(${keywords.join('|')})\\b`, name: 'keyword.control.el' },
    { match: '\\b(type)\\b', name: 'keyword.other.el' },
    { match: '\\b(true|false|unit)\\b', name: 'constant.language.el' },
    { match: '@\\w+', name: 'keyword.other.attribute.el' },
    { match: `\\b(${builtinTypes.join('|')})\\b`, name: 'keyword.type.el' },
    {
      match:
        '\\b(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|[0-9][0-9_]*(?:\\.[0-9][0-9_]*)?(?:[eE][+-]?[0-9]+)?)\\b',
      name: 'constant.numeric.el',
    },
    { match: '(\\|>|:=|::|->|=>)', name: 'keyword.operator.el' },
    { match: '\\b[A-Z][A-Za-z0-9]*\\b', name: 'entity.name.type.el' },
  ],
}
