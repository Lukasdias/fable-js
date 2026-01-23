import { useState, useMemo, useCallback } from 'react'
import { parseDSL } from '@fable-js/parser'
import { DEFAULT_DSL } from '@/constants/default-dsl'

interface UseEditorStateResult {
  dsl: string
  setDsl: (dsl: string) => void
  draft: string
  setDraft: (draft: string) => void
  ast: any
  error: string | null
  hasUnsavedChanges: boolean
  handleSave: () => void
  handleRestart: () => void
  reset: () => void
  playerKey: number
  setPlayerKey: (key: number | ((prev: number) => number)) => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export function useEditorState(): UseEditorStateResult {
  const [dsl, setDsl] = useState(DEFAULT_DSL)
  const [draft, setDraft] = useState(DEFAULT_DSL)
  const [playerKey, setPlayerKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Parse DSL to AST
  const { ast, error } = useMemo(() => {
    try {
      const parsedAst = parseDSL(draft)
      return { ast: parsedAst, error: null }
    } catch (err) {
      return { ast: null, error: err instanceof Error ? err.message : 'Parse error' }
    }
  }, [draft])

  // Derived state
  const hasUnsavedChanges = draft !== dsl

  // Handlers
  const handleSave = useCallback(() => {
    setDsl(draft)
  }, [draft])

  const handleRestart = useCallback(() => {
    setPlayerKey((prev) => prev + 1)
    setCurrentPage(1)
  }, [])

  const reset = useCallback(() => {
    // Reset runtime state - this would be handled by the runtime store
  }, [])

  return {
    dsl,
    setDsl,
    draft,
    setDraft,
    ast,
    error,
    hasUnsavedChanges,
    handleSave,
    handleRestart,
    reset,
    playerKey,
    setPlayerKey,
    currentPage,
    setCurrentPage,
  }
}