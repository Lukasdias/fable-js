'use client'

import { useCallback, useRef, useState } from 'react'
import { EditorToolbar, EditorPanel, PreviewPanel } from './editor'
import { usePreviewSize } from '@/hooks/use-preview-size'
import { useDSLParser } from '@/hooks/use-dsl-parser'
import { DEFAULT_DSL } from '@/constants/default-dsl'

export function FableEditor() {
  // State for editor content
  const [dsl, setDsl] = useState(DEFAULT_DSL)
  const [draft, setDraft] = useState(DEFAULT_DSL)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playerKey, setPlayerKey] = useState(0)

  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // Custom hooks
  const { ast, error } = useDSLParser(dsl)
  const previewSize = usePreviewSize(previewContainerRef, [isFullscreen])

  // Derived state
  const hasUnsavedChanges = draft !== dsl

  // Handlers
  const handleSave = useCallback(() => {
    setDsl(draft)
  }, [draft])

  const handleRestart = useCallback(() => {
    setPlayerKey((prev) => prev + 1)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const handleEditorChange = useCallback((value: string) => {
    setDraft(value)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <EditorToolbar
        title={ast?.title}
        hasUnsavedChanges={hasUnsavedChanges}
        hasError={!!error}
        hasAst={!!ast}
        isFullscreen={isFullscreen}
        onSave={handleSave}
        onRestart={handleRestart}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="flex-1 flex min-h-0">
        {!isFullscreen && (
          <EditorPanel
            value={draft}
            error={error}
            onChange={handleEditorChange}
            onSave={handleSave}
          />
        )}

        <PreviewPanel
          ref={previewContainerRef}
          ast={ast}
          playerKey={playerKey}
          previewSize={previewSize}
          isFullscreen={isFullscreen}
          hasError={!!error}
        />
      </div>
    </div>
  )
}
