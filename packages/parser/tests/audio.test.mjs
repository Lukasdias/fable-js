import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Audio', () => {
  it('should parse music statement with basic options', () => {
    const dsl = `
      fable "Test" do
        music "theme.mp3"
        music "bg.mp3" loop true
        music "effect.mp3" volume 0.5
        page 1 do
          text "Test" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements[0]).toEqual({
      type: 'music',
      src: 'theme.mp3'
    });
    expect(ast.statements[1]).toEqual({
      type: 'music',
      src: 'bg.mp3',
      loop: true
    });
    expect(ast.statements[2]).toEqual({
      type: 'music',
      src: 'effect.mp3',
      volume: 0.5
    });
  });

  it('should parse play_sound action with volume', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Click" at [100, 100] do
            on_click do
              play_sound "click.mp3"
              play_sound "effect.mp3" volume 0.8
              stop_music
              stop_sound "background.mp3"
            end
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const button = ast.pages[0].agents[0];
    const actions = button.events[0].statements;

    expect(actions).toHaveLength(4);
    expect(actions[0]).toEqual({
      type: 'play_sound',
      src: 'click.mp3'
    });
    expect(actions[1]).toEqual({
      type: 'play_sound',
      src: 'effect.mp3',
      volume: 0.8
    });
    expect(actions[2]).toEqual({
      type: 'stop_music'
    });
    expect(actions[3]).toEqual({
      type: 'stop_sound',
      src: 'background.mp3'
    });
  });

  it('should parse music with both loop and volume', () => {
    const dsl = `
      fable "Test" do
        music "ambient.mp3" loop true volume 0.3
        page 1 do
          text "Playing" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.statements[0]).toEqual({
      type: 'music',
      src: 'ambient.mp3',
      loop: true,
      volume: 0.3
    });
  });
});
