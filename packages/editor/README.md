# @fable-js/editor

Monaco-based code editor for FableJS DSL with syntax highlighting, IntelliSense, and themes.

## Features

- **Monaco Editor**: VS Code-powered editing experience
- **Syntax Highlighting**: Custom FableJS DSL grammar with tokenization
- **IntelliSense**: Auto-completion for DSL constructs and keywords
- **Themes**: Dark theme optimized for coding
- **Error Detection**: Real-time syntax validation
- **Keyboard Shortcuts**: Format document (Shift+Alt+F)
- **TypeScript Integration**: Full type safety and IntelliSense

## Installation

This is an internal package and should be used within the FableJS monorepo.

```bash
pnpm add @fable-js/editor
```

## Usage

```tsx
import { FableMonacoEditor } from '@fable-js/editor';

function MyEditor() {
  const [dsl, setDsl] = useState(DEFAULT_DSL);

  return (
    <div style={{ height: '500px' }}>
      <FableMonacoEditor
        value={dsl}
        onChange={setDsl}
        theme="fable-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          tabSize: 2
        }}
      />
    </div>
  );
}
```

## Components

### `FableMonacoEditor`

Main Monaco editor component for FableJS DSL.

**Props:**
- `value: string` - Current DSL content
- `onChange?: (value: string | undefined) => void` - Change callback
- `onMount?: (editor: IStandaloneCodeEditor) => void` - Mount callback
- `width?: string | number` - Editor width
- `height?: string | number` - Editor height
- `theme?: string` - Editor theme ('fable-dark' | 'vs-dark' | 'light')
- `options?: IEditorOptions` - Monaco editor options

## Features

### Syntax Highlighting
- **Keywords**: `fable`, `page`, `text`, `button`, `set`, `if`, `do`, `end`
- **Types**: `string`, `number`, `boolean`
- **Operators**: `to`, `at`, `+`, `-`, `*`, `/`, `==`, `!=`
- **Comments**: `#` single-line comments

### IntelliSense
- **DSL Constructs**: Auto-complete for all language features
- **Snippets**: Quick insert for common patterns
- **Context Awareness**: Smart suggestions based on cursor position

### Error Detection
- **Syntax Errors**: Real-time parsing with error markers
- **Semantic Errors**: Validation against DSL grammar
- **Line/Column Info**: Precise error location reporting

## Language Features

### Custom Grammar
The editor uses a custom Ohm.js grammar for FableJS DSL:

```
FableDSL {
  Fable = "fable" stringLiteral "do" Page* "end"
  Page = "page" number "do" Statement* "end"
  Statement = Text | Button | SetVariable | IfStatement
  // ... more grammar rules
}
```

### Themes
- **fable-dark**: Custom dark theme optimized for DSL editing
- **vs-dark**: Standard VS Code dark theme
- **vs**: Standard VS Code light theme

## Development

```bash
# Run tests
pnpm test

# Build package
pnpm build

# Development watch mode
pnpm dev
```

## Peer Dependencies

- `react: >=16.8.0`
- `react-dom: >=16.8.0`

## Dependencies

- `monaco-editor`: ^0.50.0
- `@monaco-editor/react`: ^4.6.0
- `@fable-js/parser`: workspace:*

## License

MIT