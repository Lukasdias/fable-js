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
// Hardcoded grammar to avoid file caching issues
const grammar = ohm.grammar(String.raw`
FableDSL {
  // =========== Top Level ===========
  Fable = "fable" StringLiteral "do" FableContent* "end"
  FableContent = Page | Statement | MusicStatement

  // =========== Pages ===========
  Page = "page" NumberLiteral PageOption? "do" PageContent* "end"
  PageOption = "auto_advance" Duration
  PageContent = Agent | Statement | MusicStatement | TimerBlock

  // =========== Statements ===========
  Statement = SetStatement | AddStatement | SubtractStatement
  SetStatement = "set" identifier "to" Expression
  AddStatement = "add" Expression "to" identifier
  SubtractStatement = "subtract" Expression "from" identifier

  // =========== Agents ===========
  Agent = TextAgent
        | ButtonAgent
        | ImageAgent
        | VideoAgent
        | IfBlock
        | ForBlock
        | WaitBlock

   TextAgent   = "text" InterpolatedString "at" Position AnimateOption?
   ButtonAgent = "button" StringLiteral "at" Position AnimateOption? "do" Event* "end"
   ImageAgent  = "image" StringLiteral "at" Position AnimateOption?
  VideoAgent  = "video" StringLiteral "at" Position

  // =========== Events ===========
  Event = EventType "do" Action+ "end"
  EventType = "on_click" | "on_hover" | "on_drag" | "on_drop"
  // =========== Audio ===========
  MusicStatement = "music" StringLiteral MusicOptions?
  MusicOptions = MusicOption+
  MusicOption = "loop" BooleanLiteral | "volume" NumberLiteral

  // =========== Actions ===========
  Action = GoToPageAction | PlaySoundAction | StopMusicAction | StopSoundAction
         | MoveAction | StopAnimationAction | SetStatement | AddStatement | SubtractStatement
  GoToPageAction = "go_to_page" NumberLiteral
   PlaySoundAction = PlaySoundWithVolume | PlaySoundWithoutVolume
   PlaySoundWithVolume = "play_sound" StringLiteral "volume" NumberLiteral
   PlaySoundWithoutVolume = "play_sound" StringLiteral
  StopMusicAction = "stop_music"
  StopSoundAction = "stop_sound" StringLiteral
  MoveAction = "move" AgentRef "to" Position "duration" Duration EasingOption?
  StopAnimationAction = "stop_animation" AgentRef



  // =========== Timing ===========
  WaitBlock = ("wait" | "after") Duration "do" Action+ "end"
   TimerBlock = "timer" Duration "on_timeout" "do" (Action | Agent)* "end"
  Duration = NumberLiteral TimeUnit
  TimeUnit = "s" | "ms"

  // =========== Animation ===========
   AnimateOption = "animate" StringLiteral AnimateParams?
   AnimateParams = AnimateParam+
   AnimateParam = "duration" Duration | "repeat" NumberLiteral
  AgentRef = "agent" NumberLiteral
  EasingOption = "easing" StringLiteral

  // =========== Control Structures ===========
  IfBlock  = "if" StringLiteral "do" Agent* "end"
  ForBlock = "for" identifier "in" Range "do" Agent* "end"

  // =========== Primitives ===========
  Position = "[" NumberLiteral "," NumberLiteral "]"
  Range = NumberLiteral ".." NumberLiteral

  // =========== Expressions ===========
  Expression = AddExpr
  AddExpr = AddExpr "+" MulExpr  -- plus
           | AddExpr "-" MulExpr  -- minus
           | MulExpr
  MulExpr = MulExpr "*" PrimaryExpr  -- times
           | MulExpr "/" PrimaryExpr  -- div
           | PrimaryExpr
  PrimaryExpr = "(" Expression ")"  -- paren
               | RandomExpr
               | PickOneExpr
               | NumberLiteral
               | BooleanLiteral
               | StringLiteral
               | identifier
  RandomExpr = "random" Range
  PickOneExpr = "pick_one" List
   List = "[" ListItems "]"
   ListItems = ListItems "," StringLiteral  -- multiple
              | StringLiteral               -- single

  // =========== Tokens ===========
   InterpolatedString = "\"" innerString "\""
   innerString = (~"\"" any)*

  StringLiteral = "\"" (~"\"" any)* "\""
   NumberLiteral = digit+ ("." digit+)?
  BooleanLiteral = "true" | "false"
  identifier = letter (letter | digit | "_")*

  // =========== Whitespace (auto-skipped) ===========
  space += comment
  comment = "//" (~"\n" any)*
}
  `);

export function parseDSL(source) {
  // Reset agent ID counter for each parse
  resetAgentIdCounter();
  
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
