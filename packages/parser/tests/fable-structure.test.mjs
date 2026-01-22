import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Basic Fable Structure', () => {
  it('should parse a simple fable with one page', () => {
    const dsl = `
      fable "Simple Story" do
        page 1 do
          text "Hello World" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.type).toBe('fable');
    expect(ast.title).toBe('Simple Story');
    expect(ast.pages).toHaveLength(1);
    expect(ast.pages[0].type).toBe('page');
    expect(ast.pages[0].id).toBe(1);
    expect(ast.pages[0].agents).toHaveLength(1);
    
    const agent = ast.pages[0].agents[0];
    expect(typeof agent.id).toBe('string');
    expect(agent.id.length).toBeGreaterThan(0);
    expect(agent.type).toBe('text');
    expect(agent.content).toEqual({
      type: 'interpolated_string',
      parts: ['Hello World']
    });
    expect(agent.position).toEqual([100, 100]);
  });

  it('should parse a fable with multiple pages', () => {
    const dsl = `
      fable "Multi-Page Story" do
        page 1 do
          text "Page 1" at [100, 100]
        end
        page 2 do
          text "Page 2" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.type).toBe('fable');
    expect(ast.title).toBe('Multi-Page Story');
    expect(ast.pages).toHaveLength(2);
    expect(ast.pages[0].id).toBe(1);
    expect(ast.pages[1].id).toBe(2);
  });

  it('should parse an empty fable with no pages', () => {
    const dsl = `
      fable "Empty Story" do
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.type).toBe('fable');
    expect(ast.title).toBe('Empty Story');
    expect(ast.pages).toEqual([]);
  });

  it('should ignore single-line comments', () => {
    const dsl = `
      fable "Commented" do
        // This is a comment
        page 1 do
          text "Hello" at [100, 100]  // inline comment
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.title).toBe('Commented');
    expect(ast.pages[0].agents[0].content).toEqual({
      type: 'interpolated_string',
      parts: ['Hello']
    });
  });
});
