import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Fable, Agent, Event, Statement } from '@fable-js/parser';
import { FableState } from '../engine/FableState.js';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';
import { FableText } from './FableText.jsx';
import { FableButton } from './FableButton.jsx';
import { FableImage } from './FableImage.jsx';

export interface FablePlayerProps {
  ast: Fable;
  className?: string;
  style?: React.CSSProperties;
  onStateChange?: (state: ReturnType<FableState['getState']>) => void;
}

/**
 * Main FableJS player component with React 19 optimizations
 * Uses startTransition for non-urgent updates and optimized re-renders
 */
export function FablePlayer({ ast, className = '', style = {}, onStateChange }: FablePlayerProps) {
  // Memoize state and evaluator to prevent unnecessary re-creation
  const state = useMemo(() => new FableState(ast), [ast]);
  const evaluator = useMemo(() => new ExpressionEvaluator(state), [state]);

  // State for triggering re-renders when story state changes
  const [stateVersion, setStateVersion] = useState(0);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state.getState());
  }, [state, stateVersion, onStateChange]);

  // Execute statements with React 19 startTransition for non-urgent updates
  const executeStatements = useCallback((statements: any[]) => {
    if (!statements) return;

    // Use React.startTransition for non-urgent state updates
    React.startTransition(() => {
      statements.forEach((stmt: any) => {
        switch (stmt.type) {
          case 'set':
            const value = evaluator.evaluate(stmt.value);
            state.setVariable(stmt.variable, value);
            break;

          case 'go_to_page':
            state.goToPage(stmt.pageId);
            break;

          default:
            console.warn('Unknown statement type:', stmt.type);
        }
      });

      // Trigger re-render
      setStateVersion(prev => prev + 1);
    });
  }, [state, evaluator]);

  // Handle events with proper typing
  const handleEvent = useCallback((event: Event['type'], agent: Agent) => {
    if (!('events' in agent)) return;

    const eventHandler = agent.events?.find((e: Event) => e.type === event);
    if (eventHandler && 'statements' in eventHandler && Array.isArray(eventHandler.statements)) {
      executeStatements(eventHandler.statements);
    }
  }, [executeStatements]);

  // Initialize page statements
  useEffect(() => {
    const currentPage = state.getCurrentPage();
    if (currentPage && currentPage.statements) {
      executeStatements(currentPage.statements);
    }
  }, [state, executeStatements]);

  const currentPage = state.getCurrentPage();
  if (!currentPage) {
    return <div className="fable-error">Page not found: {state.getState().currentPage}</div>;
  }

  // Memoize agent rendering for performance
  const renderedAgents = useMemo(() => {
    return currentPage.agents?.map(agent => {
      const key = 'id' in agent ? agent.id : Math.random();
      const props = {
        agent: agent as any,
        evaluator,
        onEvent: handleEvent
      };

      switch (agent.type) {
        case 'text':
          return <FableText key={key} {...(props as any)} />;
        case 'button':
          return <FableButton key={key} {...(props as any)} />;
        case 'image':
          return <FableImage key={key} {...(props as any)} />;
        default:
          console.warn('Unknown agent type:', agent.type);
          return null;
      }
    }) || [];
  }, [currentPage.agents, evaluator, handleEvent]);

  return (
    <div
      className={`fable-player ${className}`}
      style={{
        position: 'relative',
        width: '800px',
        height: '600px',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        ...style
      }}
    >
      {renderedAgents}
    </div>
  );
}