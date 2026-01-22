/**
 * Expression evaluator for FableJS runtime
 * Evaluates arithmetic, comparison, and logical expressions
 */

import type { Expression as ParserExpression } from '@fable-js/parser';

// Extended expression types for runtime evaluation
type RuntimeExpression =
  | ParserExpression
  | { type: 'binary_op'; operator: string; left: RuntimeExpression; right: RuntimeExpression }
  | { type: 'unary_op'; operator: string; operand: RuntimeExpression }
  | { type: 'range'; start: number; end: number }
  | { type: 'array'; elements: RuntimeExpression[] }
  | { type: 'interpolated_string'; parts: (string | { type: 'variable'; name: string })[] };

export class ExpressionEvaluator {
  private state: { getVariable(name: string): any; hasVariable(name: string): boolean };

  constructor(state: { getVariable(name: string): any; hasVariable(name: string): boolean }) {
    this.state = state;
  }

  evaluate(expr: RuntimeExpression): any {
    if (!expr || !expr.type) return null;

    switch (expr.type) {
      case 'number':
        return expr.value;

      case 'string':
        return expr.value;

      case 'boolean':
        return expr.value;

      case 'variable':
        return this.state.getVariable(expr.name) ?? 0;

      case 'binary_op':
        return this.evaluateBinaryOp(expr);

      case 'unary_op':
        return this.evaluateUnaryOp(expr);

      case 'range':
        return this.evaluateRange(expr);

      case 'array':
        return expr.elements.map(el => this.evaluate(el));

      case 'random':
        return this.evaluateRandom(expr);

      case 'pick_one':
        return this.evaluatePickOne(expr);

      case 'interpolated_string':
        return this.evaluateInterpolatedString(expr);

      default:
        console.warn('Unknown expression type:', (expr as any).type);
        return null;
    }
  }

  private evaluateBinaryOp(expr: { operator: string; left: RuntimeExpression; right: RuntimeExpression }): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator) {
      // Arithmetic
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '%':
        return left % right;

      // Comparison
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;

      // Logical
      case '&&':
        return left && right;
      case '||':
        return left || right;

      default:
        console.warn('Unknown binary operator:', expr.operator);
        return null;
    }
  }

  private evaluateUnaryOp(expr: { operator: string; operand: RuntimeExpression }): any {
    const operand = this.evaluate(expr.operand);

    switch (expr.operator) {
      case '!':
        return !operand;

      case '-':
        return -operand;

      default:
        console.warn('Unknown unary operator:', expr.operator);
        return null;
    }
  }

  private evaluateRange(expr: { start: number; end: number }): number[] {
    const result: number[] = [];
    for (let i = expr.start; i <= expr.end; i++) {
      result.push(i);
    }
    return result;
  }

  private evaluateRandom(expr: { range?: { start: number; end: number } }): number {
    if (expr.range) {
      const { start, end } = expr.range;
      return Math.floor(Math.random() * (end - start + 1)) + start;
    }
    return Math.random();
  }

  private evaluatePickOne(expr: { options?: string[] }): any {
    const options = expr.options || [];
    if (Array.isArray(options) && options.length > 0) {
      return options[Math.floor(Math.random() * options.length)];
    }
    return null;
  }

  private evaluateInterpolatedString(expr: { parts: (string | { type: 'variable'; name: string })[] }): string {
    return expr.parts.map(part => {
      if (typeof part === 'string') {
        return part;
      } else if (part.type === 'variable') {
        return this.evaluate(part) ?? '';
      }
      return '';
    }).join('');
  }
}