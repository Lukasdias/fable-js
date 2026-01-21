import React from 'react';
import { Rect, Text, Group } from 'react-konva';
import type { ButtonAgent, InterpolatedString, Agent } from '@fable-js/parser';
import { useRuntimeStore } from '../store/RuntimeStore.js';

export interface FableButtonProps {
  agent: ButtonAgent;
  onEvent: (event: string, agent: Agent) => void;
}

/**
 * Button agent component using Konva Rect + Text for canvas rendering
 */
export function FableButton({ agent, onEvent }: FableButtonProps) {
  const { evaluator } = useRuntimeStore();
  const [isHovered, setIsHovered] = React.useState(false);

  // Memoize label evaluation
  const label = React.useMemo(() => {
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

  // Calculate text position to center it in the button
  const textX = x + width / 2;
  const textY = y + height / 2;

  const handleClick = React.useCallback(() => {
    onEvent('on_click', agent);
  }, [onEvent, agent]);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    onEvent('on_hover', agent);
  }, [onEvent, agent]);

  const handleMouseLeave = React.useCallback(() => {
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