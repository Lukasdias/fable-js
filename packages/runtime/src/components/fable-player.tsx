import React, { useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { Stage, Layer } from 'react-konva'
import type { Fable, Agent, Event, TextAgent, ButtonAgent, ImageAgent, IfBlock, ForBlock } from '@fable-js/parser'
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
  evaluator,
  positions,
  onEvent,
}: {
  agent: Agent
  variables: Map<string, unknown>
  evaluator: any // ExpressionEvaluator
  positions: Map<string, [number, number]>
  onEvent: (event: string, agent: Agent) => void
}) {
  // Use persisted position if available, otherwise evaluate agent position
  const hasId = 'id' in agent
  let position: [number, number]
  if (hasId && positions.has(agent.id!)) {
    position = positions.get(agent.id!)!
  } else {
    const pos = (agent as any).position || [0, 0]
    if (Array.isArray(pos) && pos.length === 2) {
      if (typeof pos[0] === 'object' && typeof pos[1] === 'object') {
        // Expressions, evaluate
        position = [
          evaluator?.evaluate(pos[0]) ?? 0,
          evaluator?.evaluate(pos[1]) ?? 0
        ] as [number, number]
      } else {
        position = pos as [number, number]
      }
    } else {
      position = [0, 0]
    }
  }
  const agentWithPosition = { ...agent, position }

  switch (agent.type) {
    case 'text':
      return <FableText agent={agentWithPosition as TextAgent} variables={variables} />
    case 'button':
      return <FableButton agent={agentWithPosition as ButtonAgent} variables={variables} onEvent={onEvent} />
    case 'image':
      return <FableImage agent={agentWithPosition as ImageAgent} onEvent={onEvent} />
    case 'if': {
      const ifAgent = agent as IfBlock
      const conditionResult = evaluator?.evaluate(ifAgent.condition)
      if (conditionResult) {
        return (
          <>
            {ifAgent.agents.map((subAgent, index) => (
              <AgentRenderer
                key={`if-${index}`}
                agent={subAgent}
                variables={variables}
                evaluator={evaluator}
                positions={positions}
                onEvent={onEvent}
              />
            ))}
          </>
        )
      }
      return null
    }
    case 'for': {
      const forAgent = agent as ForBlock
      const range = evaluator?.evaluate(forAgent.range)
      if (Array.isArray(range)) {
        return (
          <>
            {range.map((value, index) => {
              // Temporarily set the variable for this iteration
              const originalValue = variables.get(forAgent.variable)
              variables.set(forAgent.variable, value)
              const result = (
                <React.Fragment key={`for-${index}`}>
                  {forAgent.agents.map((subAgent, subIndex) => (
                    <AgentRenderer
                      key={`for-${index}-${subIndex}`}
                      agent={subAgent}
                      variables={variables}
                      evaluator={evaluator}
                      positions={positions}
                      onEvent={onEvent}
                    />
                  ))}
                </React.Fragment>
              )
              // Restore original value
              if (originalValue !== undefined) {
                variables.set(forAgent.variable, originalValue)
              } else {
                variables.delete(forAgent.variable)
              }
              return result
            })}
          </>
        )
      }
      return null
    }
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
    evaluator,
    positions,
    animationEngine,
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

    // Start animations for current page agents
    if (storeCurrentPage) {
      storeCurrentPage.agents?.forEach(agent => {
        if ('animate' in agent && agent.animate && 'id' in agent && agent.id) {
          engine.startAnimation(agent.id, {
            type: agent.animate.animation as any,
            duration: agent.animate.duration,
            repeat: agent.animate.repeat,
          })
        }
      })
    }

    return () => {
      engine.stopAll()
      setAnimationEngine(null)
    }
  }, [getAgentRef, setAnimationEngine, currentPageId])

  const storeCurrentPage = getCurrentPage()

  // Update store when AST changes
  useEffect(() => {
    if (ast) {
      setAst(ast, true)
      prevPageIdRef.current = ast.pages[0]?.id ?? null
      clearAgentRefs()
    }
  }, [ast, setAst, clearAgentRefs])
  const currentPage = storeCurrentPage ?? ast?.pages?.[0]

  // Execute page statements and start animations on navigation
  useEffect(() => {
    if (prevPageIdRef.current === null) {
      prevPageIdRef.current = currentPageId
      return
    }

    if (currentPageId !== prevPageIdRef.current) {
      if (currentPage?.statements) {
        executeStatements(currentPage.statements)
      }
      // Start animations for the new page
      if (animationEngine && currentPage?.agents) {
        currentPage.agents.forEach(agent => {
          if ('animate' in agent && agent.animate && 'id' in agent && agent.id) {
            animationEngine.startAnimation(agent.id, {
              type: agent.animate.animation as any,
              duration: agent.animate.duration,
              repeat: agent.animate.repeat,
            })
          }
        })
      }
    }

    prevPageIdRef.current = currentPageId
  }, [currentPageId, currentPage, executeStatements, animationEngine])

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
      if (eventHandler?.statements) {
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
                evaluator={evaluator}
                positions={positions}
                onEvent={handleEvent}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </FableRuntimeContext.Provider>
  )
})
