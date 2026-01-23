import { useState, useCallback, memo, useMemo } from 'react'
import { Rect, Text, Group } from 'react-konva'
import type Konva from 'konva'
import type { ButtonAgent, Agent } from '@fable-js/parser'
import { useAgentRegistration, useInterpolatedText } from '../hooks/index.js'

export interface FableButtonProps {
  agent: ButtonAgent
  variables: Map<string, unknown>
  onEvent: (event: string, agent: Agent) => void
}

// Button dimensions (could be made configurable via agent props later)
const BUTTON_WIDTH = 120
const BUTTON_HEIGHT = 40

// Button colors
const COLORS = {
  default: '#4CAF50',
  hover: '#45a049',
  dragging: '#2d7a32',
} as const

export const FableButton = memo(function FableButton({
  agent,
  variables,
  onEvent,
}: FableButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const groupRef = useAgentRegistration<Konva.Group>(agent.id)
  const label = useInterpolatedText(agent.label, variables, 'Button')

  // Check if draggable
  const isDraggable = useMemo(
    () => agent.events?.some((e) => e.type === 'on_drag' || e.type === 'on_drop') ?? false,
    [agent.events]
  )

  // Handlers
  const handleClick = useCallback(() => {
    if (!isDragging) {
      onEvent('on_click', agent)
    }
  }, [onEvent, agent, isDragging])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    onEvent('on_hover', agent)
  }, [onEvent, agent])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onEvent('on_drag', agent)
  }, [onEvent, agent])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    onEvent('on_drop', agent)
  }, [onEvent, agent])

  // Derived state
  const fillColor = isDragging ? COLORS.dragging : isHovered ? COLORS.hover : COLORS.default

  const shadowProps = useMemo(
    () => ({
      shadowColor: isDragging ? 'black' : undefined,
      shadowBlur: isDragging ? 10 : 0,
      shadowOffset: isDragging ? { x: 5, y: 5 } : { x: 0, y: 0 },
      shadowOpacity: isDragging ? 0.3 : 0,
    }),
    [isDragging]
  )

  return (
    <Group
      ref={groupRef}
      x={(agent.position as [number, number])?.[0] ?? 0}
      y={(agent.position as [number, number])?.[1] ?? 0}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={BUTTON_WIDTH}
        height={BUTTON_HEIGHT}
        fill={fillColor}
        stroke="#000000"
        strokeWidth={1}
        cornerRadius={4}
        {...shadowProps}
        onClick={handleClick}
        onTap={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <Text
        x={BUTTON_WIDTH / 2}
        y={BUTTON_HEIGHT / 2}
        text={label}
        fontSize={14}
        fontFamily="Arial, sans-serif"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        offsetX={label.length * 3.5}
        offsetY={7}
        listening={false}
      />
    </Group>
  )
})
