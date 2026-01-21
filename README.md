# FableJS

A complete interactive storytelling framework with DSL parser and React runtime engine. Built with Ohm.js for parsing expression grammar (PEG) based syntax and React for rendering interactive stories.

## Features

### DSL Parser (`@fable-js/parser`)
- Ruby-like syntax with do/end blocks
- Visual agents: text, button, image, video (with positions)
- Interactive events: on_click, on_hover, on_drag, on_drop
- Control structures: if (conditional), for (loop with ranges)
- Variables & State: set, add, subtract operations
- Arithmetic Expressions: +, -, *, /, % with operator precedence
- Comparison Operators: ==, !=, <, >, <=, >=
- Logical Operators: &&, ||, !
- String Operations: concatenation with +
- String Interpolation: {variable} syntax in text
- Audio: music, play_sound, stop_music actions
- Timing: wait, timer, auto_advance page options
- Animation: animate agents, move, stop_animation actions
- Randomness: random ranges, pick_one from lists
- Unique agent IDs: automatically assigned for renderer referencing
- Error messages with line/column information
- TypeScript support with full type definitions
- ESM package structure suitable for monorepo integration

### React Konva Runtime (`@fable-js/runtime`)
- **Canvas-based rendering** with React Konva for high-performance graphics
- **Zustand state management** for reactive, centralized state handling
- Interactive story player component (`<FablePlayer />`) with Stage/Layer architecture
- Real-time state management (variables, page navigation) via Zustand store
- Expression evaluation engine (arithmetic, logic, comparisons)
- Event handling system (click, hover, drag, drop) with Konva events
- Agent rendering: text, buttons, images with canvas positioning
- **React 19** compatibility with optimized re-renders
- **TypeScript** support with full type safety
- **Tree-shakable** ESM/CJS builds for optimal bundle sizes

**Architecture Benefits:**
- **GPU-accelerated rendering** for smooth animations and interactions
- **Memory efficient** for complex scenes with many agents
- **Consistent positioning** using canvas coordinates
- **Hardware acceleration** for better performance on mobile devices
- **Scalable vector graphics** that look crisp at any resolution

### 🚧 Planned Features
- **Audio Controller**: music, play_sound, stop_music, stop_sound
- **Animation System**: animate, move, stop_animation with easing
- **Timing Controls**: wait, timer, auto_advance page options
- **Video Agent**: video rendering with controls
- **Advanced Event Handling**: touch gestures, multi-touch support

## Installation

