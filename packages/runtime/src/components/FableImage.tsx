import React from 'react';
import type { ImageAgent, Agent } from '@fable-js/parser';

export interface FableImageProps {
  agent: ImageAgent;
  onEvent: (event: string, agent: Agent) => void;
}

/**
 * Image agent component with React 19 optimizations
 */
export function FableImage({ agent, onEvent }: FableImageProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: agent.position?.[0] || 0,
    top: agent.position?.[1] || 0,
    maxWidth: '100%',
    maxHeight: '100%',
    pointerEvents: 'auto'
  };

  // Memoize event handlers
  const handleDragStart = React.useCallback((e: React.DragEvent<HTMLImageElement>) => {
    onEvent('on_drag', agent);
  }, [onEvent, agent]);

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault();
    onEvent('on_drop', agent);
  }, [onEvent, agent]);

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault();
  }, []);

  return (
    <img
      src={agent.src}
      alt=""
      style={style}
      draggable={true}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    />
  );
}