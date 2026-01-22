import { useEffect, useState } from 'react'
import { parseDSL, type Fable } from '@fable-js/parser'

interface UseDSLParserResult {
  ast: Fable | null
  error: string | null
}

/**
 * Hook to parse DSL code and manage AST/error state.
 * Automatically parses when input changes.
 */
export function useDSLParser(dsl: string): UseDSLParserResult {
  const [ast, setAst] = useState<Fable | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!dsl.trim()) {
      setAst(null)
      setError(null)
      return
    }

    try {
      const parsedAst = parseDSL(dsl)
      setAst(parsedAst)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Parse error'
      setAst(null)
      setError(errorMessage)
    }
  }, [dsl])

  return { ast, error }
}
