export const MAIN_DSL = `fable "Interactive Animation Demo" do
  init score to 0
  init health to 100
  init bouncing to true

  require "pages/page1.fable"
  require "pages/page2.fable"
  require "pages/page3.fable"
end`;