const { parseDSL } = require('./parser');

// Test DSL code
const dslCode = `
fable "Test Fable" do
  page 1 do
    text "Hello World" at [100, 100]
  end
end
`;

const ast = parseDSL(dslCode);
console.log(JSON.stringify(ast, null, 2));