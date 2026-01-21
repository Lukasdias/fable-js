import React from 'react';
import type { ButtonAgent, InterpolatedString, Agent } from '@fable-js/parser';
import type { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';

export interface FableButtonProps {
  agent: ButtonAgent;
  evaluator: ExpressionEvaluator;
  onEvent: (event: string, agent: Agent) => void;
}

/**
 * Button agent component with React 19 optimizations
 */
export function FableButton({ agent, evaluator, onEvent }: FableButtonProps) {
  // Memoize label evaluation
  const label = React.useMemo(() => {
    if (agent.label && typeof agent.label === 'object' && 'type' in agent.label) {
      const interpolated = agent.label as InterpolatedString;
      if (interpolated.type === 'interpolated_string') {
        return evaluator.evaluate(interpolated);
      }
    }
    return agent.label || 'Button';
  }, [agent.label, evaluator]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: agent.position?.[0] || 0,
    top: agent.position?.[1] || 0,
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  };

  // Memoize event handlers to prevent unnecessary re-creation
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onEvent('on_click', agent);
  }, [onEvent, agent]);

  const handleHover = React.useCallback(() => {
    onEvent('on_hover', agent);
  }, [onEvent, agent]);

  return (
    <button
      style={style}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {label}
    </button>
  );
}