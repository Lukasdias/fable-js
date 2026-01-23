export const DEFAULT_DSL = `fable "Interactive Animation Demo" do
  init score to 0
  init health to 100
  init bouncing to true

  page 1 do
    // Animated title with pulse effect
    text #title "Welcome to FableJS!" at [180, 30] animate "pulse" duration 2s

    // Score display with bounce animation
    text #score "Score: {score}" at [50, 100] animate "bounce" duration 1s
    
    // Health display
    text #health "Health: {health}" at [400, 100] animate "pulse" duration 1s

    // Collect points button
    button #collect-btn "Collect Points (+10)" at [50, 180] animate "pulse" duration 2s do
      on_click do
        set score to score + 10
        // Move the score text when clicked
        move #score to [50 + score, 120] duration 300ms easing "ease-out"
      end
    end

     // Take damage button
     button #damage-btn "Take Damage (-15)" at [250, 180] animate "shake" duration 500ms repeat 3 do
       on_click do
         set health to health - 15
       end
     end

     // Heal button
     button #heal-btn "Heal (+25)" at [450, 180] do
       on_click do
         set health to health + 25
       end
     end

     // Conditional bonus display
     if score > 50 do
       text #bonus "BONUS UNLOCKED!" at [200, 300] animate "pulse" duration 1s
     end

    // Animated decorative elements
    text #deco-1 "~~~" at [100, 280] animate "spin" duration 3s
    text #deco-2 "***" at [300, 280] animate "bounce" duration 800ms
    text #deco-3 "+++" at [500, 280] animate "pulse" duration 1500ms

    // Navigation with animation
    button #next-btn "Next Page" at [250, 320] animate "fade_in" duration 1s do
      on_click do
        go_to_page 2
      end
    end
  end

  page 2 do
    init roll to random 1..6

    // Title
    text #page2-title "Animation Playground" at [200, 30] animate "pulse" duration 2s

    // Dice with shake animation
    text #dice "Dice: {roll}" at [280, 100] animate "shake" duration 200ms repeat 2

    // Roll button
    button #roll-btn "Roll & Move!" at [50, 160] do
      on_click do
        set roll to random 1..6
        // Animate the dice text
        move #dice to [280, 130] duration 500ms easing "bounce-ease-out"
      end
    end

    // Spin button
    button #spin-btn "Spin Effect" at [250, 160] animate "spin" duration 2s do
      on_click do
        // Move itself
        move #spin-btn to [300, 180] duration 400ms easing "elastic-ease-out"
      end
    end

    // Reset button
    button #reset-btn "Reset Positions" at [450, 160] do
      on_click do
        move #dice to [280, 100] duration 300ms easing "ease-in-out"
        move #spin-btn to [250, 160] duration 300ms easing "ease-in-out"
      end
    end

    // Floating animated elements
    text #float-1 "~o~" at [100, 260] animate "bounce" duration 600ms
    text #float-2 "~o~" at [300, 260] animate "bounce" duration 800ms
    text #float-3 "~o~" at [500, 260] animate "bounce" duration 1000ms

    // Back button
    button #back-btn "Back to Page 1" at [250, 320] animate "fade_in" duration 500ms do
      on_click do
        go_to_page 1
      end
    end

    button #to-end-btn "Go to The End" at [400, 320] animate "fade_in" duration 500ms do
      on_click do
        go_to_page 3
      end
    end
  end

  page 3 do
    text #end-text "The End! Thanks for trying FableJS!" at [150, 200] animate "pulse" duration 2s
    button #restart-btn "Restart Demo" at [250, 300] do
      on_click do
        go_to_page 1
        set score to 0
        set health to 100
      end   
    end
  end
end`
