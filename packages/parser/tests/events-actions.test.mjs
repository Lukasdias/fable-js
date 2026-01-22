import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Events and Actions', () => {
  it('should handle multiple agents on the same page', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          text "Welcome" at [100, 100]
          button "Start" at [200, 200] do
            on_click do
              go_to_page 2
            end
          end
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.pages[0].agents).toHaveLength(2);
    expect(ast.pages[0].agents[0].type).toBe('text');
    expect(ast.pages[0].agents[1].type).toBe('button');
  });

  it('should assign unique IDs to multiple agents', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          text "First" at [0, 0]
          text "Second" at [100, 0]
          button "Third" at [200, 0] do end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const agents = ast.pages[0].agents;

    // All IDs should be strings and unique
    expect(typeof agents[0].id).toBe('string');
    expect(typeof agents[1].id).toBe('string');
    expect(typeof agents[2].id).toBe('string');
    expect(agents[0].id).not.toBe(agents[1].id);
    expect(agents[1].id).not.toBe(agents[2].id);
  });

  it('should parse move action with #id reference', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Move" at [100, 100] do
            on_click do
              move #target to [300, 200] duration 1s easing "ease-out"
            end
          end
          text #target "Target" at [50, 50]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const actions = ast.pages[0].agents[0].events[0].statements;

    expect(actions[0]).toEqual({
      type: 'move',
      agentId: 'target',
      to: [300, 200],
      duration: 1000,
      easing: 'ease-out'
    });
  });

  it('should parse stop_animation action with #id reference', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Stop" at [100, 100] do
            on_click do
              stop_animation #animated-img
            end
          end
          image #animated-img "animated.png" at [200, 200] animate "spin"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const actions = ast.pages[0].agents[0].events[0].statements;

    expect(actions[0]).toEqual({
      type: 'stop_animation',
      agentId: 'animated-img'
    });
  });

  it('should parse multiple actions in on_click', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Do All" at [100, 100] do
            on_click do
              play_sound "click.mp3"
              move #box to [200, 200] duration 500ms
              add 10 to score
              go_to_page 2
            end
          end
          image #box "box.png" at [50, 50]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const actions = ast.pages[0].agents[0].events[0].statements;

    expect(actions).toHaveLength(4);
    expect(actions[0].type).toBe('play_sound');
    expect(actions[1].type).toBe('move');
    expect(actions[1].agentId).toBe('box');
    expect(actions[2].type).toBe('add');
    expect(actions[3].type).toBe('go_to_page');
  });
});
