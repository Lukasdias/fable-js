export const PAGE1_DSL = `page 1 do
  // Animated title with pulse effect
  text #title "Welcome to FableJS!" at [180, 30] animate "pulse" duration 2s

  // Score display with bounce animation
  text #score "Score: {score}" at [50, 100] animate "bounce" duration 1s

  // Health display
  text #health "Health: {health}" at [400, 100] animate "pulse" duration 1s

  // Collect points button
  button #collect-btn "Collect Points (+10)" at [50, 180] do
    on_click do
      set score to score + 10
      // Move the score text when clicked
      move #score to [50 + score, 120] duration 300ms easing "ease-out"
      // Tween the button for visual feedback
      tween #collect-btn duration 500ms scaleX 1.5 scaleY 1.5 opacity 0.7 easing "bounce-ease-out"
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
end`;