import type { Fable } from '@fable-js/parser';
import React from 'react';

export interface FablePlayerProps {
  ast: Fable;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  assets?: Record<string, { url: string; type: string }>;
  onStateChange?: (state: {
    currentPage: number;
    variables: Record<string, any>;
    pageHistory: number[];
  }) => void;
}

export declare const FablePlayer: React.FC<FablePlayerProps>;

// Zustand store and selectors
export { useRuntimeActions, useRuntimeSelectors, useRuntimeStore } from './store/runtime-store';

// Engine classes (for advanced use cases)
export { ExpressionEvaluator } from './engine/expression-evaluator';

// Component types for advanced usage
export type { FableButtonProps } from './components/fable-button';
export type { FableImageProps } from './components/fable-image';
export type { FableTextProps } from './components/fable-text';
