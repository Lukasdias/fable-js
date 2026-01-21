import React, { useEffect, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
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

/**
 * Main FableJS player component using Konva canvas rendering
 * Uses Zustand for state management with optimized re-renders
 */
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
  } = useRuntimeStore();

  // Initialize story when AST changes
  useEffect(() => {
    setAst(ast);
  }, [ast, setAst]);

  // Execute current page statements when page changes
  useEffect(() => {
    const currentPage = getCurrentPage();
    if (currentPage && currentPage.statements) {
      executeStatements(currentPage.statements);
    }
  }, [getCurrentPage, executeStatements]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(getState());
    }
  }, [getState, onStateChange]);

  // Handle events with Zustand store
  const handleEvent = useCallback((event: string, agent: Agent) => {
    if (!('events' in agent)) return;

    const eventHandler = agent.events?.find((e: Event) => e.type === event);
    if (eventHandler && 'statements' in eventHandler && Array.isArray(eventHandler.statements)) {
      executeStatements(eventHandler.statements);
    }
  }, [executeStatements]);

  const currentPage = getCurrentPage();
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
          <p className="text-muted-foreground">Page not found</p>
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
          {/* Render agents */}
          {currentPage.agents?.map(agent => {
            const key = 'id' in agent ? agent.id : Math.random();

            switch (agent.type) {
              case 'text':
                return <FableText key={key} agent={agent as any} />;
              case 'button':
                return <FableButton key={key} agent={agent as any} onEvent={handleEvent} />;
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