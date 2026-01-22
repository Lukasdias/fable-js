import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FableState } from '../src/engine/fable-state.js';
import { ExpressionEvaluator } from '../src/engine/expression-evaluator.js';

describe('Runtime Engine', () => {
  let testAst;
  let state;

  beforeEach(() => {
    testAst = {
      title: 'Test Story',
      pages: [
        {
          id: 1,
          agents: [
            { type: 'text', id: 'text1', content: 'Hello', position: [100, 100] }
          ],
          statements: []
        }
      ]
    };
    state = new FableState(testAst);
  });

  describe('FableState', () => {
    it('should create fable state with valid AST', () => {
      expect(state.getCurrentPage().id).toBe(1);
      expect(testAst.title).toBe('Test Story'); // Title is in AST, not state
    });

    it('should navigate to pages', () => {
      // Add another page
      const newPage = { id: 2, agents: [], statements: [] };
      testAst.pages.push(newPage);

      state.goToPage(2);
      expect(state.getCurrentPage().id).toBe(2);
    });

    it('should manage variables', () => {
      state.setVariable('score', 100);
      expect(state.getVariable('score')).toBe(100);
      expect(state.getVariable('nonexistent')).toBeUndefined();
      expect(state.hasVariable('score')).toBe(true);
      expect(state.hasVariable('nonexistent')).toBe(false);
    });

    it('should handle page navigation history', () => {
      const newPage = { id: 2, agents: [], statements: [] };
      testAst.pages.push(newPage);

      state.goToPage(2);
      expect(state.getCurrentPage().id).toBe(2);

      state.goBack();
      expect(state.getCurrentPage().id).toBe(1);
    });
  });

  describe('ExpressionEvaluator', () => {
    let evaluator;

    beforeEach(() => {
      evaluator = new ExpressionEvaluator(state);
    });

    it('should evaluate numbers', () => {
      expect(evaluator.evaluate({ type: 'number', value: 42 })).toBe(42);
    });

    it('should evaluate variables', () => {
      state.setVariable('x', 10);
      expect(evaluator.evaluate({ type: 'variable', name: 'x' })).toBe(10);
      expect(evaluator.evaluate({ type: 'variable', name: 'missing' })).toBe(0); // Missing variables return 0
    });

    it('should evaluate ranges', () => {
      const rangeExpr = {
        type: 'range',
        start: 1,
        end: 5
      };
      expect(evaluator.evaluate(rangeExpr)).toEqual([1, 2, 3, 4, 5]); // Returns array, not object
    });

    it('should evaluate arrays', () => {
      const arrayExpr = {
        type: 'array',
        elements: [  // Uses 'elements' not 'items'
          { type: 'string', value: 'apple' },
          { type: 'number', value: 42 }
        ]
      };
      expect(evaluator.evaluate(arrayExpr)).toEqual(['apple', 42]);
    });

    it('should evaluate binary operations', () => {
      const expr = {
        type: 'binary_op',
        operator: '+',
        left: { type: 'number', value: 5 },
        right: { type: 'number', value: 3 }
      };
      expect(evaluator.evaluate(expr)).toBe(8);

      const subtractExpr = {
        type: 'binary_op',
        operator: '-',
        left: { type: 'number', value: 10 },
        right: { type: 'number', value: 4 }
      };
      expect(evaluator.evaluate(subtractExpr)).toBe(6);

      const multiplyExpr = {
        type: 'binary_op',
        operator: '*',
        left: { type: 'number', value: 6 },
        right: { type: 'number', value: 7 }
      };
      expect(evaluator.evaluate(multiplyExpr)).toBe(42);
    });

    it('should evaluate comparison operations', () => {
      const equalExpr = {
        type: 'binary_op',
        operator: '==',
        left: { type: 'number', value: 5 },
        right: { type: 'number', value: 5 }
      };
      expect(evaluator.evaluate(equalExpr)).toBe(true);

      const notEqualExpr = {
        type: 'binary_op',
        operator: '!=',
        left: { type: 'number', value: 5 },
        right: { type: 'number', value: 3 }
      };
      expect(evaluator.evaluate(notEqualExpr)).toBe(true);
    });

    it('should evaluate logical operations', () => {
      const andExpr = {
        type: 'binary_op',
        operator: '&&',
        left: { type: 'boolean', value: true },
        right: { type: 'boolean', value: false }
      };
      expect(evaluator.evaluate(andExpr)).toBe(false);

      const orExpr = {
        type: 'binary_op',
        operator: '||',
        left: { type: 'boolean', value: true },
        right: { type: 'boolean', value: false }
      };
      expect(evaluator.evaluate(orExpr)).toBe(true);
    });

    it('should evaluate strings', () => {
      expect(evaluator.evaluate({ type: 'string', value: 'hello' })).toBe('hello');
    });

    it('should evaluate boolean literals', () => {
      expect(evaluator.evaluate({ type: 'boolean', value: true })).toBe(true);
      expect(evaluator.evaluate({ type: 'boolean', value: false })).toBe(false);
    });

    it('should evaluate unary operations', () => {
      const notExpr = {
        type: 'unary_op',
        operator: '!',
        operand: { type: 'boolean', value: true }
      };
      expect(evaluator.evaluate(notExpr)).toBe(false);

      const negExpr = {
        type: 'unary_op',
        operator: '-',
        operand: { type: 'number', value: 5 }
      };
      expect(evaluator.evaluate(negExpr)).toBe(-5);
    });

    it('should evaluate interpolated strings', () => {
      state.setVariable('name', 'Alice');
      const interpolated = {
        type: 'interpolated_string',
        parts: [
          'Hello ',
          { type: 'variable', name: 'name' },
          '!'
        ]
      };
      expect(evaluator.evaluate(interpolated)).toBe('Hello Alice!');
    });

    it('should evaluate random expressions', () => {
      const randomExpr = {
        type: 'random',
        range: { start: 1, end: 10 }
      };
      const result = evaluator.evaluate(randomExpr);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should evaluate pick_one expressions', () => {
      const pickExpr = {
        type: 'pick_one',
        options: ['red', 'blue', 'green']  // Uses 'options' not 'list'
      };
      const result = evaluator.evaluate(pickExpr);
      expect(['red', 'blue', 'green']).toContain(result);
    });

    it('should handle complex nested expressions', () => {
      // Test: (5 + 3) * 2 == 16
      const complexExpr = {
        type: 'binary_op',
        operator: '==',
        left: {
          type: 'binary_op',
          operator: '*',
          left: {
            type: 'binary_op',
            operator: '+',
            left: { type: 'number', value: 5 },
            right: { type: 'number', value: 3 }
          },
          right: { type: 'number', value: 2 }
        },
        right: { type: 'number', value: 16 }
      };

      expect(evaluator.evaluate(complexExpr)).toBe(true);
    });

    it('should evaluate modulo operations', () => {
      const modExpr = {
        type: 'binary_op',
        operator: '%',
        left: { type: 'number', value: 17 },
        right: { type: 'number', value: 5 }
      };
      expect(evaluator.evaluate(modExpr)).toBe(2);
    });

    it('should handle boolean logic with mixed types', () => {
      // Test: true && (5 > 3)
      const mixedLogic = {
        type: 'binary_op',
        operator: '&&',
        left: { type: 'boolean', value: true },
        right: {
          type: 'binary_op',
          operator: '>',
          left: { type: 'number', value: 5 },
          right: { type: 'number', value: 3 }
        }
      };
      expect(evaluator.evaluate(mixedLogic)).toBe(true);
    });

    it('should handle unary not with expressions', () => {
      // Test: !(5 < 3)
      const notExpr = {
        type: 'unary_op',
        operator: '!',
        operand: {
          type: 'binary_op',
          operator: '<',
          left: { type: 'number', value: 5 },
          right: { type: 'number', value: 3 }
        }
      };
      expect(evaluator.evaluate(notExpr)).toBe(true);
    });
  });


});