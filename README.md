# Fable-JS DSL Parser

A simple parser for a Ruby-like DSL used in interactive storytelling applications. Built with Nearley for parsing custom grammar into AST.

## Installation

```bash
npm install
```

## Usage

Compile the grammar:
```bash
npm run compile
```

Or watch for changes:
```bash
npm run watch
```

Test the parser:
```bash
npm test
```

## Grammar

The DSL supports:
- Fables with pages
- Agents (text, buttons) with positions
- Example: `fable "Story" do page 1 do text "Hello" at [100, 100] end end`

Edit `grammar.ne` and recompile to add features.

## Scripts

- `compile`: Generate parser from grammar.ne
- `watch`: Auto-recompile on grammar changes
- `test`: Run parser on sample DSL

## References

- Silva, Alfredo Tito. "Desenvolvimento de uma linguagem específica de domínio para criação de histórias interativas." (Thesis, UFMA, 2010). [Link](https://tedebc.ufma.br/jspui/handle/tede/2010)
- [PDF Link](https://rosario.ufma.br/jspui/bitstream/123456789/6908/1/AlfredoTitoSilva.pdf)

Inspired by these works for DSL creation in storytelling.