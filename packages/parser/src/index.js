/**
 * FableJS Parser - Main entry point
 * 
 * A DSL parser for interactive storytelling applications.
 * Converts FableDSL code into an AST for rendering in React/Canvas.
 */

import { createSemantics } from './semantics/toAST.js';
import grammar from './grammar/fable.ohm-bundle.js';

/**
 * Parse FableDSL source code into an AST
 *
 * @param {string} source - DSL source code
 * @returns {import('./types').Fable} The parsed AST
 * @throws {Error} with line/column info on parse failure
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
export function parseDSL(source) {
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
 * @param {string} source - DSL source code
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateDSL(source) {
  const matchResult = grammar.match(source);

  if (matchResult.succeeded()) {
    return { valid: true };
  }

  return {
    valid: false,
    error: matchResult.message
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
