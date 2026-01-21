import React, { useState, useEffect, useCallback } from 'react';
import { FableState } from '../engine/FableState.js';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';
import { FableText } from './FableText.jsx';
import { FableButton } from './FableButton.jsx';
import { FableImage } from './FableImage.jsx';

/**
 * Main FableJS player component
 */
export function FablePlayer({ ast, className = '', style = {} }) {
  const [state, setState] = useState(() => new FableState(ast));
  const [evaluator, setEvaluator] = useState(() => new ExpressionEvaluator(state));

  // Update evaluator when state changes
  useEffect(() => {
    setEvaluator(new ExpressionEvaluator(state));
  }, [state]);

  // Execute statements
  const executeStatements = useCallback((statements) => {
    if (!statements) return;

    setState(currentState => {
      const newState = new FableState(ast);
      newState.variables = new Map(currentState.variables);
      newState.currentPage = currentState.currentPage;
      newState.pageHistory = [...currentState.pageHistory];

      const exprEval = new ExpressionEvaluator(newState);

      statements.forEach(stmt => {
        switch (stmt.type) {
          case 'set':
            const value = exprEval.evaluate(stmt.value);
            newState.setVariable(stmt.variable, value);
            break;

          case 'go_to_page':
            newState.goToPage(stmt.pageId);
            break;

          default:
            console.warn('Unknown statement type:', stmt.type);
        }
      });

      return newState;
    });
  }, [ast]);

  // Handle events
  const handleEvent = useCallback((event, agent) => {
    if (!agent.events) return;

    const eventHandler = agent.events.find(e => e.type === event);
    if (eventHandler && eventHandler.statements) {
      executeStatements(eventHandler.statements);
    }
  }, [executeStatements]);

  // Initialize page statements
  useEffect(() => {
    const currentPage = state.getCurrentPage();
    if (currentPage && currentPage.statements) {
      executeStatements(currentPage.statements);
    }
  }, [state.currentPage, executeStatements]);

  const currentPage = state.getCurrentPage();
  if (!currentPage) {
    return <div className="fable-error">Page not found: {state.currentPage}</div>;
  }

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
      {/* Render agents */}
      {currentPage.agents?.map(agent => {
        const props = {
          key: agent.id,
          agent,
          evaluator,
          onEvent: handleEvent
        };

        switch (agent.type) {
          case 'text':
            return <FableText {...props} />;
          case 'button':
            return <FableButton {...props} />;
          case 'image':
            return <FableImage {...props} />;
          default:
            console.warn('Unknown agent type:', agent.type);
            return null;
        }
      })}
    </div>
  );
}