import { useCallback, useRef } from 'react'
import type Konva from 'konva'

/**
 * Hook to manage agent refs for tweening/animations.
 * Returns register and getter functions for agent Konva nodes.
 */
export function useAgentRefs() {
  const agentRefs = useRef<Map<string, Konva.Node | null>>(new Map())

  const registerAgent = useCallback((id: string, ref: Konva.Node | null) => {
    agentRefs.current.set(id, ref)
  }, [])

  const getAgentRef = useCallback((id: string): Konva.Node | null => {
    return agentRefs.current.get(id) ?? null
  }, [])

  const clearAgentRefs = useCallback(() => {
    agentRefs.current.clear()
  }, [])

  return {
    registerAgent,
    getAgentRef,
    clearAgentRefs,
  }
}
