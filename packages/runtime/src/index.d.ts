import React from 'react';
import type { Fable } from '@fable-js/parser';

export interface FablePlayerProps {
  ast: Fable;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onStateChange?: (state: {
    currentPage: number;
    variables: Record<string, any>;
    pageHistory: number[];
  }) => void;
}

export declare const FablePlayer: React.FC<FablePlayerProps>;

// Zustand store and selectors
export { useRuntimeStore, useRuntimeSelectors, useRuntimeActions } from './store/RuntimeStore';

// Engine classes (for advanced use cases)
export { ExpressionEvaluator } from './engine/ExpressionEvaluator';

// Component types for advanced usage
export type { FableTextProps } from './components/FableText';
export type { FableButtonProps } from './components/FableButton';
export type { FableImageProps } from './components/FableImage';