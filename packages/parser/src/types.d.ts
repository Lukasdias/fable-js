/**
 * TypeScript definitions for FableJS Parser
 */

import type { Grammar, Semantics } from 'ohm-js';

// =========== Primitives ===========

export type Position = [number, number] | [Expression, Expression];

export interface Range {
  start: number;
  end: number;
}

// =========== Events & Actions ===========

export type EventType = 'on_click' | 'on_hover' | 'on_drag' | 'on_drop';

export interface GoToPageAction {
  type: 'go_to_page';
  target: number;
}

export interface PlaySoundAction {
  type: 'play_sound';
  src: string;
  volume?: number;
}

export interface StopMusicAction {
  type: 'stop_music';
}

export interface StopSoundAction {
  type: 'stop_sound';
  src: string;
}

export interface MoveAction {
  type: 'move';
  agentId: string;
  to: Position;
  duration: number;
  easing?: string;
}

export interface StopAnimationAction {
  type: 'stop_animation';
  agentId: string;
}

export type Action = GoToPageAction | PlaySoundAction | StopMusicAction | StopSoundAction | MoveAction | StopAnimationAction;

export interface Event {
  type: EventType;
  statements: Statement[];
}

// =========== Statements ===========

export interface InitStatement {
  type: 'init';
  variable: string;
  value: Expression;
}

export interface SetStatement {
  type: 'set';
  variable: string;
  value: Expression;
}

export interface AddStatement {
  type: 'add';
  amount: Expression;
  variable: string;
}

export interface SubtractStatement {
  type: 'subtract';
  amount: Expression;
  variable: string;
}

export type Statement = InitStatement | SetStatement | AddStatement | SubtractStatement | MusicStatement | WaitBlock | TimerBlock;

// =========== Expressions ===========

export interface RandomExpr {
  type: 'random';
  range: Range;
}

export interface PickOneExpr {
  type: 'pick_one';
  options: string[];
}

export type Expression =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'variable'; name: string }
  | RandomExpr
  | PickOneExpr;

// =========== Audio ===========

export interface MusicStatement {
  type: 'music';
  src: string;
  loop?: boolean;
  volume?: number;
}

// =========== Timing ===========

export interface WaitBlock {
  type: 'wait';
  duration: number;
  actions: Action[];
}

export interface TimerBlock {
  type: 'timer';
  duration: number;
  onTimeout: Action[];
}

// =========== Animation ===========

export interface AnimateOption {
  animation: string;
  duration?: number;
  repeat?: number;
}

// =========== Agents ===========

export interface BaseAgent {
  id: string;
  position: Position;
}

export interface TextAgent extends BaseAgent {
  type: 'text';
  content: string | InterpolatedString;
  animate?: AnimateOption;
}

export interface ButtonAgent extends BaseAgent {
  type: 'button';
  label: string;
  events: Event[];
  animate?: AnimateOption;
}

export interface ImageAgent extends BaseAgent {
  type: 'image';
  src: string;
  animate?: AnimateOption;
  events?: Event[];
}

export interface VideoAgent extends BaseAgent {
  type: 'video';
  src: string;
}

// =========== Interpolated Strings ===========

export interface InterpolatedString {
  type: 'interpolated_string';
  parts: (string | { type: 'variable'; name: string })[];
}

// =========== Control Structures ===========

export interface IfBlock {
  type: 'if';
  condition: Expression;
  agents: Agent[];
}

export interface ForBlock {
  type: 'for';
  variable: string;
  range: Range;
  agents: Agent[];
}

// =========== Compound Types ===========

export type VisualAgent = TextAgent | ButtonAgent | ImageAgent | VideoAgent;
export type ControlAgent = IfBlock | ForBlock | WaitBlock;
export type Agent = VisualAgent | ControlAgent;

export interface Page {
  type: 'page';
  id: number;
  agents: Agent[];
  statements?: Statement[];
  autoAdvance?: number;
}

export interface Fable {
  type: 'fable';
  title: string;
  pages: Page[];
  statements?: Statement[];
}

// =========== Validation Result ===========

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// =========== Public API ===========

/**
 * Parse FableDSL source code into an AST
 * @param source - DSL source code
 * @returns The parsed AST
 * @throws Error with line/column info on parse failure
 */
export function parseDSL(source: string): Fable;

/**
 * Check if source code is valid FableDSL without throwing
 * @param source - DSL source code
 * @returns Validation result with optional error message
 */
export function validateDSL(source: string): ValidationResult;

/**
 * Get the raw Ohm grammar object for advanced use cases
 * @returns The Ohm grammar object
 */
export function getGrammar(): Grammar;

/**
 * The FableDSL grammar object
 */
export const grammar: Grammar;

/**
 * Create semantics for the FableDSL grammar
 * @param grammar - The Ohm grammar object
 * @returns Semantics object with toAST operation
 */
export function createSemantics(grammar: Grammar): Semantics;
