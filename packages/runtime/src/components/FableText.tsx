import React, { useMemo } from 'react';
import { Text } from 'react-konva';
import type { TextAgent, InterpolatedString } from '@fable-js/parser';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';

export interface FableTextProps {
  agent: TextAgent;
  variables: Map<string, any>;
}


export function FableText({ agent, variables }: FableTextProps) {
  // Create evaluator with current variables - recreated when variables change
  const evaluator = useMemo(() => new ExpressionEvaluator({
    getVariable: (name: string) => variables.get(name) ?? 0,
    hasVariable: (name: string) => variables.has(name),
  }), [variables]);

  const content = useMemo(() => {
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