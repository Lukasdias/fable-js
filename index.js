// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "main", "symbols": ["_", "fable"], "postprocess": d => d[1]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": d => null},
    {"name": "number$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "number$ebnf$1", "symbols": ["number$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "number", "symbols": ["number$ebnf$1"], "postprocess": d => parseInt(d[0].join(''))},
    {"name": "fable$string$1", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"b"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fable$string$2", "symbols": [{"literal":"d"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fable$ebnf$1", "symbols": []},
    {"name": "fable$ebnf$1", "symbols": ["fable$ebnf$1", "page"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fable$string$3", "symbols": [{"literal":"e"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fable", "symbols": ["fable$string$1", "_", "dqstring", "_", "fable$string$2", "_", "fable$ebnf$1", "_", "fable$string$3"], "postprocess": d => ({ type: 'fable', name: d[2], pages: d[6] })},
    {"name": "page$string$1", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"g"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "page$string$2", "symbols": [{"literal":"d"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "page$ebnf$1", "symbols": []},
    {"name": "page$ebnf$1", "symbols": ["page$ebnf$1", "agent"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "page$string$3", "symbols": [{"literal":"e"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "page", "symbols": ["page$string$1", "_", "number", "_", "page$string$2", "_", "page$ebnf$1", "_", "page$string$3"], "postprocess": d => ({ type: 'page', id: d[2], agents: d[6] })},
    {"name": "agent", "symbols": ["text_agent"]},
    {"name": "agent", "symbols": ["button_agent"]},
    {"name": "text_agent$string$1", "symbols": [{"literal":"t"}, {"literal":"e"}, {"literal":"x"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "text_agent$string$2", "symbols": [{"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "text_agent", "symbols": ["text_agent$string$1", "_", "dqstring", "_", "text_agent$string$2", "_", "position"], "postprocess": d => ({ type: 'text', content: d[2], position: d[6] })},
    {"name": "button_agent$string$1", "symbols": [{"literal":"b"}, {"literal":"u"}, {"literal":"t"}, {"literal":"t"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent$string$2", "symbols": [{"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent$string$3", "symbols": [{"literal":"d"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent$string$4", "symbols": [{"literal":"e"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent", "symbols": ["button_agent$string$1", "_", "dqstring", "_", "button_agent$string$2", "_", "position", "_", "button_agent$string$3", "_", "button_agent$string$4"], "postprocess": d => ({ type: 'button', label: d[2], position: d[6] })},
    {"name": "position", "symbols": [{"literal":"["}, "_", "number", "_", {"literal":","}, "_", "number", "_", {"literal":"]"}], "postprocess": d => [d[2], d[6]]},
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", /[^\"]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": d => d[1].join('')}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
