import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Variables & State', () => {
  it('should parse init statement for variable initialization', () => {
    const dsl = `
      fable "Test" do
        init score to 0
        page 1 do
          text "Start" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements).toHaveLength(1);
    expect(ast.statements[0]).toEqual({
      type: 'init',
      variable: 'score',
      value: { type: 'number', value: 0 }
    });
  });

  it('should parse set statement for reassignment', () => {
    const dsl = `
      fable "Test" do
        init score to 0
        set score to 10
        page 1 do
          text "Start" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements).toHaveLength(2);
    expect(ast.statements[0]).toEqual({
      type: 'init',
      variable: 'score',
      value: { type: 'number', value: 0 }
    });
    expect(ast.statements[1]).toEqual({
      type: 'set',
      variable: 'score',
      value: { type: 'number', value: 10 }
    });
  });

  it('should parse init statement with string', () => {
    const dsl = `
      fable "Test" do
        init name to "Hero"
        page 1 do
          text "Hello" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements[0]).toEqual({
      type: 'init',
      variable: 'name',
      value: { type: 'string', value: 'Hero' }
    });
  });

  it('should parse init statement with boolean', () => {
    const dsl = `
      fable "Test" do
        init active to true
        page 1 do
          text "Test" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements[0]).toEqual({
      type: 'init',
      variable: 'active',
      value: { type: 'boolean', value: true }
    });
  });

  it('should parse add and subtract statements', () => {
    const dsl = `
      fable "Test" do
        init score to 10
        add 5 to score
        subtract 2 from score
        page 1 do
          text "Done" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements).toHaveLength(3);
    expect(ast.statements[1]).toEqual({
      type: 'add',
      amount: { type: 'number', value: 5 },
      variable: 'score'
    });
    expect(ast.statements[2]).toEqual({
      type: 'subtract',
      amount: { type: 'number', value: 2 },
      variable: 'score'
    });
  });

  it('should parse random expressions', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          init result to random 1..10
        end
      end
    `;

    const ast = parseDSL(dsl);
    const statement = ast.pages[0].statements[0];

    expect(statement.type).toBe('init');
    expect(statement.variable).toBe('result');
    expect(statement.value).toEqual({
      type: 'random',
      range: { start: 1, end: 10 }
    });
  });

  it('should parse pick_one expressions', () => {
    const dsl = `
      fable "Test" do
        init color to pick_one ["red", "blue", "green"]
        page 1 do
          text "Start" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements[0]).toEqual({
      type: 'init',
      variable: 'color',
      value: {
        type: 'pick_one',
        list: ['red', 'blue', 'green']
      }
    });
  });

  it('should parse arithmetic expressions', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          init result to 5 + 3 * 2
        end
      end
    `;

    const ast = parseDSL(dsl);
    const statement = ast.pages[0].statements[0];

    expect(statement.type).toBe('init');
    expect(statement.variable).toBe('result');
    expect(statement.value).toEqual({
      type: 'binary_op',
      operator: '+',
      left: { type: 'number', value: 5 },
      right: {
        type: 'binary_op',
        operator: '*',
        left: { type: 'number', value: 3 },
        right: { type: 'number', value: 2 }
      }
    });
  });

  it('should parse string concatenation', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          init greeting to "Hello" + " World"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const statement = ast.pages[0].statements[0];

    expect(statement.type).toBe('init');
    expect(statement.variable).toBe('greeting');
    expect(statement.value).toEqual({
      type: 'binary_op',
      operator: '+',
      left: { type: 'string', value: 'Hello' },
      right: { type: 'string', value: 'World' }
    });
  });

  it('should parse comparison operators', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          init is_high_score to score > 100
          init is_equal to count == 5
          init is_different to name != "Player"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const statements = ast.pages[0].statements;

    expect(statements[0].value).toEqual({
      type: 'binary_op',
      operator: '>',
      left: { type: 'variable', name: 'score' },
      right: { type: 'number', value: 100 }
    });

    expect(statements[1].value).toEqual({
      type: 'binary_op',
      operator: '==',
      left: { type: 'variable', name: 'count' },
      right: { type: 'number', value: 5 }
    });

    expect(statements[2].value).toEqual({
      type: 'binary_op',
      operator: '!=',
      left: { type: 'variable', name: 'name' },
      right: { type: 'string', value: 'Player' }
    });
  });

  it('should parse logical operators', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          init can_attack to health > 0 and mana >= 10
          init should_flee to health < 20 or enemy_count > 5
          init is_dead to not is_alive
        end
      end
    `;

    const ast = parseDSL(dsl);
    const statements = ast.pages[0].statements;

    expect(statements[0].value).toEqual({
      type: 'binary_op',
      operator: '&&',
      left: {
        type: 'binary_op',
        operator: '>',
        left: { type: 'variable', name: 'health' },
        right: { type: 'number', value: 0 }
      },
      right: {
        type: 'binary_op',
        operator: '>=',
        left: { type: 'variable', name: 'mana' },
        right: { type: 'number', value: 10 }
      }
    });

    expect(statements[1].value).toEqual({
      type: 'binary_op',
      operator: '||',
      left: {
        type: 'binary_op',
        operator: '<',
        left: { type: 'variable', name: 'health' },
        right: { type: 'number', value: 20 }
      },
      right: {
        type: 'binary_op',
        operator: '>',
        left: { type: 'variable', name: 'enemy_count' },
        right: { type: 'number', value: 5 }
      }
    });

    expect(statements[2].value).toEqual({
      type: 'unary_op',
      operator: '!',
      operand: { type: 'variable', name: 'is_alive' }
    });
  });

  it('should parse modulus operator', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          init remainder to score % 10
        end
      end
    `;

    const ast = parseDSL(dsl);
    const statement = ast.pages[0].statements[0];

    expect(statement.type).toBe('init');
    expect(statement.variable).toBe('remainder');
    expect(statement.value).toEqual({
      type: 'binary_op',
      operator: '%',
      left: { type: 'variable', name: 'score' },
      right: { type: 'number', value: 10 }
    });
  });

  it('should handle operator precedence', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          init result to 2 + 3 * 4 == 14 and true
        end
      end
    `;

    const ast = parseDSL(dsl);
    const statement = ast.pages[0].statements[0];

    expect(statement.value).toEqual({
      type: 'binary_op',
      operator: '&&',
      left: {
        type: 'binary_op',
        operator: '==',
        left: {
          type: 'binary_op',
          operator: '+',
          left: { type: 'number', value: 2 },
          right: {
            type: 'binary_op',
            operator: '*',
            left: { type: 'number', value: 3 },
            right: { type: 'number', value: 4 }
          }
        },
        right: { type: 'number', value: 14 }
      },
      right: { type: 'boolean', value: true }
    });
  });
});
