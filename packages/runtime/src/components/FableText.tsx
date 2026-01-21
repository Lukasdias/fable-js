import React from 'react';
import { Text } from 'react-konva';
import type { TextAgent, InterpolatedString } from '@fable-js/parser';
import { useRuntimeStore } from '../store/RuntimeStore.js';

export interface FableTextProps {
  agent: TextAgent;
}

/**
 * Text agent component using Konva Text for canvas rendering
 */
export function FableText({ agent }: FableTextProps) {
  const { evaluator } = useRuntimeStore();

  // Memoize content evaluation to prevent unnecessary re-computation
  const content = React.useMemo(() => {
    if (!evaluator) return '';

    if (agent.content && typeof agent.content === 'object' && 'type' in agent.content) {
      const interpolated = agent.content as InterpolatedString;
      if (interpolated.type === 'interpolated_string') {
        return evaluator.evaluate(interpolated);
      }
    }
    return agent.content || '';
  }, [agent.content, evaluator]);

  return (
    <Text
      x={agent.position?.[0] || 0}
      y={agent.position?.[1] || 0}
      text={content}
      fontSize={16}
      fontFamily="Arial, sans-serif"
      fill="#000000"
      listening={false}
    />
  );
}