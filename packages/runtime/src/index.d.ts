import React from 'react';
import type { Fable } from '@fable-js/parser';

export interface FablePlayerProps {
  ast: Fable;
  className?: string;
  style?: React.CSSProperties;
  onStateChange?: (state: {
    currentPage: number;
    variables: Record<string, any>;
    pageHistory: number[];
  }) => void;
}

export declare const FablePlayer: React.FC<FablePlayerProps>;

export { FableState } from './engine/FableState';
export { ExpressionEvaluator } from './engine/ExpressionEvaluator';

// Component types for advanced usage
export type { FableTextProps } from './components/FableText';
export type { FableButtonProps } from './components/FableButton';
export type { FableImageProps } from './components/FableImage';