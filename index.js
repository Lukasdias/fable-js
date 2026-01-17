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
    {"name": "fable$string$3", "symbols": [{"literal":"e"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fable", "symbols": ["fable$string$1", "_", "dqstring", "_", "fable$string$2", "_", "pages", "_", "fable$string$3"], "postprocess": d => ({ type: 'fable', name: d[2], pages: d[6] })},
    {"name": "pages$ebnf$1", "symbols": []},
    {"name": "pages$ebnf$1$subexpression$1", "symbols": ["_", "page"]},
    {"name": "pages$ebnf$1", "symbols": ["pages$ebnf$1", "pages$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "pages", "symbols": ["page", "pages$ebnf$1"], "postprocess": d => [d[0]].concat(d[1].map(x => x[1]))},
    {"name": "page$string$1", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"g"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "page$string$2", "symbols": [{"literal":"d"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "page$string$3", "symbols": [{"literal":"e"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "page", "symbols": ["page$string$1", "_", "number", "_", "page$string$2", "_", "agents", "_", "page$string$3"], "postprocess": d => ({ type: 'page', id: d[2], agents: d[6] })},
    {"name": "agents$ebnf$1", "symbols": []},
    {"name": "agents$ebnf$1$subexpression$1", "symbols": ["_", "agent"]},
    {"name": "agents$ebnf$1", "symbols": ["agents$ebnf$1", "agents$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "agents", "symbols": ["agent", "agents$ebnf$1"], "postprocess": d => [d[0]].concat(d[1].map(x => x[1]))},
    {"name": "agent", "symbols": ["text_agent"]},
    {"name": "agent", "symbols": ["button_agent"]},
    {"name": "text_agent$string$1", "symbols": [{"literal":"t"}, {"literal":"e"}, {"literal":"x"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "text_agent$string$2", "symbols": [{"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "text_agent", "symbols": ["text_agent$string$1", "_", "dqstring", "_", "text_agent$string$2", "_", "position"], "postprocess": d => ({ type: 'text', content: d[2], position: d[6] })},
    {"name": "button_agent$string$1", "symbols": [{"literal":"b"}, {"literal":"u"}, {"literal":"t"}, {"literal":"t"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent$string$2", "symbols": [{"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent$string$3", "symbols": [{"literal":"d"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent$ebnf$1", "symbols": []},
    {"name": "button_agent$ebnf$1", "symbols": ["button_agent$ebnf$1", "event"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "button_agent$string$4", "symbols": [{"literal":"e"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "button_agent", "symbols": ["button_agent$string$1", "_", "dqstring", "_", "button_agent$string$2", "_", "position", "_", "button_agent$string$3", "_", "button_agent$ebnf$1", "_", "button_agent$string$4"], "postprocess": d => ({ type: 'button', label: d[2], position: d[6], events: d[10] })},
    {"name": "event$string$1", "symbols": [{"literal":"o"}, {"literal":"n"}, {"literal":"_"}, {"literal":"c"}, {"literal":"l"}, {"literal":"i"}, {"literal":"c"}, {"literal":"k"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "event$string$2", "symbols": [{"literal":"d"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "event$string$3", "symbols": [{"literal":"e"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "event", "symbols": ["event$string$1", "_", "event$string$2", "_", "action", "_", "event$string$3"], "postprocess": d => ({ type: 'on_click', action: d[4] })},
    {"name": "action$string$1", "symbols": [{"literal":"g"}, {"literal":"o"}, {"literal":"_"}, {"literal":"t"}, {"literal":"o"}, {"literal":"_"}, {"literal":"p"}, {"literal":"a"}, {"literal":"g"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "action", "symbols": ["action$string$1", "_", "number"], "postprocess": d => ({ type: 'go_to_page', pageId: d[2] })},
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
