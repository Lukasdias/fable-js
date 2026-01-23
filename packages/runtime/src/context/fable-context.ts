import { createContext, useContext } from 'react';
import Konva from 'konva';

/**
 * Context for sharing runtime state across Fable components.
 * This enables features like:
 * - Canvas scaling (scale factor for responsive rendering)
 * - Agent ref management (for tweening/animations)
 * - Animation control
 */
export interface FableContextValue {
  /** Current scale factor applied to the canvas */
  scale: number;
  /** Design width - the coordinate system used in DSL */
  designWidth: number;
  /** Design height - the coordinate system used in DSL */
  designHeight: number;
  /** Register an agent's Konva node ref for animations/tweening */
  registerAgent: (id: string, ref: Konva.Node | null) => void;
  /** Get an agent's Konva node ref by ID */
  getAgentRef: (id: string) => Konva.Node | null;
  /** Asset mappings for resolving asset paths to URLs */
  assets: Record<string, { url: string; type: string }>;
}

export const FableRuntimeContext = createContext<FableContextValue>({
  scale: 1,
  designWidth: 640,
  designHeight: 360,
  registerAgent: () => {},
  getAgentRef: () => null,
  assets: {},
});

export const useFableContext = () => useContext(FableRuntimeContext);
