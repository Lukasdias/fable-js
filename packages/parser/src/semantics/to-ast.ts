/**
 * Semantic actions for transforming Ohm CST to FableJS AST
 */

// @ts-nocheck - Complex Ohm semantic actions with dynamic typing, build works correctly
import type { Grammar, Semantics } from 'ohm-js';

/**
 * Generate a simple unique ID for agents without explicit #id
 * Uses crypto.randomUUID if available, falls back to a simple implementation
 */
function generateAgentId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Creates semantics for the FableDSL grammar
 * @param grammar - The Ohm grammar object
 * @returns Semantics object with toAST operation
 */
export function createSemantics(grammar: Grammar): Semantics {
  return grammar.createSemantics().addOperation('toAST', {
    Fable(_fable, title, _do, contents, _end) {
      // Separate pages from statements
      const pages = [];
      const statements = [];

      contents.children.forEach(child => {
        const ast = child.toAST();
        if (ast.type === 'page') {
          pages.push(ast);
        } else {
          statements.push(ast);
        }
      });

      return {
        type: 'fable',
        title: title.toAST().value, // Extract string from typed value
        pages: pages,
        statements: statements
      };
    },

    Page(_page, id, option, _do, contents, _end) {
      // Separate agents from statements
      const agents = [];
      const statements = [];
      let autoAdvance = undefined;

      // Handle optional auto_advance
      if (option.children.length > 0) {
        autoAdvance = option.children[0].toAST();
      }

      contents.children.forEach(child => {
        const ast = child.toAST();
        if (ast.type === 'text' || ast.type === 'button' || ast.type === 'image' ||
            ast.type === 'video' || ast.type === 'if' || ast.type === 'for' ||
            ast.type === 'wait' || ast.type === 'timer') {
          agents.push(ast);
        } else {
          statements.push(ast);
        }
      });

      const result = {
        type: 'page',
        id: id.toAST().value, // Extract number from typed value
        agents: agents,
        statements: statements
      };

      if (autoAdvance !== undefined) {
        result.autoAdvance = autoAdvance;
      }

      return result;
    },

    PageOption(_autoAdvance, duration) {
      return duration.toAST(); // duration is already a number from Duration semantic action
    },

    // Statements
    InitStatement(_init, variable, _to, expression) {
      return {
        type: 'init',
        variable: variable.sourceString,
        value: expression.toAST()
      };
    },

    SetStatement(_set, variable, _to, expression) {
      return {
        type: 'set',
        variable: variable.sourceString,
        value: expression.toAST()
      };
    },

    AddStatement(_add, amount, _to, variable) {
      return {
        type: 'add',
        amount: amount.toAST(), // Keep as typed expression
        variable: variable.sourceString
      };
    },

    SubtractStatement(_subtract, amount, _from, variable) {
      return {
        type: 'subtract',
        amount: amount.toAST(), // Keep as typed expression
        variable: variable.sourceString
      };
    },

    // Agent alternatives - Ohm handles this automatically
    Agent(agent) {
      return agent.toAST();
    },

    AgentName(_hash, name) {
      return name.sourceString;
    },

    agentIdentifier(chars) {
      return chars.sourceString;
    },
    
    TextAgent(_text, agentName, content, _at, position, animate) {
      // If #id is provided, use it; otherwise generate UUID
      const id = agentName.children.length > 0 
        ? agentName.children[0].toAST() 
        : generateAgentId();

      const result = {
        type: 'text',
        id,
        content: content.toAST(),
        position: position.toAST()
      };

      if (animate.children.length > 0) {
        result.animate = animate.children[0].toAST();
      }

      return result;
    },
    
     ButtonAgent(_button, agentName, label, _at, position, animate, _do, events, _end) {
       // If #id is provided, use it; otherwise generate UUID
       const id = agentName.children.length > 0 
         ? agentName.children[0].toAST() 
         : generateAgentId();

       const result = {
         type: 'button',
         id,
         label: label.toAST().value, // Extract string from typed value
         position: position.toAST()
       };

       if (animate && animate.children && animate.children.length > 0) {
         result.animate = animate.children[0].toAST();
       }

       result.events = events.children.map(e => e.toAST());

       return result;
     },
    
    ImageAgent(_image, agentName, src, _at, position, animate) {
      // If #id is provided, use it; otherwise generate UUID
      const id = agentName.children.length > 0 
        ? agentName.children[0].toAST() 
        : generateAgentId();

      const result = {
        type: 'image',
        id,
        src: src.toAST().value, // Extract string from typed value
        position: position.toAST()
      };

      if (animate.children.length > 0) {
        result.animate = animate.children[0].toAST();
      }

      return result;
    },
    
    VideoAgent(_video, agentName, src, _at, position) {
      // If #id is provided, use it; otherwise generate UUID
      const id = agentName.children.length > 0 
        ? agentName.children[0].toAST() 
        : generateAgentId();

      const result = {
        type: 'video',
        id,
        src: src.toAST().value, // Extract string from typed value
        position: position.toAST()
      };

      return result;
    },
    
    Event(eventType, _do, actions, _end) {
      return {
        type: eventType.toAST(),
        statements: actions.children.map(a => a.toAST())
      };
    },
    
    EventType(type) {
      return type.sourceString;
    },
    
    Action(action) {
      return action.toAST();
    },

    GoToPageAction(_goTo, pageNum) {
      return {
        type: 'go_to_page',
        target: pageNum.toAST().value // Extract number from typed value
      };
    },

    PlaySoundWithVolume(_playSound, src, _volume, volume) {
      return {
        type: 'play_sound',
        src: src.toAST().value, // Extract string from typed value
        volume: volume.toAST().value // Extract number from typed value
      };
    },

    PlaySoundWithoutVolume(_playSound, src) {
      return {
        type: 'play_sound',
        src: src.toAST().value // Extract string from typed value
      };
    },

    StopMusicAction(_stopMusic) {
      return {
        type: 'stop_music'
      };
    },

    StopSoundAction(_stopSound, src) {
      return {
        type: 'stop_sound',
        src: src.toAST().value // Extract string from typed value
      };
    },

    MoveAction(_move, agentRef, _to, position, _duration, duration, easing) {
      return {
        type: 'move',
        agentId: agentRef.toAST(),
        to: position.toAST(),
        duration: duration.toAST().value,
        easing: easing.toAST()[0]?.value
      };
    },

    TweenAction(_tween, agentRef, _duration, duration, props, easing) {
      const properties: Record<string, number | string> = {};
      props.children.forEach((prop: any) => {
        const [key, value] = prop.toAST();
        properties[key] = value;
      });
      return {
        type: 'tween',
        agentId: agentRef.toAST(),
        properties,
        duration: duration.toAST().value,
        easing: easing.toAST()[0]?.value
      };
    },

    StopAnimationAction(_stopAnimation, agentRef) {
      return {
        type: 'stop_animation',
        agentId: agentRef.toAST() // AgentRef returns string ID
      };
    },



    // Audio
    MusicStatement(_music, src, options) {
      const result = {
        type: 'music',
        src: src.toAST().value // Extract string from typed value
      };

      if (options) {
        const opts = options.toAST();
        const flatOpts = opts.flat();
        flatOpts.forEach(option => {
          if (option.loop !== undefined) result.loop = option.loop;
          if (option.volume !== undefined) result.volume = option.volume;
        });
      }

      return result;
    },

    MusicOptions(options) {
      return options.children.map(option => option.toAST());
    },

    MusicOption(_keyword, value) {
      const keyword = _keyword.sourceString;
      if (keyword === 'loop') {
        return { loop: value.toAST().value }; // Extract boolean from typed value
      } else if (keyword === 'volume') {
        return { volume: value.toAST().value }; // Extract number from typed value
      }
      throw new Error(`Unknown music option: ${keyword}`);
    },

    // Timing
    WaitBlock(_waitOrAfter, duration, _do, actions, _end) {
      return {
        type: 'wait',
        duration: duration.toAST(),
        actions: actions.children.map(a => a.toAST())
      };
    },

    TimerBlock(_timer, duration, _onTimeout, _do, contents, _end) {
      // Separate agents from actions
      const agents = [];
      const actions = [];

      contents.children.forEach(child => {
        const ast = child.toAST();
        if (ast.type === 'text' || ast.type === 'button' || ast.type === 'image' ||
            ast.type === 'video' || ast.type === 'if' || ast.type === 'for' ||
            ast.type === 'wait' || ast.type === 'timer') {
          agents.push(ast);
        } else {
          actions.push(ast);
        }
      });

      return {
        type: 'timer',
        duration: duration.toAST(),
        onTimeout: {
          agents: agents,
          actions: actions
        }
      };
    },

    Duration(value, unit) {
      const numValue = value.toAST().value; // Extract number from typed value
      const unitStr = unit.toAST();
      return unitStr === 'ms' ? numValue : numValue * 1000; // Convert to milliseconds
    },

    TimeUnit(unit) {
      return unit.sourceString;
    },

    // Animation
    AnimateOption(_animate, name, params) {
      const result = {
        animation: name.toAST().value // Extract string from typed value
      };

      if (params.children && params.children.length > 0) {
        params.children.forEach(param => {
          const p = param.toAST();
          if (p.duration !== undefined) result.duration = p.duration;
          if (p.repeat !== undefined) result.repeat = p.repeat.value; // Extract number from typed value
        });
      }

      return result;
    },

    AnimateParams(params) {
      return params.children.map(param => param.toAST());
    },

    AnimateParam(_keyword, value) {
      const keyword = _keyword.sourceString;
      if (keyword === 'duration') {
        return { duration: value.toAST() };
      } else if (keyword === 'repeat') {
        return { repeat: value.toAST() };
      }
      throw new Error(`Unknown animate param: ${keyword}`);
    },

    // AgentRef - returns the agent ID string directly
    AgentRef(_hash, id) {
      return id.sourceString;
    },

    EasingOption(_easing, value) {
      return value.toAST().value; // Extract string from typed value
    },

    TweenProp(key, value) {
      return [key.sourceString, value.toAST().value];
    },

    // Expressions
    LogicalExpr_or(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '||',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    AndExpr_and(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '&&',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    CompExpr_equal(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '==',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    CompExpr_not_equal(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '!=',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    CompExpr_less(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '<',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    CompExpr_greater(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '>',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    CompExpr_less_equal(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '<=',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    CompExpr_greater_equal(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '>=',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    AddExpr_plus(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '+',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    AddExpr_minus(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '-',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    MulExpr_times(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '*',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    MulExpr_div(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '/',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    MulExpr_mod(left, _op, right) {
      return {
        type: 'binary_op',
        operator: '%',
        left: left.toAST(),
        right: right.toAST()
      };
    },

    UnaryExpr_not(_op, expr) {
      return {
        type: 'unary_op',
        operator: '!',
        operand: expr.toAST()
      };
    },

    UnaryExpr_neg(_op, expr) {
      return {
        type: 'unary_op',
        operator: '-',
        operand: expr.toAST()
      };
    },

    PrimaryExpr_paren(_lparen, expr, _rparen) {
      return expr.toAST();
    },

    RandomExpr(_random, range) {
      return {
        type: 'random',
        range: range.toAST()
      };
    },

    PickOneExpr(_pickOne, list) {
      return {
        type: 'pick_one',
        list: list.toAST().map(item => item.value)
      };
    },

    List(_lb, items, _rb) {
      return items.toAST();
    },

    ListItems_single(item) {
      return [item.toAST()];
    },

    ListItems_multiple(list, _comma, item) {
      return list.toAST().concat([item.toAST()]);
    },

    // Interpolated strings
    InterpolatedString(_open, inner, _close) {
      const innerText = inner.toAST();
      const parts = [];
      let currentText = '';
      let i = 0;

      while (i < innerText.length) {
        if (innerText[i] === '{') {
          // Flush any accumulated text
          if (currentText) {
            parts.push(currentText);
            currentText = '';
          }

          // Find the closing }
          const closeIndex = innerText.indexOf('}', i);
          if (closeIndex === -1) {
            // Invalid, treat as text
            currentText += innerText[i];
            i++;
            continue;
          }

          const varName = innerText.substring(i + 1, closeIndex);
          parts.push({
            type: 'variable',
            name: varName
          });
          i = closeIndex + 1;
        } else {
          currentText += innerText[i];
          i++;
        }
      }

      // Flush final text
      if (currentText) {
        parts.push(currentText);
      }

      return {
        type: 'interpolated_string',
        parts: parts
      };
    },

    innerString(chars) {
      return chars.sourceString;
    },

    BooleanLiteral(value) {
      return {
        type: 'boolean',
        value: value.sourceString === 'true'
      };
    },
    
    IfBlock(_if, condition, _do, agents, _end) {
      return {
        type: 'if',
        condition: condition.toAST(),
        agents: agents.children.map(a => a.toAST())
      };
    },
    
    ForBlock(_for, variable, _in, range, _do, agents, _end) {
      return {
        type: 'for',
        variable: variable.sourceString,
        range: range.toAST(),
        agents: agents.children.map(a => a.toAST())
      };
    },
    
    Position(_lb, x, _comma, y, _rb) {
      return [x.toAST(), y.toAST()]; // Return expressions for runtime evaluation
    },
    
    Range(start, _dots, end) {
      return {
        start: start.toAST().value,
        end: end.toAST().value
      };
    },
    
    StringLiteral(_open, chars, _close) {
      return {
        type: 'string',
        value: chars.sourceString
      };
    },
    
    NumberLiteral(intPart, dot, fracPart) {
      const fullNumber = intPart.sourceString + (dot.children.length > 0 ? dot.sourceString : '') + (fracPart.children.length > 0 ? fracPart.sourceString : '');
      return {
        type: 'number',
        value: parseFloat(fullNumber)
      };
    },
    
    identifier(first, rest) {
      return {
        type: 'variable',
        name: first.sourceString + rest.sourceString
      };
    },
    
    // Handle iteration nodes (for * and + operators)
    _iter(...children) {
      return children.map(c => c.toAST());
    },
    
    // Default for terminals
    _terminal() {
      return this.sourceString;
    }
  });
}
