import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Animation', () => {
  it('should parse animate option on agents', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          text "Bounce!" at [100, 100] animate "bounce"
          button "Pulse" at [200, 200] do end
          image "star.png" at [50, 50] animate "spin"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const agents = ast.pages[0].agents;

    expect(agents[0].animate).toEqual({
      animation: 'bounce'
    });
    expect(agents[1].animate).toBeUndefined(); // button has no animate
    expect(agents[2].animate).toEqual({
      animation: 'spin'
    });
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
              stop_animation #animated
            end
          end
          image #animated "animated.png" at [200, 200] animate "spin"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const actions = ast.pages[0].agents[0].events[0].statements;

    expect(actions[0]).toEqual({
      type: 'stop_animation',
      agentId: 'animated'
    });
  });

  it('should parse move action with duration only', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Move" at [100, 100] do
            on_click do
              move #box to [200, 200] duration 500ms
            end
          end
          image #box "box.png" at [50, 50]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const actions = ast.pages[0].agents[0].events[0].statements;

    expect(actions[0].type).toBe('move');
    expect(actions[0].agentId).toBe('box');
    expect(actions[0].to).toEqual([200, 200]);
    expect(actions[0].duration).toBe(500);
  });

  it('should parse multiple animation-related actions', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Animate" at [100, 100] do
            on_click do
              move #player to [400, 300] duration 1s easing "ease-in-out"
              move #enemy to [100, 100] duration 500ms
              stop_animation #spinning
            end
          end
          image #player "player.png" at [50, 50]
          image #enemy "enemy.png" at [300, 300]
          image #spinning "star.png" at [200, 200] animate "spin"
        end
      end
    `;

    const ast = parseDSL(dsl);
    const actions = ast.pages[0].agents[0].events[0].statements;

    expect(actions).toHaveLength(3);
    expect(actions[0].agentId).toBe('player');
    expect(actions[0].easing).toBe('ease-in-out');
    expect(actions[1].agentId).toBe('enemy');
    expect(actions[2].agentId).toBe('spinning');
  });
});
