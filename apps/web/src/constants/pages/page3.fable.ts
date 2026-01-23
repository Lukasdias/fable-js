export const PAGE3_DSL = `page 3 do
  text #end-text "The End! Thanks for trying FableJS!" at [150, 200] animate "pulse" duration 2s
  button #restart-btn "Restart Demo" at [250, 300] do
    on_click do
      go_to_page 1
      set score to 0
      set health to 100
    end
  end
end`;