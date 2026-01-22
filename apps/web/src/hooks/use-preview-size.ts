import { useEffect, useState, type RefObject } from 'react'

interface PreviewSize {
  width: number
  height: number
}

interface UsePreviewSizeOptions {
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  padding?: number
}

/**
 * Hook to calculate responsive preview size based on container dimensions.
 * Maintains aspect ratio while fitting within the container.
 */
export function usePreviewSize(
  containerRef: RefObject<HTMLDivElement | null>,
  deps: unknown[] = [],
  options: UsePreviewSizeOptions = {}
): PreviewSize {
  const {
    aspectRatio = 16 / 9,
    minWidth = 640,
    minHeight = 360,
    padding = 48,
  } = options

  const [size, setSize] = useState<PreviewSize>({ width: 800, height: 450 })

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.clientWidth - padding
      const containerHeight = container.clientHeight - padding

      let width = containerWidth
      let height = width / aspectRatio

      if (height > containerHeight) {
        height = containerHeight
        width = height * aspectRatio
      }

      setSize({
        width: Math.floor(Math.max(minWidth, width)),
        height: Math.floor(Math.max(minHeight, height)),
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [containerRef, aspectRatio, minWidth, minHeight, padding, ...deps])

  return size
}
