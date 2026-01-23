/**
 * FableJS Parser - Main entry point
 * 
 * A DSL parser for interactive storytelling applications.
 * Converts FableDSL code into an AST for rendering in React/Canvas.
 */

import { createSemantics } from './semantics/to-ast.js';
import grammar from './grammar/fable.ohm-bundle.js';

/**
 * Parse FableDSL source code into an AST
 *
 * @param source - DSL source code
 * @returns The parsed AST
 * @throws Error with line/column info on parse failure
 *
 * @example
 * ```js
 * const ast = parseDSL(`
 *   fable "My Story" do
 *     page 1 do
 *       text "Hello World" at [100, 100]
 *     end
 *   end
 * `);
 *
 * console.log(ast.title); // "My Story"
 * console.log(ast.pages[0].agents[0].content); // "Hello World"
 * ```
 */
export function parseDSL(source: string) {
  const matchResult = grammar.match(source);

  if (matchResult.failed()) {
    // Ohm provides excellent error messages with line/column info
    throw new Error(matchResult.message);
  }

  const semantics = createSemantics(grammar);
  return semantics(matchResult).toAST();
}

/**
 * Check if source code is valid FableDSL without throwing
 *
 * @param source - DSL source code
 * @returns Validation result
 */
export function validateDSL(source: string) {
  const matchResult = grammar.match(source);

  if (matchResult.succeeded()) {
    return { valid: true };
  }

  // Type assertion needed because TypeScript can't narrow the union type properly
  return {
    valid: false,
    error: (matchResult as any).message
  };
}

/**
 * Get the raw Ohm grammar object for advanced use cases
 * (e.g., extending the grammar, custom semantics)
 * 
 * @returns {import('ohm-js').Grammar}
 */
export function getGrammar() {
  return grammar;
}

// Export for advanced usage
export { grammar, createSemantics };

// Export types
export type {
  Fable,
  Page,
  Agent,
  VisualAgent,
  ControlAgent,
  TextAgent,
  ButtonAgent,
  ImageAgent,
  VideoAgent,
  IfBlock,
  ForBlock,
  BaseAgent,
  Event,
  Action,
  Statement,
  Expression,
  InterpolatedString,
  Position,
  Range,
  ValidationResult,
  EventType
} from './types';
