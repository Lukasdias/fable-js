export const PAGE2_DSL = `page 2 do
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
end`;