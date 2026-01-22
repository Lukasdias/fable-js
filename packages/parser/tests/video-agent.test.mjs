import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Video Agent', () => {
  it('should parse video agent with src and position', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          video "intro.mp4" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const videoAgent = ast.pages[0].agents[0];

    expect(typeof videoAgent.id).toBe('string');
    expect(videoAgent.type).toBe('video');
    expect(videoAgent.src).toBe('intro.mp4');
    expect(videoAgent.position).toEqual([100, 100]);
  });

  it('should parse video agent with explicit #id', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          video #intro-video "intro.mp4" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const videoAgent = ast.pages[0].agents[0];

    expect(videoAgent.id).toBe('intro-video');
    expect(videoAgent.type).toBe('video');
    expect(videoAgent.src).toBe('intro.mp4');
  });

  it('should parse multiple video agents', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          video #vid1 "intro.mp4" at [0, 0]
          video #vid2 "outro.mp4" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const agents = ast.pages[0].agents;

    expect(agents).toHaveLength(2);
    expect(agents[0].id).toBe('vid1');
    expect(agents[0].src).toBe('intro.mp4');
    expect(agents[1].id).toBe('vid2');
    expect(agents[1].src).toBe('outro.mp4');
  });
});
