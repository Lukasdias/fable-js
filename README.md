# FableJS DSL Parser

A DSL parser for interactive storytelling applications. Built with Ohm.js for parsing expression grammar (PEG) based syntax.

## Features

- Ruby-like syntax with do/end blocks
- Visual agents: text, button, image, video (with positions)
- Interactive events: on_click, on_hover, on_drag, on_drop
- Control structures: if (conditional), for (loop with ranges)
- Variables & State: set, add, subtract operations
- String Interpolation: {variable} syntax in text
- Audio: music, play_sound, stop_music actions
- Timing: wait, timer, auto_advance page options
- Animation: animate agents, move, stop_animation actions
- Randomness: random ranges, pick_one from lists
- Unique agent IDs: automatically assigned for renderer referencing
- Error messages with line/column information
- TypeScript support with full type definitions
- ESM package structure suitable for monorepo integration

## Installation

```bash
npm install
```

## Usage

```javascript
import { parseDSL, validateDSL } from '@fable-js/parser';

const dsl = `
  fable "My Story" do
    page 1 do
      set score to 0
      text "Score: {score}" at [100, 100]
      button "Click me!" at [200, 200] do
        on_click do
          add 10 to score
          play_sound "click.wav"
        end
      end
      button "Next" at [300, 300] do
        on_click do
          go_to_page 2
        end
      end
    end
    page 2 auto_advance 3s do
      text "The End - Final Score: {score}" at [100, 100]
      music "victory.mp3" loop volume 0.8
    end
  end
`;

// Parse to AST
const ast = parseDSL(dsl);
console.log(ast.title);  // "My Story"
console.log(ast.pages[0].agents[0].content);  // "Hello World"

// Validate without throwing
const { valid, error } = validateDSL(dsl);
if (!valid) console.error(error);
```

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

## Grammar

The DSL uses a PEG-based grammar defined in `src/grammar/fable.ohm`. You can visualize and debug grammars using the [Ohm Editor](https://ohmjs.org/editor/).

### Full Syntax Example

```ruby
fable "Interactive Story" do
  page 1 do
    // Comments are supported
    set health to 100
    set name to "Hero"
    text "Welcome {name}! Health: {health}" at [100, 100]
    image "bg.jpg" at [0, 0]
    video "intro.mp4" at [50, 50]

    button "Attack" at [200, 200] animate "pulse" duration 2s do
      on_click do
        subtract 10 from health
        play_sound "sword.wav" volume 0.7
        if "health <= 0" do
          go_to_page 3
        end
      end
    end

    button "Random Event" at [300, 200] do
      on_click do
        set event to pick_one ["good", "bad", "neutral"]
        if "event == 'good'" do
          add 20 to health
          music "happy.mp3" loop
        end
      end
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

  page 2 auto_advance 5s do
    text "You chose option {choice}" at [100, 100]
    wait 2s do
      play_sound "transition.wav"
    end
  end

  page 3 do
    text "Game Over" at [100, 100]
    stop_music
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
      autoAdvance: 3000, // in milliseconds
      agents: [
        { type: 'set', variable: 'health', value: { type: 'number', value: 100 } },
        { type: 'text', id: 1, content: { type: 'interpolated_string', parts: ['Welcome ', { type: 'variable', name: 'name' }, '!'] }, position: [100, 100] },
        { type: 'button', id: 2, label: 'Attack', position: [200, 200], animate: { animation: 'pulse', duration: 2000 }, events: [...] },
        { type: 'play_sound', src: 'sword.wav', volume: 0.7 },
        { type: 'if', condition: 'health <= 0', agents: [{ type: 'go_to_page', target: 3 }] },
        { type: 'for', variable: 'i', range: { start: 1, end: 3 }, agents: [...] }
      ]
    }
  ]
}
```

## Project Structure

```
src/
├── grammar/
│   └── fable.ohm       # Ohm grammar definition
├── semantics/
│   └── toAST.js        # CST-to-AST transformation
├── index.js            # Public API (parseDSL, validateDSL)
└── types.d.ts          # TypeScript definitions
tests/
└── parser.test.mjs     # Vitest test suite
```

## Extending the Grammar

1. Edit `src/grammar/fable.ohm` to add new rules
2. Add semantic actions in `src/semantics/toAST.js`
3. Update `src/types.d.ts` for TypeScript support
4. Add tests in `tests/parser.test.mjs`

Use the [Ohm Editor](https://ohmjs.org/editor/) to test grammar changes interactively.

## API Reference

### `parseDSL(source: string): Fable`

Parses DSL source code and returns the AST. Throws an error with line/column info on parse failure.

### `validateDSL(source: string): { valid: boolean, error?: string }`

Validates DSL without throwing. Returns validation result with optional error message.

### `getGrammar(): Grammar`

Returns the raw Ohm grammar object for advanced use cases (extending, custom semantics).

## References

- Pinto, Hedvan Fernandes. "Authorship of Interactive e-books: conceptual model fables and requirements." [Link](https://tedebc.ufma.br/jspui/handle/tede/2010)
- Silva, Alfredo Tito. "FableJS: Biblioteca para criacao de historias interativas." [PDF Link](https://rosario.ufma.br/jspui/bitstream/123456789/6908/1/AlfredoTitoSilva.pdf)
- [Ohm.js Documentation](https://ohmjs.org/docs/)

## License

MIT
