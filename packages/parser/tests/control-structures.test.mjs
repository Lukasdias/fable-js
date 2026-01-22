import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Control Structures', () => {
  it('should parse for loop with agents', () => {
    const dsl = `
      fable "Loop" do
        page 1 do
          for i in 0..3 do
            image "tile.png" at [100, 100]
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const forBlock = ast.pages[0].agents[0];

    expect(forBlock.type).toBe('for');
    expect(forBlock.variable).toBe('i');
    expect(forBlock.range.start).toBe(0);
    expect(forBlock.range.end).toBe(3);
    expect(forBlock.agents).toHaveLength(1);
    expect(forBlock.agents[0].type).toBe('image');
  });

  it('should parse if conditional block', () => {
    const dsl = `
      fable "Conditional" do
        page 1 do
          if "health > 50" do
            text "You are strong!" at [100, 100]
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const ifBlock = ast.pages[0].agents[0];

    expect(ifBlock.type).toBe('if');
    expect(ifBlock.condition).toBe('health > 50');
    expect(ifBlock.agents).toHaveLength(1);
    expect(ifBlock.agents[0].type).toBe('text');
    expect(ifBlock.agents[0].content).toEqual({
      type: 'interpolated_string',
      parts: ['You are strong!']
    });
  });

  it('should parse nested control structures', () => {
    const dsl = `
      fable "Nested" do
        page 1 do
          for i in 1..5 do
            if "i > 2" do
              text "Large number" at [100, 100]
            end
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const forBlock = ast.pages[0].agents[0];
    const ifBlock = forBlock.agents[0];

    expect(forBlock.type).toBe('for');
    expect(ifBlock.type).toBe('if');
    expect(ifBlock.agents[0].type).toBe('text');
  });

  it('should parse for loop with multiple agents', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          for i in 0..2 do
            image "tile.png" at [100, 100]
            text "Label" at [100, 150]
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const forBlock = ast.pages[0].agents[0];

    expect(forBlock.type).toBe('for');
    expect(forBlock.agents).toHaveLength(2);
    expect(forBlock.agents[0].type).toBe('image');
    expect(forBlock.agents[1].type).toBe('text');
  });
});
