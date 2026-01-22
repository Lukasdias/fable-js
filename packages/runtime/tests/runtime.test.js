import { describe, it, expect } from 'vitest';
import { FableState } from '../src/engine/fable-state.js';
import { ExpressionEvaluator } from '../src/engine/expression-evaluator.js';

describe('Runtime Engine', () => {
  it('should create fable state', () => {
    const ast = {
      title: 'Test Story',
      pages: [{ id: 1, agents: [], statements: [] }]
    };

    const state = new FableState(ast);
    expect(state.getCurrentPage().id).toBe(1);
  });

  it('should evaluate expressions', () => {
    const ast = { title: 'Test', pages: [] };
    const state = new FableState(ast);
    const evaluator = new ExpressionEvaluator(state);

    // Test number
    expect(evaluator.evaluate({ type: 'number', value: 42 })).toBe(42);

    // Test variable
    state.setVariable('x', 10);
    expect(evaluator.evaluate({ type: 'variable', name: 'x' })).toBe(10);

    // Test binary operation
    const expr = {
      type: 'binary_op',
      operator: '+',
      left: { type: 'number', value: 5 },
      right: { type: 'number', value: 3 }
    };
    expect(evaluator.evaluate(expr)).toBe(8);
  });
});