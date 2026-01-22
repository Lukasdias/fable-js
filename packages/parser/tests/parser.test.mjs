import { describe, it, expect } from 'vitest';
import { parseDSL, validateDSL } from '../src/index.js';

describe('FableJS DSL Parser', () => {
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
      expect(ast.pages[0].agents[0]).toEqual({
        id: 1,
        type: 'text',
        content: {
          type: 'interpolated_string',
          parts: ['Hello World']
        },
        position: [100, 100]
      });
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
  });

  describe('Agents', () => {
    it('should parse text agents with positions', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            text "Sample Text" at [50, 75]
          end
        end
      `;

      const ast = parseDSL(dsl);
      const textAgent = ast.pages[0].agents[0];

      expect(textAgent.id).toBe(1);
      expect(textAgent.type).toBe('text');
      expect(textAgent.content).toEqual({
        type: 'interpolated_string',
        parts: ['Sample Text']
      });
      expect(textAgent.position).toEqual([50, 75]);
    });

    it('should parse button agents with labels and positions', () => {
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

      expect(buttonAgent.id).toBe(1);
      expect(buttonAgent.type).toBe('button');
      expect(buttonAgent.label).toBe('Click Me');
      expect(buttonAgent.position).toEqual([200, 150]);
      expect(buttonAgent.events).toEqual([]);
    });

    it('should parse image agents with src and positions', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            image "background.jpg" at [0, 0]
          end
        end
      `;

      const ast = parseDSL(dsl);
      const imageAgent = ast.pages[0].agents[0];

      expect(imageAgent.id).toBe(1);
      expect(imageAgent.type).toBe('image');
      expect(imageAgent.src).toBe('background.jpg');
      expect(imageAgent.position).toEqual([0, 0]);
    });

    it('should parse video agents with src and positions', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            video "intro.mp4" at [100, 100]
          end
        end
      `;

      const ast = parseDSL(dsl);
      const videoAgent = ast.pages[0].agents[0];

      expect(videoAgent.id).toBe(1);
      expect(videoAgent.type).toBe('video');
      expect(videoAgent.src).toBe('intro.mp4');
      expect(videoAgent.position).toEqual([100, 100]);
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

      expect(agents[0].id).toBe(1);
      expect(agents[1].id).toBe(2);
      expect(agents[2].id).toBe(3);
    });
  });

  describe('Events and Actions', () => {
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
  });

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
  });

  describe('Error Handling', () => {
    it('should throw an error for invalid DSL syntax', () => {
      const invalidDsl = `
        fable "Broken" do
          invalid syntax here
        end
      `;

      expect(() => parseDSL(invalidDsl)).toThrow();
    });

    it('should throw error for missing closing end', () => {
      const invalidDsl = `
        fable "Unclosed" do
          page 1 do
            text "Hello" at [100, 100]
      `;

      expect(() => parseDSL(invalidDsl)).toThrow();
    });

    it('should throw error for invalid position format', () => {
      const invalidDsl = `
        fable "BadPosition" do
          page 1 do
            text "Hello" at 100, 100
          end
        end
      `;

      expect(() => parseDSL(invalidDsl)).toThrow();
    });
  });

  describe('Validation', () => {
    it('should validate correct DSL', () => {
      const dsl = `
        fable "Valid" do
          page 1 do
            text "Hello" at [100, 100]
          end
        end
      `;

      const result = validateDSL(dsl);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error message for invalid DSL', () => {
      const invalidDsl = `
        fable "Invalid" do
          broken stuff
        end
      `;

      const result = validateDSL(invalidDsl);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });

  describe('Comments', () => {
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

  describe('Variables & State', () => {
    it('should parse init statement for variable initialization', () => {
      const dsl = `
        fable "Test" do
          init score to 0
          page 1 do
            text "Start" at [100, 100]
          end
        end
      `;

      const ast = parseDSL(dsl);

      expect(ast.statements).toHaveLength(1);
      expect(ast.statements[0]).toEqual({
        type: 'init',
        variable: 'score',
        value: { type: 'number', value: 0 }
      });
    });

    it('should parse set statement for reassignment', () => {
      const dsl = `
        fable "Test" do
          init score to 0
          set score to 10
          page 1 do
            text "Start" at [100, 100]
          end
        end
      `;

      const ast = parseDSL(dsl);

      expect(ast.statements).toHaveLength(2);
      expect(ast.statements[0]).toEqual({
        type: 'init',
        variable: 'score',
        value: { type: 'number', value: 0 }
      });
      expect(ast.statements[1]).toEqual({
        type: 'set',
        variable: 'score',
        value: { type: 'number', value: 10 }
      });
    });

    it('should parse init statement with string', () => {
      const dsl = `
        fable "Test" do
          init name to "Hero"
          page 1 do
            text "Hello" at [100, 100]
          end
        end
      `;

      const ast = parseDSL(dsl);

      expect(ast.statements[0]).toEqual({
        type: 'init',
        variable: 'name',
        value: { type: 'string', value: 'Hero' }
      });
    });

    it('should parse init statement with boolean', () => {
      const dsl = `
        fable "Test" do
          init active to true
          page 1 do
            text "Test" at [100, 100]
          end
        end
      `;

      const ast = parseDSL(dsl);

      expect(ast.statements[0]).toEqual({
        type: 'init',
        variable: 'active',
        value: { type: 'boolean', value: true }
      });
    });

    it('should parse add and subtract statements', () => {
      const dsl = `
        fable "Test" do
          init score to 10
          add 5 to score
          subtract 2 from score
          page 1 do
            text "Done" at [100, 100]
          end
        end
      `;

      const ast = parseDSL(dsl);

      expect(ast.statements).toHaveLength(3);
      expect(ast.statements[1]).toEqual({
        type: 'add',
        amount: { type: 'number', value: 5 },
        variable: 'score'
      });
      expect(ast.statements[2]).toEqual({
        type: 'subtract',
        amount: { type: 'number', value: 2 },
        variable: 'score'
      });
    });

    it('should parse random expressions', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            init result to random 1..10
          end
        end
      `;

      const ast = parseDSL(dsl);
      const statement = ast.pages[0].statements[0];

      expect(statement.type).toBe('init');
      expect(statement.variable).toBe('result');
      expect(statement.value).toEqual({
        type: 'random',
        range: { start: 1, end: 10 }
      });
    });

    it('should parse pick_one expressions', () => {
      const dsl = `
        fable "Test" do
          init color to pick_one ["red", "blue", "green"]
          page 1 do
            text "Start" at [100, 100]
          end
        end
      `;

      const ast = parseDSL(dsl);

      expect(ast.statements[0]).toEqual({
        type: 'init',
        variable: 'color',
        value: {
          type: 'pick_one',
          list: ['red', 'blue', 'green']
        }
      });
    });

    it('should parse arithmetic expressions', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            init result to 5 + 3 * 2
          end
        end
      `;

      const ast = parseDSL(dsl);
      const statement = ast.pages[0].statements[0];

      expect(statement.type).toBe('init');
      expect(statement.variable).toBe('result');
      expect(statement.value).toEqual({
        type: 'binary_op',
        operator: '+',
        left: { type: 'number', value: 5 },
        right: {
          type: 'binary_op',
          operator: '*',
          left: { type: 'number', value: 3 },
          right: { type: 'number', value: 2 }
        }
      });
    });

    it('should parse string concatenation', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            init greeting to "Hello" + " World"
          end
        end
      `;

      const ast = parseDSL(dsl);
      const statement = ast.pages[0].statements[0];

      expect(statement.type).toBe('init');
      expect(statement.variable).toBe('greeting');
      expect(statement.value).toEqual({
        type: 'binary_op',
        operator: '+',
        left: { type: 'string', value: 'Hello' },
        right: { type: 'string', value: 'World' }
      });
    });

    it('should parse comparison operators', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            init is_high_score to score > 100
            init is_equal to count == 5
            init is_different to name != "Player"
          end
        end
      `;

      const ast = parseDSL(dsl);
      const statements = ast.pages[0].statements;

      expect(statements[0].value).toEqual({
        type: 'binary_op',
        operator: '>',
        left: { type: 'variable', name: 'score' },
        right: { type: 'number', value: 100 }
      });

      expect(statements[1].value).toEqual({
        type: 'binary_op',
        operator: '==',
        left: { type: 'variable', name: 'count' },
        right: { type: 'number', value: 5 }
      });

      expect(statements[2].value).toEqual({
        type: 'binary_op',
        operator: '!=',
        left: { type: 'variable', name: 'name' },
        right: { type: 'string', value: 'Player' }
      });
    });

    it('should parse logical operators', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            init can_attack to health > 0 and mana >= 10
            init should_flee to health < 20 or enemy_count > 5
            init is_dead to not is_alive
          end
        end
      `;

      const ast = parseDSL(dsl);
      const statements = ast.pages[0].statements;

      expect(statements[0].value).toEqual({
        type: 'binary_op',
        operator: '&&',
        left: {
          type: 'binary_op',
          operator: '>',
          left: { type: 'variable', name: 'health' },
          right: { type: 'number', value: 0 }
        },
        right: {
          type: 'binary_op',
          operator: '>=',
          left: { type: 'variable', name: 'mana' },
          right: { type: 'number', value: 10 }
        }
      });

      expect(statements[1].value).toEqual({
        type: 'binary_op',
        operator: '||',
        left: {
          type: 'binary_op',
          operator: '<',
          left: { type: 'variable', name: 'health' },
          right: { type: 'number', value: 20 }
        },
        right: {
          type: 'binary_op',
          operator: '>',
          left: { type: 'variable', name: 'enemy_count' },
          right: { type: 'number', value: 5 }
        }
      });

      expect(statements[2].value).toEqual({
        type: 'unary_op',
        operator: '!',
        operand: { type: 'variable', name: 'is_alive' }
      });
    });

    it('should parse modulus operator', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            init remainder to score % 10
          end
        end
      `;

      const ast = parseDSL(dsl);
      const statement = ast.pages[0].statements[0];

      expect(statement.type).toBe('init');
      expect(statement.variable).toBe('remainder');
      expect(statement.value).toEqual({
        type: 'binary_op',
        operator: '%',
        left: { type: 'variable', name: 'score' },
        right: { type: 'number', value: 10 }
      });
    });

    it('should handle operator precedence', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            init result to 2 + 3 * 4 == 14 and true
          end
        end
      `;

      const ast = parseDSL(dsl);
      const statement = ast.pages[0].statements[0];

      expect(statement.value).toEqual({
        type: 'binary_op',
        operator: '&&',
        left: {
          type: 'binary_op',
          operator: '==',
          left: {
            type: 'binary_op',
            operator: '+',
            left: { type: 'number', value: 2 },
            right: {
              type: 'binary_op',
              operator: '*',
              left: { type: 'number', value: 3 },
              right: { type: 'number', value: 4 }
            }
          },
          right: { type: 'number', value: 14 }
        },
        right: { type: 'boolean', value: true }
      });
    });
  });

  describe('String Interpolation', () => {
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
  });

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

       expect(timer).toEqual({
         type: 'timer',
         duration: 10000,
         onTimeout: {
             agents: [
             {
               type: 'text',
               id: 1,
               content: {
                 type: 'interpolated_string',
                 parts: ['Time\'s up!']
               },
               position: [100, 100]
             }
           ],
           actions: [
             { type: 'go_to_page', target: 2 }
           ]
         }
       });
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
  });

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

    it('should parse move and stop_animation actions', () => {
      const dsl = `
        fable "Test" do
          page 1 do
            button "Move" at [100, 100] do
              on_click do
                move agent 2 to [300, 200] duration 1s easing "ease-out"
                stop_animation agent 3
              end
            end
            text "Target" at [50, 50]
            image "animated.png" at [200, 200] animate "spin"
          end
        end
      `;

      const ast = parseDSL(dsl);
      const actions = ast.pages[0].agents[0].events[0].statements;

      expect(actions[0]).toEqual({
        type: 'move',
        agentId: 2,
        to: [300, 200],
        duration: 1000,
        easing: 'ease-out'
      });
      expect(actions[1]).toEqual({
        type: 'stop_animation',
        agentId: 3
      });
    });
  });

  describe('Complex Examples', () => {
    it('should parse a complex interactive story', () => {
      const dsl = `
        fable "Space Adventure" do
          init score to 0
          init player_name to "Astronaut"
          music "space_theme.mp3" loop true

          page 1 auto_advance 3s do
            text "Welcome, {player_name}!" at [100, 50] animate "fade_in"
            image "stars.jpg" at [0, 0]
            image "rocket.png" at [200, 200] animate "bounce"

            button "Launch!" at [200, 300] animate "pulse" do
              on_click do
                play_sound "launch.mp3"
                add 10 to score
                go_to_page 2
              end
            end
          end

          page 2 do
            init enemy_damage to random 5..15

            text "Score: {score}" at [10, 10]
            text "Enemy attacks for {enemy_damage} damage!" at [100, 100]

            timer 10s on_timeout do
              text "Too slow!" at [200, 200]
              go_to_page 3
            end

            button "Dodge" at [100, 300] do
              on_click do
                play_sound "dodge.mp3"
                move agent 5 to [400, 100] duration 500ms
                go_to_page 4
              end
            end

            image "enemy.png" at [300, 200]
            image "player.png" at [100, 200] animate "pulse"
          end
        end
      `;

      const ast = parseDSL(dsl);

      // Should parse without errors
      expect(ast.type).toBe('fable');
      expect(ast.title).toBe('Space Adventure');
      expect(ast.pages).toHaveLength(2);
      expect(ast.statements).toHaveLength(3); // init, init, music
      expect(ast.pages[0].autoAdvance).toBe(3000);
      expect(ast.pages[0].agents).toHaveLength(4); // text, image, image, button
      expect(ast.pages[1].agents).toHaveLength(6); // text, text, timer, button, image, image
    });
  });
});
