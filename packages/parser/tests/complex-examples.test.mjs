import { describe, it, expect } from 'vitest';
import { parseDSL } from '../src/index.js';

describe('Complex Examples', () => {
  it('should parse a complex interactive story', () => {
    const dsl = `
      fable "Space Adventure" do
        init score to 0
        init player_name to "Astronaut"
        music "space_theme.mp3" loop true

        page 1 auto_advance 3s do
          text #welcome "Welcome, {player_name}!" at [100, 50] animate "fade_in"
          image #stars "stars.jpg" at [0, 0]
          image #rocket "rocket.png" at [200, 200] animate "bounce"

          button #launch "Launch!" at [200, 300] animate "pulse" do
            on_click do
              play_sound "launch.mp3"
              add 10 to score
              go_to_page 2
            end
          end
        end

        page 2 do
          init enemy_damage to random 5..15

          text #score-display "Score: {score}" at [10, 10]
          text #damage-text "Enemy attacks for {enemy_damage} damage!" at [100, 100]

          timer 10s on_timeout do
            text "Too slow!" at [200, 200]
            go_to_page 3
          end

          button #dodge "Dodge" at [100, 300] do
            on_click do
              play_sound "dodge.mp3"
              move #player to [400, 100] duration 500ms
              go_to_page 4
            end
          end

          image #enemy "enemy.png" at [300, 200]
          image #player "player.png" at [100, 200] animate "pulse"
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

    // Check named IDs
    expect(ast.pages[0].agents[0].id).toBe('welcome');
    expect(ast.pages[0].agents[1].id).toBe('stars');
    expect(ast.pages[0].agents[2].id).toBe('rocket');
    expect(ast.pages[0].agents[3].id).toBe('launch');
  });

  it('should parse a quiz game structure', () => {
    const dsl = `
      fable "Quiz Game" do
        init score to 0
        init current_question to 1

        page 1 do
          text #title "Welcome to the Quiz!" at [100, 50]
          text #instructions "Answer correctly to earn points" at [100, 100]
          
          button #start "Start Quiz" at [100, 200] do
            on_click do
              go_to_page 2
            end
          end
        end

        page 2 do
          text #q1 "What is 2 + 2?" at [100, 50]
          
          button #answer-correct "4" at [100, 150] do
            on_click do
              add 10 to score
              play_sound "correct.mp3"
              go_to_page 3
            end
          end
          
          button #answer-wrong "5" at [200, 150] do
            on_click do
              play_sound "wrong.mp3"
              go_to_page 3
            end
          end
        end

        page 3 do
          text #result "Your score: {score}" at [100, 100]
          
          button #restart "Play Again" at [100, 200] do
            on_click do
              set score to 0
              go_to_page 1
            end
          end
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.title).toBe('Quiz Game');
    expect(ast.pages).toHaveLength(3);
    expect(ast.statements[0].variable).toBe('score');
    
    // Check button actions
    const correctButton = ast.pages[1].agents[1];
    expect(correctButton.id).toBe('answer-correct');
    expect(correctButton.events[0].statements).toHaveLength(3);
    expect(correctButton.events[0].statements[0].type).toBe('add');
  });

  it('should parse a drag and drop game', () => {
    const dsl = `
      fable "Drag and Drop" do
        init matches to 0

        page 1 do
          text #instructions "Drag items to the correct zones" at [100, 50]
          
          button #item1 "Apple" at [50, 150] do
            on_drag do
              play_sound "pickup.mp3"
            end
          end
          
          button #item2 "Carrot" at [150, 150] do
            on_drag do
              play_sound "pickup.mp3"
            end
          end
          
          button #fruit-zone "Fruits" at [50, 300] do
            on_drop do
              add 1 to matches
              play_sound "correct.mp3"
            end
          end
          
          button #veggie-zone "Vegetables" at [150, 300] do
            on_drop do
              add 1 to matches
              play_sound "correct.mp3"
            end
          end
        end
      end
    `;

    const ast = parseDSL(dsl);

    expect(ast.title).toBe('Drag and Drop');
    
    const item1 = ast.pages[0].agents[1];
    expect(item1.id).toBe('item1');
    expect(item1.events[0].type).toBe('on_drag');
    
    const fruitZone = ast.pages[0].agents[3];
    expect(fruitZone.id).toBe('fruit-zone');
    expect(fruitZone.events[0].type).toBe('on_drop');
  });
});
