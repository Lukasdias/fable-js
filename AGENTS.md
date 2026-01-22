# FableJS - Development Guidelines

# Package Manager
Use `pnpm` as the package manager for this project. Ensure you have it installed globally:

```bash
npm install -g pnpm 
```

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

**When to use**: Run these checks before committing code changes or submitting pull requests.

- [ ] Files use kebab-case naming
- [ ] Components have proper TypeScript types
- [ ] Performance optimizations applied
- [ ] Design follows bold aesthetic direction
- [ ] Bundle size considerations made

## 🆕 New Contributor Checklist

**When to use**: Complete this checklist when starting work on FableJS as a new contributor.

- [ ] Install pnpm globally and verify installation
- [ ] Read and understand kebab-case file naming convention
- [ ] Load the three default skills (frontend-design, react-dev, vercel-best-practices) for any development task
- [ ] Review the default workflow steps before starting work
- [ ] Familiarize with design philosophy (bold aesthetics, typography, etc.)
- [ ] Run quality checks before any commits
- [ ] Understand code standards (PascalCase components, camelCase hooks, etc.)

## 🔄 Default Workflow

Every development session **MUST** follow this workflow to ensure consistency, quality, and adherence to project standards:

### 1. Session Setup
```bash
# Always load these three skills at the start of any task
use skill frontend-design
use skill react-dev
use skill vercel-best-practices
```

### 2. Task Understanding
- Review the current codebase structure and existing patterns
- Understand the specific task requirements and constraints
- Check related files for context (imports, dependencies, conventions)

### 3. Implementation
- Follow **kebab-case** file naming convention for all new files
- Apply proper TypeScript typing and React 19 patterns
- Focus on performance optimization and bold design aesthetics
- Use existing libraries and utilities from the codebase
- Mimic existing code style and patterns

### 4. Quality Assurance
Before committing, **always run** these commands:
```bash
# Lint 
pnpm run lint

# Build all packages
pnpm build

# Run tests
pnpm test
```

### 5. Commit Process (Only if User Requests)
- Use descriptive commit messages focusing on "why" not "what"
- Never commit files containing secrets or credentials
- Ensure all quality checks pass before committing
- Follow the project's commit message style from recent history

### 6. Session Completion
- Document any new patterns or decisions made during the session
- Update this AGENTS.md file if new guidelines emerge
- Provide clear feedback on what was accomplished

### Key Reminders
- **Never** commit unless explicitly requested by the user
- **Always** follow security best practices (no secrets, proper logging)
- **Always** verify builds and tests pass before considering work complete
- **Never** introduce code that could be used maliciously

## 🧪 DSL Extension Workflow

### Extending the FableDSL Language

When adding new commands, directives, or features to FableDSL, follow this systematic approach:

#### 1. **Understand the Grammar Structure**
```typescript
// Located in: packages/parser/src/grammar/fable.ohm-bundle.d.ts
// This defines the language syntax and parsing rules
```

#### 2. **Add Type Definitions**
```typescript
// Located in: packages/parser/src/types.d.ts
// Add new types for your feature
interface NewDirective {
  type: 'new-directive';
  // ... properties
}
```

#### 3. **Update Parser Semantics**
```typescript
// Located in: packages/parser/src/grammar/fable.ohm-bundle.d.ts
// Add semantic actions to convert AST nodes
```

#### 4. **Implement Runtime Logic**
```typescript
// Located in: packages/runtime/src/
// Add components, engines, or utilities for the new feature
```

#### 5. **Update Editor Support**
```typescript
// Located in: packages/editor/src/
// Add syntax highlighting, autocompletion, validation
```

#### 6. **Add Tests**
```typescript
// Located in: packages/*/tests/
// Unit tests, integration tests, and examples
```

#### 7. **Update Documentation**
- Add examples to `apps/web/src/constants/default-dsl.ts`
- Update this AGENTS.md with new feature documentation
- Create usage examples in comments

### Using the DSL Extension Skill

For creating new DSL commands, use this local skill:

```bash
use skill fable-dsl-extension
```

This skill provides:
- **DSL Grammar Analysis** - Understand current syntax rules
- **Type Definition Generation** - Create proper TypeScript interfaces
- **Runtime Implementation** - Generate component and engine code
- **Editor Integration** - Add syntax highlighting and validation
- **Testing Templates** - Generate comprehensive test suites

### Example: Adding a New Animation

```bash
# Use the DSL extension skill
use skill fable-dsl-extension

# Describe the new feature
create dsl command "bounce" for "animations" with properties:
- duration: number (default: 500ms)
- intensity: "gentle" | "medium" | "intense" (default: "medium")
- repeat: number (default: 1)

# The skill will generate:
# 1. Type definitions in types.d.ts
# 2. Parser grammar updates
# 3. Runtime animation component
# 4. Editor syntax highlighting
# 5. Test cases
# 6. Documentation updates
```

## 📞 Contact

For questions about these guidelines, check the existing codebase or ask in development discussions.