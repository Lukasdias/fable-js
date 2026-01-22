import React, { useMemo, useRef, useEffect } from 'react';
import { Text } from 'react-konva';
import Konva from 'konva';
import type { TextAgent, InterpolatedString } from '@fable-js/parser';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';
import { useFableContext } from '../context/FableContext.js';

export interface FableTextProps {
  agent: TextAgent;
  variables: Map<string, any>;
}


export function FableText({ agent, variables }: FableTextProps) {
  const textRef = useRef<Konva.Text>(null);
  const { registerAgent } = useFableContext();

  // Register this agent's ref for tweening/animations
  useEffect(() => {
    if (agent.id !== undefined) {
      registerAgent(agent.id, textRef.current);
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
      ref={textRef}
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