### Web Editor (Recommended)
Visit the live editor at [fablejs.dev](https://fablejs.dev) - no installation required!

### Parser Only
```bash
npm install @fable-js/parser
```

### Full Framework (Parser + Runtime)
```bash
npm install @fable-js/parser @fable-js/runtime react react-dom
```

### Development (Monorepo)
```bash
pnpm install
pnpm build
pnpm dev --filter=@fable-js/web  # Start web editor
```

## Usage

### Parser API

```javascript
import { parseDSL, validateDSL } from '@fable-js/parser';

const dsl = `
  fable "My Story" do
    page 1 do
      set score to 0
      set lives to 3
      text "Score: {score} | Lives: {lives}" at [100, 100]
      button "Play Game" at [200, 200] do
        on_click do
          set points to random 1..10
          set score to score + points
          set level to score / 100 + 1
          set is_high_score to score > 1000
          set should_level_up to score % 100 == 0 && lives > 0
          set message to "Got " + points + " points!"
        end
      end
      button "Reset" at [300, 200] do
        on_click do
          set score to 0
          set lives to 3
        end
      end
    end
  end
`;

// Parse to AST
const ast = parseDSL(dsl);
console.log(ast.title);  // "My Story"

// Validate without throwing
const { valid, error } = validateDSL(dsl);
if (!valid) console.error(error);
```

### Web Editor

The easiest way to get started is with our web-based editor:

1. Visit [fablejs.dev](https://fablejs.dev)
2. Choose from example stories or write your own DSL
3. See live preview updates as you type
4. No installation required!

**Features:**
- Monaco editor with FableJS syntax highlighting
- Live preview with real-time updates
- Error highlighting with line/column information
- Example stories to learn from
- Autocomplete and code snippets

### Runtime Player

```jsx
import { FablePlayer } from '@fable-js/runtime';
import { parseDSL } from '@fable-js/parser';

function MyStoryApp() {
  const dsl = `
    fable "Interactive Demo" do
      page 1 do
        set count to 0
        text "Count: {count}" at [100, 100]
        button "Increment" at [200, 200] do
          on_click do
            set count to count + 1
          end
        end
      end
    end
  `;

  const ast = parseDSL(dsl);

  return (
    <div>
      <h1>My Interactive Story</h1>
      <FablePlayer ast={ast} />
    </div>
  );
}
```

## Testing

### Parser Tests
```bash
cd packages/parser
pnpm test           # Run parser tests
pnpm test:watch     # Watch mode
```

### Runtime Tests
```bash
cd packages/runtime
pnpm test           # Run runtime tests
pnpm test:watch     # Watch mode
```

### All Tests (Monorepo)
```bash
pnpm test           # Run all tests across workspace
pnpm test:watch     # Watch mode for all packages
```

## Grammar

The DSL uses a PEG-based grammar defined in `src/grammar/fable.ohm`. You can visualize and debug grammars using the [Ohm Editor](https://ohmjs.org/editor/).

### Full Syntax Example

```ruby
fable "Interactive Story" do
  page 1 do
    // Comments are supported
    set health to 100
    set bonus to random 1..10
    set name to pick_one ["Hero", "Warrior", "Mage"]
    text "Welcome {name}! Health: {health}" at [100, 100]
    image "bg.jpg" at [0, 0]
    video "intro.mp4" at [50, 50]

    button "Attack" at [200, 200] do
      on_click do
        set damage to 10 + bonus % 5
        set health to health - damage
        set is_critical to random 1..100 <= 10
        set final_damage to damage * (is_critical ? 2 : 1)
        set health to health - final_damage
        set message to "You took " + final_damage + (is_critical ? " CRITICAL!" : " damage!")
        if health <= 0 || lives == 0 do
          go_to_page 3
        end
      end
    end

    button "Special Attack" at [300, 200] do
      on_click do
        if mana >= 20 && !is_cooldown do
          set damage to strength * 3
          set mana to mana - 20
          set is_cooldown to true
        end
      end
    end

    if health > 50 && mana > 0 do
      text "You're ready for battle!" at [150, 150]
    end

    if health <= 25 do
      text "Low health warning!" at [150, 180]
    end

    for i in 1..3 do
      button "Choice {i}" at [100, 200 + i * 50] do
        on_click do
          set choice to i
          go_to_page 2
        end
      end
    end
  end

  page 2 do
    text "You chose option {choice}" at [100, 100]
  end

  page 3 do
    text "Game Over" at [100, 100]
  end
end
```

### AST Output Structure

```javascript
{
  type: 'fable',
  title: 'Interactive Story',
  pages: [
    {
      type: 'page',
      id: 1,
      agents: [
        { type: 'text', id: 1, content: { type: 'interpolated_string', parts: ['Welcome ', { type: 'variable', name: 'name' }, '!'] }, position: [100, 100] },
        { type: 'image', id: 2, src: 'bg.jpg', position: [0, 0] },
        { type: 'button', id: 3, label: 'Attack', position: [200, 200], events: [...] }
      ],
      statements: [
        { type: 'set', variable: 'health', value: { type: 'number', value: 100 } },
        { type: 'set', variable: 'is_alive', value: { type: 'binary_op', operator: '&&', left: { type: 'binary_op', operator: '>', left: { type: 'variable', name: 'health' }, right: { type: 'number', value: 0 } }, right: { type: 'unary_op', operator: '!', operand: { type: 'variable', name: 'is_ghost' } } } },
        { type: 'set', variable: 'level', value: { type: 'binary_op', operator: '+', left: { type: 'binary_op', operator: '/', left: { type: 'variable', name: 'experience' }, right: { type: 'number', value: 100 } }, right: { type: 'number', value: 1 } } }
      ]
    }
  ]
}
```

## Project Structure

```
fable-js/
├── apps/
│   └── web/                       # Next.js web editor
│       ├── src/
│       │   ├── app/               # Next.js 15 app router
│       │   ├── components/        # React components
│       │   │   ├── ui/            # Reusable UI components
│       │   │   └── FableEditor.tsx # Main editor component
│       │   └── lib/               # Utilities & language support
│       │       ├── fable-language.ts # Monaco syntax highlighting
│       │       └── examples.ts    # Sample stories
│       └── package.json
├── packages/
│   ├── parser/                    # @fable-js/parser
│   │   ├── src/
│   │   │   ├── index.js           # Public API (parseDSL, validateDSL)
│   │   │   ├── grammar/
│   │   │   │   └── fable.ohm      # Ohm grammar definition
│   │   │   ├── semantics/
│   │   │   │   └── toAST.js       # CST-to-AST transformation
│   │   │   └── types.d.ts         # TypeScript definitions
│   │   ├── tests/
│   │   │   └── parser.test.mjs    # Parser test suite (44 tests)
│   │   └── package.json
│   └── runtime/                   # @fable-js/runtime (Canvas-based)
│       ├── src/
│       │   ├── index.js           # Main exports (ESM entry)
│       │   ├── index.d.ts         # TypeScript declarations
│       │   ├── store/
│       │   │   └── RuntimeStore.ts # Zustand state management
│       │   ├── engine/
│       │   │   └── ExpressionEvaluator.ts # Math/logic evaluation
│       │   └── components/
│       │       ├── FablePlayer.tsx    # Main Konva Stage component
│       │       ├── FableText.tsx      # Konva Text agent
│       │       ├── FableButton.tsx    # Konva Rect+Text button
│       │       └── FableImage.tsx     # Konva Image agent
│       ├── tests/
│       │   └── runtime.test.js    # Runtime test suite
│       ├── dist/                 # Built ESM/CJS bundles
│       └── package.json          # React Konva + Zustand deps
├── turbo.json                     # Turborepo pipeline configuration
├── pnpm-workspace.yaml            # Workspace configuration
└── package.json                   # Root workspace config
```
fable-js/
├── apps/                          # Future Next.js demo applications
├── packages/
│   ├── parser/                    # @fable-js/parser
│   │   ├── src/
│   │   │   ├── index.js           # Public API (parseDSL, validateDSL)
│   │   │   ├── grammar/
│   │   │   │   └── fable.ohm      # Ohm grammar definition
│   │   │   ├── semantics/
│   │   │   │   └── toAST.js       # CST-to-AST transformation
│   │   │   └── types.d.ts         # TypeScript definitions
│   │   ├── tests/
│   │   │   └── parser.test.mjs    # Parser test suite (44 tests)
│   │   └── package.json
│   └── runtime/                   # @fable-js/runtime
│       ├── src/
│       │   ├── index.js           # Main exports
│       │   ├── index.d.ts         # TypeScript declarations
│       │   ├── engine/
│       │   │   ├── FableState.js      # State management
│       │   │   └── ExpressionEvaluator.js # Expression evaluation
│       │   └── components/
│       │       ├── FablePlayer.jsx    # Main player component
│       │       ├── FableText.jsx      # Text agent
│       │       ├── FableButton.jsx    # Button agent
│       │       └── FableImage.jsx     # Image agent
│       ├── tests/
│       │   └── runtime.test.js    # Runtime test suite
│       ├── dist/                 # Built distribution files
│       └── package.json
├── turbo.json                     # Turborepo pipeline configuration
├── pnpm-workspace.yaml            # Workspace configuration
└── package.json                   # Root workspace config
```

## Extending the Grammar

1. Edit `src/grammar/fable.ohm` to add new rules
2. Add semantic actions in `src/semantics/toAST.js`
3. Update `src/types.d.ts` for TypeScript support
4. Add tests in `tests/parser.test.mjs`

Use the [Ohm Editor](https://ohmjs.org/editor/) to test grammar changes interactively.

## API Reference

### Parser API (`@fable-js/parser`)

#### `parseDSL(source: string): Fable`

Parses DSL source code and returns the AST. Throws an error with line/column info on parse failure.

#### `validateDSL(source: string): { valid: boolean, error?: string }`

Validates DSL without throwing. Returns validation result with optional error message.

#### `getGrammar(): Grammar`

Returns the raw Ohm grammar object for advanced use cases (extending, custom semantics).

### Runtime API (`@fable-js/runtime`)

#### `<FablePlayer ast={ast} width? height? className? style? onStateChange? />`

Main React Konva component that renders interactive stories on HTML5 Canvas.

**Props:**
- `ast`: Parsed AST from `@fable-js/parser`
- `width?`: Canvas width (default: 800)
- `height?`: Canvas height (default: 600)
- `className?`: Container CSS classes
- `style?`: Container inline styles
- `onStateChange?`: Callback for state changes

**Features:**
- Canvas-based rendering with Konva Stage/Layer architecture
- Zustand-powered reactive state management
- Real-time expression evaluation and variable interpolation
- Konva event system for interactive agents (click, hover, drag)
- Automatic canvas positioning and rendering

#### Zustand Store

##### `useRuntimeStore()`
Centralized state management hook for story runtime.

**State:**
```typescript
{
  ast: Fable | null;
  currentPage: number;
  pageHistory: number[];
  variables: Map<string, any>;
  evaluator: ExpressionEvaluator | null;
}
```

**Actions:**
- `setAst(ast)` - Initialize story
- `goToPage(pageId)` - Navigate pages
- `setVariable(name, value)` - Update variables
- `executeStatements(statements)` - Run DSL statements
- `getState()` - Get current state snapshot

#### Engine Classes

##### `ExpressionEvaluator`
Evaluates arithmetic (`+`, `-`, `*`, `/`, `%`), comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`), and logical (`&&`, `||`, `!`) expressions with variable interpolation.

## References

- Pinto, Hedvan Fernandes. "Authorship of Interactive e-books: conceptual model fables and requirements." [Link](https://tedebc.ufma.br/jspui/handle/tede/2010)
- Silva, Alfredo Tito. "FableJS: Biblioteca para criacao de historias interativas." [PDF Link](https://rosario.ufma.br/jspui/bitstream/123456789/6908/1/AlfredoTitoSilva.pdf)
- [Ohm.js Documentation](https://ohmjs.org/docs/)

## Contributing

### Adding New Agent Types

1. Create new component in `packages/runtime/src/components/`
2. Add case in `FablePlayer.jsx` switch statement
3. Export from `packages/runtime/src/index.js`
4. Add TypeScript definitions in `packages/runtime/src/index.d.ts`

### Extending Expression Evaluation

1. Add new expression types in `ExpressionEvaluator.js`
2. Update parser grammar in `packages/parser/src/grammar/fable.ohm`
3. Add semantic actions in `packages/parser/src/semantics/toAST.js`
4. Add tests for new expressions

### Adding New Features

The runtime is designed to be extensible. New features like audio, animation, and timing can be added by:

1. Creating dedicated engine classes (e.g., `AudioController`, `AnimationEngine`)
2. Integrating them into the `FablePlayer` component
3. Adding new statement handlers for DSL commands
4. Updating the parser grammar and semantics as needed

## License

MIT
