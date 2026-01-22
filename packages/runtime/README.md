# @fable-js/runtime

React runtime engine for executing FableJS interactive stories with canvas rendering.

## Features

- **Canvas Rendering**: GPU-accelerated rendering using Konva.js
- **React Integration**: Seamless integration with React applications
- **State Management**: Zustand-powered reactive state management
- **Interactive Elements**: Support for buttons, text, images, and custom components
- **Performance Optimized**: Efficient rendering with React Konva
- **TypeScript Ready**: Full type safety with comprehensive definitions

## Installation

This is an internal package and should be used within the FableJS monorepo.

```bash
pnpm add @fable-js/runtime
```

## Usage

```tsx
import { FablePlayer } from '@fable-js/runtime';
import { parseDSL } from '@fable-js/parser';

const dsl = `
fable "Interactive Story" do
  page 1 do
    text "Click the button!" at [50, 50]
    button "Continue" at [50, 120] do
      on_click do
        go_to_page 2
      end
    end
  end
end
`;

const ast = parseDSL(dsl);

function MyStory() {
  return (
    <div style={{ width: 800, height: 600 }}>
      <FablePlayer ast={ast} width={800} height={600} />
    </div>
  );
}
```

## Components

### `FablePlayer`

Main component for rendering FableJS stories.

**Props:**
- `ast: Fable` - Parsed story AST
- `width: number` - Canvas width
- `height: number` - Canvas height
- `onEvent?: (event: FableEvent) => void` - Event callback

### `FableText`

Renders text elements with positioning.

### `FableButton`

Interactive button component with click handlers.

### `FableImage`

Image rendering component.

## State Management

The runtime uses Zustand for reactive state management:

```javascript
import { useFableStore } from '@fable-js/runtime';

// Access current story state
const { currentPage, variables } = useFableStore();
```

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

- `react: ^19.0.0`
- `react-dom: ^19.0.0`

## License

MIT