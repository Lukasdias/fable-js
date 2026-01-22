import React, { useState, useMemo, useCallback } from 'react';
import { Rect, Text, Group } from 'react-konva';
import type { ButtonAgent, InterpolatedString, Agent } from '@fable-js/parser';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';

export interface FableButtonProps {
  agent: ButtonAgent;
  variables: Map<string, any>;
  onEvent: (event: string, agent: Agent) => void;
}

export function FableButton({ agent, variables, onEvent }: FableButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  const x = agent.position?.[0] || 0;
  const y = agent.position?.[1] || 0;
  const width = 120;
  const height = 40;
  const textX = x + width / 2;
  const textY = y + height / 2;

  const handleClick = useCallback(() => {
    onEvent('on_click', agent);
  }, [onEvent, agent]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onEvent('on_hover', agent);
  }, [onEvent, agent]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isHovered ? '#45a049' : '#4CAF50'}
        stroke="#000000"
        strokeWidth={1}
        cornerRadius={4}
        onClick={handleClick}
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