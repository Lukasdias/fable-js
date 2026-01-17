const { parseDSL } = require('../src/parser');

// Test DSL code
const dslCode = `
fable "Test Fable" do
  page 1 do
    text "Hello World" at [100, 100]
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

const ast = parseDSL(dslCode);
console.log(JSON.stringify(ast, null, 2));