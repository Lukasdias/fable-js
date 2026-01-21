import React from 'react';
import type { TextAgent, InterpolatedString } from '@fable-js/parser';
import type { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';

export interface FableTextProps {
  agent: TextAgent;
  evaluator: ExpressionEvaluator;
}

/**
 * Text agent component with React 19 optimizations
 */
export function FableText({ agent, evaluator }: FableTextProps) {
  // Memoize content evaluation to prevent unnecessary re-computation
  const content = React.useMemo(() => {
    if (agent.content && typeof agent.content === 'object' && 'type' in agent.content) {
      const interpolated = agent.content as InterpolatedString;
      if (interpolated.type === 'interpolated_string') {
        return evaluator.evaluate(interpolated);
      }
    }
    return agent.content || '';
  }, [agent.content, evaluator]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: agent.position?.[0] || 0,
    top: agent.position?.[1] || 0,
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    color: '#000',
    whiteSpace: 'pre-wrap',
    pointerEvents: 'none'
  };

  return (
    <div style={style}>
      {content}
    </div>
  );
}