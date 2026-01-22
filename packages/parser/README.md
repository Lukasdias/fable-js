# @fable-js/parser

A powerful DSL parser for FableJS interactive storytelling, built with Ohm.js.

## Features

- **PEG Grammar**: Custom parsing grammar for FableJS DSL
- **AST Generation**: Converts DSL code into structured Abstract Syntax Trees
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Detailed error reporting with line/column information
- **ESM Support**: Modern ES modules with dual CommonJS/ESM exports

## Installation

This is an internal package and should be used within the FableJS monorepo.

```bash
pnpm add @fable-js/parser
```

## Usage

```javascript
import { parseDSL, validateDSL } from '@fable-js/parser';

const dsl = `
fable "My Story" do
  page 1 do
    text "Hello World!" at [50, 50]
  end
end
`;

try {
  const ast = parseDSL(dsl);
  console.log('Parsed successfully:', ast);
} catch (error) {
  console.error('Parse error:', error);
}

const validation = validateDSL(dsl);
if (!validation.valid) {
  console.error('Validation error:', validation.error);
}
```

## API

### `parseDSL(dsl: string): Fable`

Parses FableJS DSL code into an AST.

### `validateDSL(dsl: string): { valid: boolean; error?: string }`

Validates DSL syntax without generating AST.

### `resetAgentIdCounter(): void`

Resets internal ID counters (useful for testing).

## Development

```bash
# Run tests
pnpm test

# Build package
pnpm build

# Development watch mode
pnpm dev
```

## License

MIT