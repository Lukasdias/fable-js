import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Image Agent', () => {
  it('should parse image agent with src and position', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          image "background.jpg" at [0, 0]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const imageAgent = ast.pages[0].agents[0];

    expect(typeof imageAgent.id).toBe('string');
    expect(imageAgent.type).toBe('image');
    expect(imageAgent.src).toBe('background.jpg');
    expect(imageAgent.position).toEqual([0, 0]);
  });

  it('should parse image agent with explicit #id', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          image #bg "background.jpg" at [0, 0]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const imageAgent = ast.pages[0].agents[0];

    expect(imageAgent.id).toBe('bg');
    expect(imageAgent.type).toBe('image');
    expect(imageAgent.src).toBe('background.jpg');
  });

  it('should parse image agent with animate option', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          image "star.png" at [50, 50] animate "spin"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const imageAgent = ast.pages[0].agents[0];

    expect(imageAgent.animate).toEqual({
      animation: 'spin'
    });
  });

  it('should parse multiple image agents', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          image #bg "background.png" at [0, 0]
          image #player "player.png" at [100, 100]
          image #enemy "enemy.png" at [200, 200] animate "bounce"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const agents = ast.pages[0].agents;

    expect(agents).toHaveLength(3);
    expect(agents[0].id).toBe('bg');
    expect(agents[1].id).toBe('player');
    expect(agents[2].id).toBe('enemy');
    expect(agents[2].animate).toEqual({ animation: 'bounce' });
  });
});
