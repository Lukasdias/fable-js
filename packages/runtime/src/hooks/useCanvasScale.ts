import { useMemo } from 'react'

interface ScaleConfig {
  width: number
  height: number
  designWidth: number
  designHeight: number
  scaleMode: 'fit' | 'stretch'
}

interface ScaleResult {
  scale: number
  actualWidth: number
  actualHeight: number
  offsetX: number
  offsetY: number
}

/**
 * Hook to calculate scale and offset for responsive canvas rendering.
 * Supports 'fit' (maintain aspect ratio) and 'stretch' modes.
 */
export function useCanvasScale({
  width,
  height,
  designWidth,
  designHeight,
  scaleMode,
}: ScaleConfig): ScaleResult {
  return useMemo(() => {
    if (scaleMode === 'stretch') {
      return {
        scale: 1,
        actualWidth: width,
        actualHeight: height,
        offsetX: 0,
        offsetY: 0,
      }
    }

    // Fit mode - maintain aspect ratio
    const scaleX = width / designWidth
    const scaleY = height / designHeight
    const fitScale = Math.min(scaleX, scaleY)

    const scaledWidth = designWidth * fitScale
    const scaledHeight = designHeight * fitScale

    return {
      scale: fitScale,
      actualWidth: scaledWidth,
      actualHeight: scaledHeight,
      offsetX: (width - scaledWidth) / 2,
      offsetY: (height - scaledHeight) / 2,
    }
  }, [width, height, designWidth, designHeight, scaleMode])
}
