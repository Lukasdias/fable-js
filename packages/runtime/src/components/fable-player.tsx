import React, { useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { Stage, Layer } from 'react-konva'
import type { Fable, Agent, Event, TextAgent, ButtonAgent, ImageAgent } from '@fable-js/parser'
import { useRuntimeStore } from '../store/runtime-store.js'
import { FableRuntimeContext, type FableContextValue } from '../context/fable-context.js'
import { AnimationEngine } from '../engine/animation-engine.js'
import { useCanvasScale, useAgentRefs } from '../hooks/index.js'
import { FableText } from './fable-text.js'
import { FableButton } from './fable-button.js'
import { FableImage } from './fable-image.js'

export interface FablePlayerProps {
  ast: Fable
  width?: number
  height?: number
  designWidth?: number
  designHeight?: number
  scaleMode?: 'fit' | 'stretch'
  className?: string
  style?: React.CSSProperties
  onStateChange?: (state: {
    currentPage: number
    variables: Record<string, unknown>
    pageHistory: number[]
  }) => void
}

// Empty state component
const EmptyState = memo(function EmptyState({
  width,
  height,
  className,
  style,
}: {
  width: number
  height: number
  className: string
  style: React.CSSProperties
}) {
  return (
    <div
      className={`fable-player ${className}`}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        ...style,
      }}
    >
      <div className="text-center">
        <p className="text-muted-foreground">No pages available</p>
      </div>
    </div>
  )
})

// Agent renderer component
const AgentRenderer = memo(function AgentRenderer({
  agent,
  variables,
  onEvent,
}: {
  agent: Agent
  variables: Map<string, unknown>
  onEvent: (event: string, agent: Agent) => void
}) {
  switch (agent.type) {
    case 'text':
      return <FableText agent={agent as TextAgent} variables={variables} />
    case 'button':
      return <FableButton agent={agent as ButtonAgent} variables={variables} onEvent={onEvent} />
    case 'image':
      return <FableImage agent={agent as ImageAgent} onEvent={onEvent} />
    default:
      console.warn('Unknown agent type:', agent.type)
      return null
  }
})

export const FablePlayer = memo(function FablePlayer({
  ast,
  width = 800,
  height = 450,
  designWidth = 640,
  designHeight = 360,
  scaleMode = 'fit',
  className = '',
  style = {},
  onStateChange,
}: FablePlayerProps) {
  const {
    setAst,
    getCurrentPage,
    executeStatements,
    getState,
    variables,
    currentPage: currentPageId,
    setAnimationEngine,
  } = useRuntimeStore()

  const prevPageIdRef = useRef<number | null>(null)
  const { registerAgent, getAgentRef, clearAgentRefs } = useAgentRefs()

  const { scale, offsetX, offsetY } = useCanvasScale({
    width,
    height,
    designWidth,
    designHeight,
    scaleMode,
  })

  // Context value for child components
  const contextValue = useMemo<FableContextValue>(
    () => ({
      scale,
      designWidth,
      designHeight,
      registerAgent,
      getAgentRef,
    }),
    [scale, designWidth, designHeight, registerAgent, getAgentRef]
  )

  // Create and register AnimationEngine
  useEffect(() => {
    const engine = new AnimationEngine(getAgentRef)
    setAnimationEngine(engine)

    return () => {
      engine.stopAll()
      setAnimationEngine(null)
    }
  }, [getAgentRef, setAnimationEngine])

  // Update store when AST changes
  useEffect(() => {
    if (ast) {
      setAst(ast, true)
      prevPageIdRef.current = ast.pages[0]?.id ?? null
      clearAgentRefs()
    }
  }, [ast, setAst, clearAgentRefs])

  const storeCurrentPage = getCurrentPage()
  const currentPage = storeCurrentPage ?? ast?.pages?.[0]

  // Execute page statements on navigation
  useEffect(() => {
    if (prevPageIdRef.current === null) {
      prevPageIdRef.current = currentPageId
      return
    }

    if (currentPageId !== prevPageIdRef.current && currentPage?.statements) {
      executeStatements(currentPage.statements)
    }

    prevPageIdRef.current = currentPageId
  }, [currentPageId, currentPage, executeStatements])

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(getState())
    }
  }, [onStateChange, getState, variables])

  const handleEvent = useCallback(
    (event: string, agent: Agent) => {
      if (!('events' in agent)) return

      const eventHandler = (agent as { events?: Event[] }).events?.find(
        (e: Event) => e.type === event
      )
      if (eventHandler && 'statements' in eventHandler && Array.isArray(eventHandler.statements)) {
        executeStatements(eventHandler.statements)
      }
    },
    [executeStatements]
  )

  if (!currentPage) {
    return <EmptyState width={width} height={height} className={className} style={style} />
  }

  return (
    <FableRuntimeContext.Provider value={contextValue}>
      <div
        className={`fable-player ${className}`}
        style={{
          width,
          height,
          backgroundColor: '#1a1a2e',
          position: 'relative',
          ...style,
        }}
      >
        <Stage
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
            {currentPage.agents?.map((agent) => (
              <AgentRenderer
                key={'id' in agent ? agent.id : Math.random()}
                agent={agent}
                variables={variables}
                onEvent={handleEvent}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </FableRuntimeContext.Provider>
  )
})
