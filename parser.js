// FableJS DSL Parser
const nearley = require('nearley');
const grammar = require('./index');

function parseDSL(dslCode) {
  dslCode = dslCode.trim(); // Remove leading/trailing whitespace
  const parser = new nearley.Parser(grammar);
  parser.feed(dslCode);
  return parser.results[0]; // Return the first parse result
}

module.exports = { parseDSL };