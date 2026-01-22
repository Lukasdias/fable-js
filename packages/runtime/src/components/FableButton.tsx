import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Rect, Text, Group } from 'react-konva';
import Konva from 'konva';
import type { ButtonAgent, InterpolatedString, Agent } from '@fable-js/parser';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';
import { useFableContext } from '../context/FableContext.js';

export interface FableButtonProps {
  agent: ButtonAgent;
  variables: Map<string, any>;
  onEvent: (event: string, agent: Agent) => void;
}

export function FableButton({ agent, variables, onEvent }: FableButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<Konva.Group>(null);
  const { registerAgent } = useFableContext();

  // Register this agent's ref for tweening
  useEffect(() => {
    if (agent.id !== undefined) {
      registerAgent(agent.id, groupRef.current);
    }
    return () => {
      if (agent.id !== undefined) {
        registerAgent(agent.id, null);
      }
    };
  }, [agent.id, registerAgent]);

  // Create evaluator with current variables - recreated when variables change
  const evaluator = useMemo(() => new ExpressionEvaluator({
    getVariable: (name: string) => variables.get(name) ?? 0,
    hasVariable: (name: string) => variables.has(name),
  }), [variables]);

  const label = useMemo(() => {
    if (!evaluator) return 'Button';

    if (agent.label && typeof agent.label === 'object' && 'type' in agent.label) {
      const interpolated = agent.label as InterpolatedString;
      if (interpolated.type === 'interpolated_string') {
        return evaluator.evaluate(interpolated);
      }
    }
    return agent.label || 'Button';
  }, [agent.label, evaluator]);

  // Check if this button is draggable (has on_drag or on_drop events)
  const isDraggable = useMemo(() => {
    return agent.events?.some(e => e.type === 'on_drag' || e.type === 'on_drop') ?? false;
  }, [agent.events]);

  const x = agent.position?.[0] || 0;
  const y = agent.position?.[1] || 0;
  const width = 120;
  const height = 40;
  const textX = width / 2;
  const textY = height / 2;

  const handleClick = useCallback(() => {
    if (!isDragging) {
      onEvent('on_click', agent);
    }
  }, [onEvent, agent, isDragging]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onEvent('on_hover', agent);
  }, [onEvent, agent]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onEvent('on_drag', agent);
  }, [onEvent, agent]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    onEvent('on_drop', agent);
  }, [onEvent, agent]);

  // Determine fill color based on state
  const getFillColor = () => {
    if (isDragging) return '#2d7a32';
    if (isHovered) return '#45a049';
    return '#4CAF50';
  };

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={width}
        height={height}
        fill={getFillColor()}
        stroke="#000000"
        strokeWidth={1}
        cornerRadius={4}
        shadowColor={isDragging ? 'black' : undefined}
        shadowBlur={isDragging ? 10 : 0}
        shadowOffset={isDragging ? { x: 5, y: 5 } : { x: 0, y: 0 }}
        shadowOpacity={isDragging ? 0.3 : 0}
        onClick={handleClick}
        onTap={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <Text
        x={textX}
        y={textY}
        text={label}
        fontSize={14}
        fontFamily="Arial, sans-serif"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        offsetX={label.length * 3.5} // Approximate center alignment
        offsetY={7}
        listening={false}
      />
    </Group>
  );
}
