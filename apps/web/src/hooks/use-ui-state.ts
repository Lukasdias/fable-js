import { useState, useCallback } from 'react'

interface UseUIStateResult {
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void
  toggleFullscreen: () => void
  showPageCreation: boolean
  setShowPageCreation: (show: boolean) => void
  showAssetUpload: boolean
  setShowAssetUpload: (show: boolean) => void
  popoverPosition: { x: number; y: number }
  setPopoverPosition: (position: { x: number; y: number }) => void
}

export function useUIState(): UseUIStateResult {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPageCreation, setShowPageCreation] = useState(false)
  const [showAssetUpload, setShowAssetUpload] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  return {
    isFullscreen,
    setIsFullscreen,
    toggleFullscreen,
    showPageCreation,
    setShowPageCreation,
    showAssetUpload,
    setShowAssetUpload,
    popoverPosition,
    setPopoverPosition,
  }
}