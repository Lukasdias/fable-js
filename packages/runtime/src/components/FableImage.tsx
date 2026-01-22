import { useState, useEffect, useCallback, memo } from 'react'
import { Image } from 'react-konva'
import type Konva from 'konva'
import type { ImageAgent, Agent } from '@fable-js/parser'
import { useAgentRegistration, useDraggable } from '../hooks/index.js'

export interface FableImageProps {
  agent: ImageAgent
  onEvent: (event: string, agent: Agent) => void
}

export const FableImage = memo(function FableImage({
  agent,
  onEvent,
}: FableImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const imageRef = useAgentRegistration<Konva.Image>(agent.id)

  const {
    isDraggable,
    handleDragStart,
    handleDragEnd,
    handleClick,
    dragShadowProps,
  } = useDraggable({
    agent,
    events: agent.events,
    onEvent,
  })

  // Load image when src changes
  useEffect(() => {
    if (!agent.src) return

    const img = new window.Image()
    img.src = agent.src
    img.onload = () => setImage(img)
    img.onerror = () => console.warn('Failed to load image:', agent.src)
  }, [agent.src])

  const handleMouseEnter = useCallback(() => {
    onEvent('on_hover', agent)
  }, [onEvent, agent])

  return (
    <Image
      ref={imageRef}
      x={agent.position?.[0] ?? 0}
      y={agent.position?.[1] ?? 0}
      image={image ?? undefined}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={handleMouseEnter}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      {...dragShadowProps}
    />
  )
})
