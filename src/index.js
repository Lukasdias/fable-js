/**
 * FableJS Parser - Main entry point
 * 
 * A DSL parser for interactive storytelling applications.
 * Converts FableDSL code into an AST for rendering in React/Canvas.
 */

import * as ohm from 'ohm-js';
import { createSemantics, resetAgentIdCounter } from './semantics/toAST.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load grammar from file
const __dirname = dirname(fileURLToPath(import.meta.url));

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
  // Reset agent ID counter for each parse
  resetAgentIdCounter();

  // Load grammar fresh each time to avoid caching issues
  const grammarSource = readFileSync(join(__dirname, 'grammar/fable.ohm'), 'utf-8');
  const grammar = ohm.grammar(grammarSource);

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
  // Load grammar fresh each time to avoid caching issues
  const grammarSource = readFileSync(join(__dirname, 'grammar/fable.ohm'), 'utf-8');
  const grammar = ohm.grammar(grammarSource);

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
