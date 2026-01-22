import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Text Agent', () => {
  it('should parse text agent with position', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          text "Sample Text" at [50, 75]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const textAgent = ast.pages[0].agents[0];

    expect(typeof textAgent.id).toBe('string');
    expect(textAgent.type).toBe('text');
    expect(textAgent.content).toEqual({
      type: 'interpolated_string',
      parts: ['Sample Text']
    });
    expect(textAgent.position).toEqual([50, 75]);
  });

  it('should parse text agent with explicit #id', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          text #greeting "Hello World" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const textAgent = ast.pages[0].agents[0];

    expect(textAgent.id).toBe('greeting');
    expect(textAgent.type).toBe('text');
    expect(textAgent.content).toEqual({
      type: 'interpolated_string',
      parts: ['Hello World']
    });
  });

  it('should parse text agent with animate option', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          text "Bounce!" at [100, 100] animate "bounce"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const textAgent = ast.pages[0].agents[0];

    expect(textAgent.animate).toEqual({
      animation: 'bounce'
    });
  });

  it('should parse interpolated strings in text agents', () => {
    const dsl = `
      fable "Test" do
        init name to "Alice"
        page 1 do
          text "Hello, {name}!" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const textAgent = ast.pages[0].agents[0];

    expect(textAgent.content).toEqual({
      type: 'interpolated_string',
      parts: [
        'Hello, ',
        { type: 'variable', name: 'name' },
        '!'
      ]
    });
  });

  it('should parse multiple variables in interpolated string', () => {
    const dsl = `
      fable "Test" do
        init score to 42
        init name to "Bob"
        page 1 do
          text "{name} scored {score} points!" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const textAgent = ast.pages[0].agents[0];

    expect(textAgent.content.parts).toEqual([
      { type: 'variable', name: 'name' },
      ' scored ',
      { type: 'variable', name: 'score' },
      ' points!'
    ]);
  });

  it('should parse interpolated string with only text', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          text "No variables here!" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const textAgent = ast.pages[0].agents[0];

    expect(textAgent.content).toEqual({
      type: 'interpolated_string',
      parts: ['No variables here!']
    });
  });
});
