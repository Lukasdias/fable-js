import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Timing', () => {
  it('should parse wait blocks', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          wait 2s do
            go_to_page 2
          end
          after 500ms do
            play_sound "tick.mp3"
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const agents = ast.pages[0].agents;

    expect(agents[0]).toEqual({
      type: 'wait',
      duration: 2000, // converted to ms
      actions: [{ type: 'go_to_page', target: 2 }]
    });
    expect(agents[1]).toEqual({
      type: 'wait',
      duration: 500,
      actions: [{ type: 'play_sound', src: 'tick.mp3' }]
    });
  });

  it('should parse timer blocks', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          timer 10s on_timeout do
            text "Time's up!" at [100, 100]
            go_to_page 2
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const timer = ast.pages[0].agents[0];

    expect(timer.type).toBe('timer');
    expect(timer.duration).toBe(10000);
    expect(timer.onTimeout.agents).toHaveLength(1);
    expect(timer.onTimeout.agents[0].type).toBe('text');
    expect(typeof timer.onTimeout.agents[0].id).toBe('string');
    expect(timer.onTimeout.agents[0].content).toEqual({
      type: 'interpolated_string',
      parts: ["Time's up!"]
    });
    expect(timer.onTimeout.actions).toHaveLength(1);
    expect(timer.onTimeout.actions[0]).toEqual({ type: 'go_to_page', target: 2 });
  });

  it('should parse auto_advance page option', () => {
    const dsl = `
      fable "Test" do
        page 1 auto_advance 5s do
          text "Loading..." at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.pages[0].autoAdvance).toBe(5000); // converted to ms
  });

  it('should parse wait with multiple actions', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          wait 1s do
            play_sound "ding.mp3"
            add 5 to score
            go_to_page 2
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const waitBlock = ast.pages[0].agents[0];

    expect(waitBlock.type).toBe('wait');
    expect(waitBlock.duration).toBe(1000);
    expect(waitBlock.actions).toHaveLength(3);
    expect(waitBlock.actions[0].type).toBe('play_sound');
    expect(waitBlock.actions[1].type).toBe('add');
    expect(waitBlock.actions[2].type).toBe('go_to_page');
  });
});
