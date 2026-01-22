import { useEffect, useRef } from 'react'
import type Konva from 'konva'
import { useFableContext } from '../context/fable-context.js'

/**
 * Hook to register an agent's Konva node ref for animations/tweening.
 * Automatically handles cleanup on unmount.
 */
export function useAgentRegistration<T extends Konva.Node>(
  agentId: string | undefined
): React.RefObject<T | null> {
  const nodeRef = useRef<T>(null)
  const { registerAgent } = useFableContext()

  useEffect(() => {
    if (agentId !== undefined) {
      registerAgent(agentId, nodeRef.current)
    }
    return () => {
      if (agentId !== undefined) {
        registerAgent(agentId, null)
      }
    }
  }, [agentId, registerAgent])

  return nodeRef
}
