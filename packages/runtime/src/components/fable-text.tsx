import { memo } from 'react'
import { Text } from 'react-konva'
import type Konva from 'konva'
import type { TextAgent } from '@fable-js/parser'
import { useAgentRegistration, useInterpolatedText } from '../hooks/index.js'

export interface FableTextProps {
  agent: TextAgent
  variables: Map<string, unknown>
}

export const FableText = memo(function FableText({
  agent,
  variables,
}: FableTextProps) {
  const textRef = useAgentRegistration<Konva.Text>(agent.id)
  const content = useInterpolatedText(agent.content, variables)

  return (
    <Text
      ref={textRef}
      x={(agent.position as [number, number])?.[0] ?? 0}
      y={(agent.position as [number, number])?.[1] ?? 0}
      text={content}
      fontSize={16}
      fontFamily="Arial, sans-serif"
      fill="#000000"
      listening={false}
    />
  )
})
