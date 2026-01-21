import React from 'react';

/**
 * Text agent component
 */
export function FableText({ agent, evaluator }) {
  const content = agent.content?.type === 'interpolated_string'
    ? evaluator.evaluate(agent.content)
    : agent.content || '';

  const style = {
    position: 'absolute',
    left: agent.position?.[0] || 0,
    top: agent.position?.[1] || 0,
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    color: '#000',
    whiteSpace: 'pre-wrap',
    pointerEvents: 'none',
    ...agent.style
  };

  return (
    <div style={style}>
      {content}
    </div>
  );
}