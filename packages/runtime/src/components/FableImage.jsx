import React from 'react';

/**
 * Image agent component
 */
export function FableImage({ agent, evaluator, onEvent }) {
  const src = agent.src || '';

  const style = {
    position: 'absolute',
    left: agent.position?.[0] || 0,
    top: agent.position?.[1] || 0,
    maxWidth: '100%',
    maxHeight: '100%',
    pointerEvents: 'auto',
    ...agent.style
  };

  const handleDragStart = (e) => {
    onEvent('on_drag', agent);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onEvent('on_drop', agent);
  };

  return (
    <img
      src={src}
      alt={agent.alt || ''}
      style={style}
      draggable={true}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    />
  );
}