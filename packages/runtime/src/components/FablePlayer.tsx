import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { shallow } from 'zustand/shallow';
import type { Fable, Agent, Event } from '@fable-js/parser';
import { useRuntimeStore } from '../store/RuntimeStore.js';
import { FableText } from './FableText.js';
import { FableButton } from './FableButton.js';
import { FableImage } from './FableImage.js';

export interface FablePlayerProps {
  ast: Fable;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onStateChange?: (state: { currentPage: number; variables: Record<string, any>; pageHistory: number[] }) => void;
}


export function FablePlayer({
  ast,
  width = 800,
  height = 600,
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
  } = useRuntimeStore();

  // Track previous page ID to detect navigation (not AST reload)
  const prevPageIdRef = useRef<number | null>(null);

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
    <div
      className={`fable-player ${className}`}
      style={{
        width,
        height,
        border: '1px solid #ccc',
        ...style
      }}
    >
      <Stage width={width} height={height}>
        <Layer>
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
  );
}