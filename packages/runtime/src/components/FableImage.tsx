import React from 'react';
import { Image } from 'react-konva';
import Konva from 'konva';
import type { ImageAgent, Agent } from '@fable-js/parser';

export interface FableImageProps {
  agent: ImageAgent;
  onEvent: (event: string, agent: Agent) => void;
}

/**
 * Image agent component using Konva Image for canvas rendering
 */
export function FableImage({ agent, onEvent }: FableImageProps) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  // Load image when src changes
  React.useEffect(() => {
    if (!agent.src) return;

    const img = new window.Image();
    img.src = agent.src;
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      console.warn('Failed to load image:', agent.src);
    };
  }, [agent.src]);

  const handleClick = React.useCallback(() => {
    onEvent('on_click', agent);
  }, [onEvent, agent]);

  const handleMouseEnter = React.useCallback(() => {
    onEvent('on_hover', agent);
  }, [onEvent, agent]);

  return (
    <Image
      x={agent.position?.[0] || 0}
      y={agent.position?.[1] || 0}
      image={image || undefined}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      draggable={true}
      onDragStart={() => onEvent('on_drag', agent)}
      onDragEnd={() => onEvent('on_drop', agent)}
    />
  );
}