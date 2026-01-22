import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Button Agent', () => {
  it('should parse button agent with label and position', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Click Me" at [200, 150] do
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const buttonAgent = ast.pages[0].agents[0];

    expect(typeof buttonAgent.id).toBe('string');
    expect(buttonAgent.type).toBe('button');
    expect(buttonAgent.label).toBe('Click Me');
    expect(buttonAgent.position).toEqual([200, 150]);
    expect(buttonAgent.events).toEqual([]);
  });

  it('should parse button agent with explicit #id', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button #submit-btn "Submit" at [200, 150] do
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const buttonAgent = ast.pages[0].agents[0];

    expect(buttonAgent.id).toBe('submit-btn');
    expect(buttonAgent.type).toBe('button');
    expect(buttonAgent.label).toBe('Submit');
  });

  it('should parse button with on_click event and go_to_page action', () => {
    const dsl = `
      fable "Interactive" do
        page 1 do
          button "Next" at [200, 200] do
            on_click do
              go_to_page 2
            end
          end
        end
        page 2 do
          text "Page 2" at [100, 100]
        end
      end
    `;

    const ast = parseDSL(dsl);
    const buttonAgent = ast.pages[0].agents[0];

    expect(buttonAgent.events).toHaveLength(1);
    expect(buttonAgent.events[0].type).toBe('on_click');
    expect(buttonAgent.events[0].statements[0].type).toBe('go_to_page');
    expect(buttonAgent.events[0].statements[0].target).toBe(2);
  });

  it('should parse button with multiple events (hover, drag)', () => {
    const dsl = `
      fable "Interactive" do
        page 1 do
          button "Action" at [200, 200] do
            on_hover do
              go_to_page 2
            end
            on_drag do
              go_to_page 3
            end
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const buttonAgent = ast.pages[0].agents[0];

    expect(buttonAgent.events).toHaveLength(2);
    expect(buttonAgent.events[0].type).toBe('on_hover');
    expect(buttonAgent.events[0].statements[0].target).toBe(2);
    expect(buttonAgent.events[1].type).toBe('on_drag');
    expect(buttonAgent.events[1].statements[0].target).toBe(3);
  });

  it('should parse on_drop event', () => {
    const dsl = `
      fable "DragDrop" do
        page 1 do
          button "Drop Zone" at [300, 300] do
            on_drop do
              go_to_page 5
            end
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const buttonAgent = ast.pages[0].agents[0];

    expect(buttonAgent.events[0].type).toBe('on_drop');
    expect(buttonAgent.events[0].statements[0].target).toBe(5);
  });

  it('should parse button with animate option', () => {
    const dsl = `
      fable "Test" do
        page 1 do
          button "Pulse" at [200, 200] animate "pulse" do
          end
        end
      end
    `;

    const ast = parseDSL(dsl);
    const buttonAgent = ast.pages[0].agents[0];

    expect(buttonAgent.animate).toEqual({
      animation: 'pulse'
    });
  });
});
