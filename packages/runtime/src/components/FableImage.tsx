import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Image } from 'react-konva';
import Konva from 'konva';
import type { ImageAgent, Agent, Event } from '@fable-js/parser';
import { useFableContext } from '../context/FableContext.js';

export interface FableImageProps {
  agent: ImageAgent;
  onEvent: (event: string, agent: Agent) => void;
}

/**
 * Image agent component using Konva Image for canvas rendering
 */
export function FableImage({ agent, onEvent }: FableImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<Konva.Image>(null);
  const { registerAgent } = useFableContext();

  // Register this agent's ref for tweening/animations
  useEffect(() => {
    if (agent.id !== undefined) {
      registerAgent(agent.id, imageRef.current);
    }
    return () => {
      if (agent.id !== undefined) {
        registerAgent(agent.id, null);
      }
    };
  }, [agent.id, registerAgent]);

  // Check if this image is draggable (has on_drag or on_drop events)
  const isDraggable = useMemo(() => {
    return agent.events?.some((e: Event) => e.type === 'on_drag' || e.type === 'on_drop') ?? false;
  }, [agent.events]);

  // Load image when src changes
  useEffect(() => {
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

  const handleClick = useCallback(() => {
    if (!isDragging) {
      onEvent('on_click', agent);
    }
  }, [onEvent, agent, isDragging]);

  const handleMouseEnter = useCallback(() => {
    onEvent('on_hover', agent);
  }, [onEvent, agent]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onEvent('on_drag', agent);
  }, [onEvent, agent]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    onEvent('on_drop', agent);
  }, [onEvent, agent]);

  return (
    <Image
      ref={imageRef}
      x={agent.position?.[0] || 0}
      y={agent.position?.[1] || 0}
      image={image || undefined}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={handleMouseEnter}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      shadowColor={isDragging ? 'black' : undefined}
      shadowBlur={isDragging ? 10 : 0}
      shadowOffset={isDragging ? { x: 5, y: 5 } : { x: 0, y: 0 }}
      shadowOpacity={isDragging ? 0.3 : 0}
    />
  );
}