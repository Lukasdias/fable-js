'use client'

import { useCallback, useRef, useState } from 'react'
import { EditorToolbar, EditorPanel, PreviewPanel } from './editor'
import { PageTraveller } from './page-traveller'
import { usePreviewSize } from '@/hooks/use-preview-size'
import { useDSLParser } from '@/hooks/use-dsl-parser'
import { DEFAULT_DSL, DEFAULT_AST } from '@/constants/default-dsl'
import { useRuntimeStore, useRuntimeActions } from '@fable-js/runtime'

export function FableEditor() {
  // State for editor content
  const [dsl, setDsl] = useState(DEFAULT_DSL)
  const [draft, setDraft] = useState(DEFAULT_DSL)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playerKey, setPlayerKey] = useState(0)
  const [showPageTraveller, setShowPageTraveller] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const fablePlayerRef = useRef<any>(null)

  // Custom hooks
  const { ast, error } = useDSLParser(dsl, DEFAULT_AST)
  const previewSize = usePreviewSize(previewContainerRef, [isFullscreen])
  const { goToPage, reset } = useRuntimeActions()

  // Derived state
  const hasUnsavedChanges = draft !== dsl

  // Handlers
  const handleSave = useCallback(() => {
    setDsl(draft)
  }, [draft])

  const handleRestart = useCallback(() => {
    // Reset the runtime store and restart the player
    reset()
    setPlayerKey((prev) => prev + 1)
    setCurrentPage(1) // Reset to first page on restart
  }, [reset])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const togglePageTraveller = useCallback(() => {
    setShowPageTraveller((prev) => !prev)
  }, [])

  const handlePageSelect = useCallback((pageId: number) => {
    // Navigate to the specific page using the runtime store
    goToPage(pageId)
    setCurrentPage(pageId)
  }, [goToPage])

  const handlePlayerStateChange = useCallback((state: {
    currentPage: number
    variables: Record<string, any>
    pageHistory: number[]
  }) => {
    setCurrentPage(state.currentPage)
  }, [])

  const handleEditorChange = useCallback((value: string) => {
    setDraft(value)
  }, [])

  return (
    <div
      className="
        h-screen flex flex-col
        bg-background
        text-foreground
        overflow-hidden
      "
    >
      {/* Subtle gradient background overlay */}
      <div
        className="
          fixed inset-0 pointer-events-none
          bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02]
        "
      />

      {/* Toolbar */}
      <EditorToolbar
        title={ast?.title}
        hasUnsavedChanges={hasUnsavedChanges}
        hasError={!!error}
        hasAst={!!ast}
        isFullscreen={isFullscreen}
        showPageTraveller={showPageTraveller}
        onSave={handleSave}
        onRestart={handleRestart}
        onToggleFullscreen={toggleFullscreen}
        onTogglePageTraveller={togglePageTraveller}
      />

      {/* Main content area */}
      <main
        className="
          flex-1 flex min-h-0
          relative
        "
      >
        {/* Page Traveller - Hidden in fullscreen */}
        {!isFullscreen && showPageTraveller && ast && (
          <PageTraveller
            pages={ast.pages}
            currentPage={currentPage}
            onPageSelect={handlePageSelect}
          />
        )}

        {/* Editor Panel - Hidden in fullscreen */}
        {!isFullscreen && (
          <EditorPanel
            value={draft}
            error={error}
            onChange={handleEditorChange}
            onSave={handleSave}
          />
        )}

        {/* Preview Panel */}
        <PreviewPanel
          ref={previewContainerRef}
          ast={ast}
          playerKey={playerKey}
          previewSize={previewSize}
          isFullscreen={isFullscreen}
          hasError={!!error}
          onStateChange={handlePlayerStateChange}
        />
      </main>
    </div>
  )
}
