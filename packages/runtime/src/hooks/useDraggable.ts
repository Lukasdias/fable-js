import { useState, useCallback, useMemo } from 'react'
import type Konva from 'konva'
import type { Event, Agent } from '@fable-js/parser'

interface UseDraggableOptions {
  agent: Agent
  events?: Event[]
  onEvent: (event: string, agent: Agent) => void
}

interface UseDraggableResult {
  isDragging: boolean
  isDraggable: boolean
  handleDragStart: () => void
  handleDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  handleClick: () => void
  dragShadowProps: {
    shadowColor: string | undefined
    shadowBlur: number
    shadowOffset: { x: number; y: number }
    shadowOpacity: number
  }
}

/**
 * Hook for handling draggable agent behavior.
 * Provides drag state, handlers, and shadow styling for drag feedback.
 */
export function useDraggable({
  agent,
  events,
  onEvent,
}: UseDraggableOptions): UseDraggableResult {
  const [isDragging, setIsDragging] = useState(false)

  const isDraggable = useMemo(
    () => events?.some((e) => e.type === 'on_drag' || e.type === 'on_drop') ?? false,
    [events]
  )

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onEvent('on_drag', agent)
  }, [onEvent, agent])

  const handleDragEnd = useCallback(
    (_e: Konva.KonvaEventObject<DragEvent>) => {
      setIsDragging(false)
      onEvent('on_drop', agent)
    },
    [onEvent, agent]
  )

  const handleClick = useCallback(() => {
    if (!isDragging) {
      onEvent('on_click', agent)
    }
  }, [onEvent, agent, isDragging])

  const dragShadowProps = useMemo(
    () => ({
      shadowColor: isDragging ? 'black' : undefined,
      shadowBlur: isDragging ? 10 : 0,
      shadowOffset: isDragging ? { x: 5, y: 5 } : { x: 0, y: 0 },
      shadowOpacity: isDragging ? 0.3 : 0,
    }),
    [isDragging]
  )

  return {
    isDragging,
    isDraggable,
    handleDragStart,
    handleDragEnd,
    handleClick,
    dragShadowProps,
  }
}
