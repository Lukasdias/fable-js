import React from 'react';

/**
 * Button agent component
 */
export function FableButton({ agent, evaluator, onEvent }) {
  const label = agent.label?.type === 'interpolated_string'
    ? evaluator.evaluate(agent.label)
    : agent.label || 'Button';

  const style = {
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
    fontFamily: 'Arial, sans-serif',
    ...agent.style
  };

  const handleClick = () => {
    onEvent('on_click', agent);
  };

  return (
    <button
      style={style}
      onClick={handleClick}
      onMouseEnter={() => onEvent('on_hover', agent)}
    >
      {label}
    </button>
  );
}