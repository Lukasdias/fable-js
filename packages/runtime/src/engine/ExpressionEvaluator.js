/**
 * Expression evaluator for FableJS runtime
 * Evaluates arithmetic, comparison, and logical expressions
 */

export class ExpressionEvaluator {
  constructor(state) {
    this.state = state;
  }

  evaluate(expr) {
    if (!expr || !expr.type) return null;

    switch (expr.type) {
      case 'number':
        return expr.value;

      case 'string':
        return expr.value;

      case 'boolean':
        return expr.value;

      case 'variable':
        return this.state.getVariable(expr.name) ?? 0;

      case 'binary_op':
        return this.evaluateBinaryOp(expr);

      case 'unary_op':
        return this.evaluateUnaryOp(expr);

      case 'range':
        return this.evaluateRange(expr);

      case 'array':
        return expr.elements.map(el => this.evaluate(el));

      case 'random':
        return this.evaluateRandom(expr);

      case 'pick_one':
        return this.evaluatePickOne(expr);

      case 'interpolated_string':
        return this.evaluateInterpolatedString(expr);

      default:
        console.warn('Unknown expression type:', expr.type);
        return null;
    }
  }

  evaluateBinaryOp(expr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator) {
      // Arithmetic
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '%':
        return left % right;

      // Comparison
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;

      // Logical
      case '&&':
        return left && right;
      case '||':
        return left || right;

      default:
        console.warn('Unknown binary operator:', expr.operator);
        return null;
    }
  }

  evaluateUnaryOp(expr) {
    const operand = this.evaluate(expr.operand);

    switch (expr.operator) {
      case '!':
        return !operand;

      case '-':
        return -operand;

      default:
        console.warn('Unknown unary operator:', expr.operator);
        return null;
    }
  }

  evaluateRange(expr) {
    const start = this.evaluate(expr.start);
    const end = this.evaluate(expr.end);
    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  evaluateRandom(expr) {
    if (expr.range) {
      const range = this.evaluate(expr.range);
      const min = Math.min(...range);
      const max = Math.max(...range);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return Math.random();
  }

  evaluatePickOne(expr) {
    const array = this.evaluate(expr.array);
    if (Array.isArray(array) && array.length > 0) {
      return array[Math.floor(Math.random() * array.length)];
    }
    return null;
  }

  evaluateInterpolatedString(expr) {
    return expr.parts.map(part => {
      if (typeof part === 'string') {
        return part;
      } else if (part.type === 'variable') {
        return this.evaluate(part) ?? '';
      }
      return '';
    }).join('');
  }
}