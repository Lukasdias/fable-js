# FableJS - Development Guidelines

## 📁 File Naming Convention

All files in this project **MUST** follow the **kebab-case** naming convention:

### ✅ Correct Examples:
```
fable-editor.tsx
page-traveller.tsx
theme-toggle.tsx
theme-provider.tsx
use-preview-size.ts
default-dsl.ts
```

### ❌ Incorrect Examples:
```
FableEditor.tsx      # PascalCase - WRONG
PageTraveller.tsx     # PascalCase - WRONG
use_preview_size.ts   # snake_case - WRONG
defaultDSL.ts         # camelCase - WRONG
```

### 📋 Rules:
- **File names**: Always use `kebab-case.tsx` or `kebab-case.ts`
- **Component names**: PascalCase (inside the file)
- **Hook names**: camelCase starting with `use`
- **Constant files**: kebab-case
- **Index files**: `index.ts`

## 🛠️ Default Skills

Every development session **MUST** use these three skills by default:

### 1. `frontend-design`
- **Purpose**: Create distinctive, production-grade frontend interfaces
- **Use when**: Building React components, pages, or UI elements
- **Focus**: Avoid generic AI aesthetics, embrace creative design

### 2. `react-dev`
- **Purpose**: Type-safe React development with modern patterns
- **Use when**: Building React components, hooks, or TypeScript interfaces
- **Focus**: Proper typing, React 19 patterns, component composition

### 3. `vercel-best-practices`
- **Purpose**: Performance optimization and best practices
- **Use when**: Writing React components, implementing data fetching, or optimizing bundles
- **Focus**: Eliminating waterfalls, bundle optimization, server-side performance

## 🚀 Usage Instructions

### When Starting Any Task:
```bash
# Always load these skills first
use skill frontend-design
use skill react-dev
use skill vercel-best-practices
```

### File Creation:
```bash
# ✅ Always create files with kebab-case
touch my-new-component.tsx
touch use-custom-hook.ts
touch api-endpoint.ts
```

### Code Standards:
- **Components**: PascalCase export, kebab-case file
- **Hooks**: camelCase starting with `use`
- **Types**: PascalCase interfaces/types
- **Constants**: SCREAMING_SNAKE_CASE
- **Functions**: camelCase

## 🎨 Design Philosophy

### Frontend Design:
- **Bold aesthetics**: Choose extreme design directions (maximalist, brutalist, organic, etc.)
- **Typography**: Unique fonts, not generic (Fraunces + Nunito preferred)
- **Colors**: Dominant palettes with sharp accents
- **Motion**: High-impact animations with staggered reveals
- **Layout**: Unexpected compositions with generous white space

### React Development:
- **Type Safety**: Compile-time guarantees with discriminated unions
- **Modern Patterns**: React 19 features (Actions, Server Components, use())
- **Component Composition**: Proper props extension and generic components
- **Event Handling**: Specific event types (MouseEvent, ChangeEvent, etc.)

### Performance:
- **Bundle Optimization**: Barrel imports, dynamic imports, conditional loading
- **Server Performance**: React.cache(), parallel fetching, streaming
- **Client Optimization**: SWR deduplication, re-render optimization
- **JavaScript Performance**: Proper algorithms, caching, early exits

## 📚 Quick References

### File Structure:
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── editor/       # Editor-specific components
│   └── page-traveller.tsx
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── constants/        # Application constants
└── app/              # Next.js app router
```

### Component Template:
```tsx
'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

interface MyComponentProps {
  // Type-safe props
}

export function MyComponent({ }: MyComponentProps) {
  // Implementation with proper typing
  return (
    // Creative, performant design
  )
}
```

## 🔍 Quality Checks

Before committing:
- [ ] Files use kebab-case naming
- [ ] Components have proper TypeScript types
- [ ] Performance optimizations applied
- [ ] Design follows bold aesthetic direction
- [ ] Bundle size considerations made

## 📞 Contact

For questions about these guidelines, check the existing codebase or ask in development discussions.