main -> _ fable {% d => d[1] %}

# Whitespace handling
_ -> [\s]:* {% d => null %}

# Tokens
number -> [0-9]:+ {% d => parseInt(d[0].join('')) %}

fable -> "fable" _ dqstring _ "do" _ page:* _ "end" {% d => ({ type: 'fable', name: d[2], pages: d[6] }) %}
page -> "page" _ number _ "do" _ agent:* _ "end" {% d => ({ type: 'page', id: d[2], agents: d[6] }) %}
agent -> text_agent | button_agent
text_agent -> "text" _ dqstring _ "at" _ position {% d => ({ type: 'text', content: d[2], position: d[6] }) %}
button_agent -> "button" _ dqstring _ "at" _ position _ "do" _ "end" {% d => ({ type: 'button', label: d[2], position: d[6] }) %}
position -> "[" _ number _ "," _ number _ "]" {% d => [d[2], d[6]] %}

# Double-quoted string
dqstring -> "\"" [^\"]:* "\"" {% d => d[1].join('') %}
