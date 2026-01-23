import type { Agent, ImageAgent } from '@fable-js/parser'
import type Konva from 'konva'
import { memo, useCallback, useEffect, useState } from 'react'
import { Image } from 'react-konva'
import { useAgentRegistration, useDraggable } from '../hooks/index.js'
import { useFableContext } from '../context/fable-context.js'

export interface FableImageProps {
  agent: ImageAgent
  onEvent: (event: string, agent: Agent) => void
}

export const FableImage = memo(function FableImage({
  agent,
  onEvent,
}: FableImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const { assets } = useFableContext()

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

    // Resolve asset path if it starts with 'assets/'
    let imageSrc = agent.src
    if (agent.src.startsWith('assets/')) {
      const asset = assets[agent.src]
      if (asset) {
        imageSrc = asset.url
      } else {
        console.warn('Asset not found:', agent.src)
        return
      }
    }

    const img = new window.Image()
    img.src = imageSrc
    img.onload = () => setImage(img)
    img.onerror = () => console.warn('Failed to load image:', imageSrc)
  }, [agent.src, assets])

  const handleMouseEnter = useCallback(() => {
    onEvent('on_hover', agent)
  }, [onEvent, agent])

  return (
    <Image
      ref={imageRef}
      x={(agent.position as [number, number])?.[0] ?? 0}
      y={(agent.position as [number, number])?.[1] ?? 0}
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
