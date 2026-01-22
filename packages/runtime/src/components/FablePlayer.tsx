import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import type { Fable, Agent, Event } from '@fable-js/parser';
import { useRuntimeStore } from '../store/RuntimeStore.js';
import { FableRuntimeContext, type FableContextValue } from '../context/FableContext.js';
import { AnimationEngine } from '../engine/AnimationEngine.js';
import { FableText } from './FableText.js';
import { FableButton } from './FableButton.js';
import { FableImage } from './FableImage.js';

export interface FablePlayerProps {
  ast: Fable;
  /** Rendered width - the actual pixel size on screen */
  width?: number;
  /** Rendered height - the actual pixel size on screen */
  height?: number;
  /** Design width - the coordinate system used in DSL (default: 640) */
  designWidth?: number;
  /** Design height - the coordinate system used in DSL (default: 360) */
  designHeight?: number;
  /** Scale mode: 'fit' maintains aspect ratio, 'stretch' fills container */
  scaleMode?: 'fit' | 'stretch';
  className?: string;
  style?: React.CSSProperties;
  onStateChange?: (state: { currentPage: number; variables: Record<string, any>; pageHistory: number[] }) => void;
}


export function FablePlayer({
  ast,
  width = 800,
  height = 450,
  designWidth = 640,
  designHeight = 360,
  scaleMode = 'fit',
  className = '',
  style = {},
  onStateChange
}: FablePlayerProps) {
  const {
    setAst,
    getCurrentPage,
    executeStatements,
    getState,
    variables,
    currentPage: currentPageId,
    setAnimationEngine,
  } = useRuntimeStore();

  // Track previous page ID to detect navigation (not AST reload)
  const prevPageIdRef = useRef<number | null>(null);
  
  // Store refs to all agents for tweening/animations
  const agentRefs = useRef<Map<string, Konva.Node | null>>(new Map());

  // Calculate scale based on container size and design size
  const { scale, actualWidth, actualHeight, offsetX, offsetY } = useMemo(() => {
    if (scaleMode === 'stretch') {
      return {
        scale: 1,
        actualWidth: width,
        actualHeight: height,
        offsetX: 0,
        offsetY: 0,
      };
    }
    
    // Fit mode - maintain aspect ratio
    const scaleX = width / designWidth;
    const scaleY = height / designHeight;
    const fitScale = Math.min(scaleX, scaleY);
    
    const scaledWidth = designWidth * fitScale;
    const scaledHeight = designHeight * fitScale;
    
    return {
      scale: fitScale,
      actualWidth: scaledWidth,
      actualHeight: scaledHeight,
      offsetX: (width - scaledWidth) / 2,
      offsetY: (height - scaledHeight) / 2,
    };
  }, [width, height, designWidth, designHeight, scaleMode]);

  // Agent ref management
  const registerAgent = useCallback((id: string, ref: Konva.Node | null) => {
    agentRefs.current.set(id, ref);
  }, []);

  const getAgentRef = useCallback((id: string): Konva.Node | null => {
    return agentRefs.current.get(id) ?? null;
  }, []);

  // Context value
  const contextValue = useMemo<FableContextValue>(() => ({
    scale,
    designWidth,
    designHeight,
    registerAgent,
    getAgentRef,
  }), [scale, designWidth, designHeight, registerAgent, getAgentRef]);

  // Create and register AnimationEngine
  useEffect(() => {
    const engine = new AnimationEngine(getAgentRef);
    setAnimationEngine(engine);
    
    return () => {
      engine.stopAll();
      setAnimationEngine(null);
    };
  }, [getAgentRef, setAnimationEngine]);

  // Update store when AST changes (this also executes initial page statements)
  useEffect(() => {
    if (ast) {
      console.log('🔄 FablePlayer: Setting AST in store', {
        title: ast.title,
        pagesCount: ast.pages.length,
        firstPageId: ast.pages[0]?.id
      });
      setAst(ast, true);
      // Reset page tracking after AST change
      prevPageIdRef.current = ast.pages[0]?.id ?? null;
      // Clear agent refs on AST change
      agentRefs.current.clear();
    }
  }, [ast, setAst]);

  // Get current page from store, or fallback to first page from props on initial render
  const storeCurrentPage = getCurrentPage();
  const currentPage = storeCurrentPage ?? ast?.pages?.[0];

  // Execute page statements only when navigating to a different page (not on AST reload)
  useEffect(() => {
    // Skip if this is the initial load or AST change (handled by setAst)
    if (prevPageIdRef.current === null) {
      prevPageIdRef.current = currentPageId;
      return;
    }
    
    // Only execute if we navigated to a different page
    if (currentPageId !== prevPageIdRef.current && currentPage?.statements) {
      console.log('📜 Page navigation: Executing page statements for page', currentPageId);
      executeStatements(currentPage.statements);
    }
    
    prevPageIdRef.current = currentPageId;
  }, [currentPageId, currentPage, executeStatements]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      const state = getState();
      onStateChange(state);
    }
  }, [onStateChange, getState, variables]);

  const handleEvent = useCallback((event: string, agent: Agent) => {
    if (!('events' in agent)) return;

    const eventHandler = agent.events?.find((e: Event) => e.type === event);
    if (eventHandler && 'statements' in eventHandler && Array.isArray(eventHandler.statements)) {
      console.log('🖱️ Executing event statements:', event, eventHandler.statements);
      executeStatements(eventHandler.statements);
    }
  }, [executeStatements]);

  if (!currentPage) {
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
          ...style
        }}
      >
        <div className="text-center">
          <p className="text-muted-foreground">No pages available</p>
        </div>
      </div>
    );
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
          ...style
        }}
      >
        <Stage 
          width={width} 
          height={height}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Layer
            x={offsetX}
            y={offsetY}
            scaleX={scale}
            scaleY={scale}
          >
            {/* Render agents - pass variables for reactive updates */}
            {currentPage.agents?.map(agent => {
              const key = 'id' in agent ? agent.id : Math.random();

              switch (agent.type) {
                case 'text':
                  return <FableText key={key} agent={agent as any} variables={variables} />;
                case 'button':
                  return <FableButton key={key} agent={agent as any} variables={variables} onEvent={handleEvent} />;
                case 'image':
                  return <FableImage key={key} agent={agent as any} onEvent={handleEvent} />;
                default:
                  console.warn('Unknown agent type:', agent.type);
                  return null;
              }
            })}
          </Layer>
        </Stage>
      </div>
    </FableRuntimeContext.Provider>
  );
}
