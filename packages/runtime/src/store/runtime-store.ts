import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { Fable, Statement } from '@fable-js/parser';
import { ExpressionEvaluator } from '../engine/expression-evaluator.js';
import { AnimationEngine } from '../engine/animation-engine.js';

export interface RuntimeState {
  // Story data
  ast: Fable | null;
  currentPage: number;
  pageHistory: number[];

  // Variables - track both DSL-defined and runtime values
  variables: Map<string, any>;
  dslVariables: Set<string>; // Variables defined in DSL

  // Agent positions - persist positions changed by animations
  positions: Map<string, [number, number]>;

  // Evaluator instance
  evaluator: ExpressionEvaluator | null;

  // Animation engine instance
  animationEngine: AnimationEngine | null;

  // Actions
  setAst: (ast: Fable, preserveState?: boolean) => void;
  goToPage: (pageId: number) => void;
  goBack: () => void;
  setVariable: (name: string, value: any) => void;
  getVariable: (name: string) => any;
  hasVariable: (name: string) => boolean;
  executeStatements: (statements: Statement[]) => void;
  reset: () => void;
  
  // Animation engine management
  setAnimationEngine: (engine: AnimationEngine | null) => void;

  // Computed
  getCurrentPage: () => Fable['pages'][0] | undefined;
  getState: () => {
    currentPage: number;
    variables: Record<string, any>;
    pageHistory: number[];
  };
}

// Individual selectors for optimized re-renders (prefer these over useRuntimeSelectors)
export const useCurrentPage = () => useRuntimeStore((state) => state.getCurrentPage());
export const useCurrentPageId = () => useRuntimeStore((state) => state.currentPage);
export const useStoryTitle = () => useRuntimeStore((state) => state.ast?.title || 'Untitled Story');
export const useTotalPages = () => useRuntimeStore((state) => state.ast?.pages.length || 0);
export const useIsLoaded = () => useRuntimeStore((state) => state.ast !== null);
export const useCanGoBack = () => useRuntimeStore((state) => state.pageHistory.length > 0);

// Selectors that return stable references
export const useVariables = () => useRuntimeStore((state) => state.variables);
export const usePageHistory = () => useRuntimeStore((state) => state.pageHistory);

// Actions hook (stable references, no re-renders on state changes)
export const useRuntimeActions = () => useRuntimeStore(
  useShallow((state) => ({
    setVariable: state.setVariable,
    getVariable: state.getVariable,
    hasVariable: state.hasVariable,
    goToPage: state.goToPage,
    goBack: state.goBack,
    executeStatements: state.executeStatements,
    reset: state.reset,
  }))
);

/**
 * @deprecated Use individual selectors (useCurrentPage, useVariables, etc.) for better performance.
 * This hook creates new objects on every call, which can cause unnecessary re-renders.
 */
export const useRuntimeSelectors = () => {
  const currentPage = useCurrentPage();
  const currentPageId = useCurrentPageId();
  const variables = useVariables();
  const pageHistory = usePageHistory();
  const storyTitle = useStoryTitle();
  const totalPages = useTotalPages();
  const isLoaded = useIsLoaded();
  const canGoBack = useCanGoBack();
  const actions = useRuntimeActions();

  return {
    currentPage,
    currentPageId,
    variables,
    getVariable: actions.getVariable,
    hasVariable: actions.hasVariable,
    pageHistory,
    canGoBack,
    storyTitle,
    totalPages,
    isLoaded,
    setVariable: actions.setVariable,
    goToPage: actions.goToPage,
    goBack: actions.goBack,
    executeStatements: actions.executeStatements,
    reset: actions.reset,
    getVariableValue: (name: string) => variables.get(name),
    hasNonZeroVariable: (name: string) => variables.get(name) !== undefined && variables.get(name) !== 0,
  };
};

export const useRuntimeStore = create<RuntimeState>()(
  subscribeWithSelector((set, get) => ({
  // Initial state
  ast: null,
  currentPage: 1,
  pageHistory: [],
  variables: new Map(),
  dslVariables: new Set(),
  positions: new Map(),
  evaluator: null,
  animationEngine: null,

  setAst: (ast: Fable, preserveState = true) => {
    // Collect all DSL-defined variables (from both init and set statements)
    const dslVariables = new Set<string>();
    
    // Helper to collect variables from statements
    const collectVariables = (stmts: any[]) => {
      stmts?.forEach((stmt: any) => {
        if (stmt.type === 'init' || stmt.type === 'set') {
          dslVariables.add(stmt.variable);
        }
      });
    };
    
    // Collect from fable-level statements
    collectVariables(ast.statements || []);
    
    // Collect from page-level statements and agent events
    ast.pages.forEach(page => {
      collectVariables(page.statements || []);
      page.agents?.forEach((agent: any) => {
        if (agent.events) {
          agent.events.forEach((event: any) => {
            collectVariables(event.statements || []);
          });
        }
      });
    });

    // Start with empty variables for DSL vars, preserve non-DSL vars if requested
    let newVariables = new Map<string, any>();
    
    // Get current state for preserving non-DSL variables
    const currentState = get();
    if (preserveState && currentState.variables) {
      currentState.variables.forEach((value, key) => {
        if (!dslVariables.has(key)) {
          newVariables.set(key, value);
        }
      });
    }

    // Create evaluator for executing initial statements
    const evaluator = new ExpressionEvaluator({
      getVariable: (name: string) => get().variables.get(name) ?? 0,
      hasVariable: (name: string) => get().variables.has(name),
    });

    // Helper to execute init/set statements
    const executeInitStatements = (stmts: any[]) => {
      stmts?.forEach((stmt: any) => {
        if (stmt.type === 'init' || stmt.type === 'set') {
          const value = evaluator.evaluate(stmt.value);
          newVariables.set(stmt.variable, value);
        }
      });
    };

    // Execute fable-level init statements first
    if (ast.statements) {
      executeInitStatements(ast.statements);
    }

    // Execute initial page statements (e.g., init roll to random 1..6)
    const firstPage = ast.pages[0];
    if (firstPage?.statements) {
      executeInitStatements(firstPage.statements);
    }

    set({
      ast,
      currentPage: ast.pages.length > 0 ? ast.pages[0].id : 1,
      pageHistory: [],
      dslVariables,
      variables: newVariables,
      positions: new Map(), // Reset positions when loading new AST
      evaluator: new ExpressionEvaluator({
        getVariable: (name: string) => get().variables.get(name) ?? 0,
        hasVariable: (name: string) => get().variables.has(name),
      }),
    });
  },

  goToPage: (pageId: number) => {
    set((state) => {
      const newPageHistory = state.pageHistory[state.pageHistory.length - 1] !== state.currentPage
        ? [...state.pageHistory, state.currentPage]
        : state.pageHistory;
      return {
        currentPage: pageId,
        pageHistory: newPageHistory
      };
    });
  },

  goBack: () => {
    const { pageHistory } = get();
    if (pageHistory.length > 0) {
      const newPageHistory = [...pageHistory];
      const previousPage = newPageHistory.pop()!;
      set({ currentPage: previousPage, pageHistory: newPageHistory });
    }
  },

  setVariable: (name: string, value: any) => {
    set((state) => ({
      variables: new Map(state.variables).set(name, value)
    }));
  },

  getVariable: (name: string) => {
    return get().variables.get(name);
  },

  hasVariable: (name: string) => {
    return get().variables.has(name);
  },

  executeStatements: (statements: Statement[]) => {
    if (!statements || statements.length === 0) return;

    const { evaluator, animationEngine } = get();
    if (!evaluator) return;

    // Execute statements in a batch
    statements.forEach((stmt: any) => {
      switch (stmt.type) {
        case 'init':
          // Init is like set but semantically for first-time initialization
          // In runtime, we treat it the same as set
          const initValue = evaluator.evaluate(stmt.value);
          get().setVariable(stmt.variable, initValue);
          break;

        case 'set':
          const setValue = evaluator.evaluate(stmt.value);
          get().setVariable(stmt.variable, setValue);
          break;

        case 'add':
          const addAmount = evaluator.evaluate(stmt.amount);
          const currentAdd = get().getVariable(stmt.variable) ?? 0;
          get().setVariable(stmt.variable, currentAdd + addAmount);
          break;

        case 'subtract':
          const subAmount = evaluator.evaluate(stmt.amount);
          const currentSub = get().getVariable(stmt.variable) ?? 0;
          get().setVariable(stmt.variable, currentSub - subAmount);
          break;

        case 'go_to_page':
          get().goToPage(stmt.pageId ?? stmt.target);
          break;

        case 'move':
          // Move action with tweening
          if (animationEngine) {
            // Evaluate position expressions
            const toPos = [
              typeof stmt.to[0] === 'object' ? evaluator?.evaluate(stmt.to[0]) ?? 0 : stmt.to[0],
              typeof stmt.to[1] === 'object' ? evaluator?.evaluate(stmt.to[1]) ?? 0 : stmt.to[1]
            ] as [number, number]
            animationEngine.moveAgent(stmt.agentId, {
              x: toPos[0],
              y: toPos[1],
              duration: stmt.duration,
              easing: stmt.easing,
            });
            // Update persisted position
            get().positions.set(stmt.agentId, toPos);
          } else {
            console.warn('AnimationEngine not available for move action');
          }
          break;

        case 'tween':
          // General tween action for any properties
          if (animationEngine) {
            // Evaluate property values if they are expressions
            const tweenProps: Record<string, any> = {};
            for (const [key, value] of Object.entries(stmt.properties)) {
              if (typeof value === 'object' && value !== null) {
                tweenProps[key] = evaluator?.evaluate(value as any);
              } else {
                tweenProps[key] = value;
              }
            }
            animationEngine.tweenAgent(stmt.agentId, {
              properties: tweenProps,
              duration: stmt.duration,
              easing: stmt.easing,
            });
          } else {
            console.warn('AnimationEngine not available for tween action');
          }
          break;

        case 'stop_animation':
          if (animationEngine) {
            animationEngine.stopAnimation(stmt.agentId);
          }
          break;

        default:
          console.warn('Unknown statement type:', stmt.type);
      }
    });
  },

  reset: () => {
    // Stop all animations on reset
    const { animationEngine } = get();
    if (animationEngine) {
      animationEngine.stopAll();
    }

    set((state) => ({
      currentPage: 1,
      pageHistory: [],
      variables: new Map(),
      dslVariables: new Set(),
      positions: new Map(),
      // Keep AST and evaluator intact for reset functionality
    }));
  },

  setAnimationEngine: (engine: AnimationEngine | null) => {
    set({ animationEngine: engine });
  },

  // Computed properties
  getCurrentPage: () => {
    const { ast, currentPage } = get();
    return ast?.pages.find(page => page.id === currentPage);
  },

  getState: () => {
    const { currentPage, variables, pageHistory } = get();
    return {
      currentPage,
      variables: Object.fromEntries(variables),
      pageHistory: [...pageHistory],
    };
  },
}))
);

// Reset state utility (from Zustand docs: how-to-reset-state)
export const resetRuntimeStore = () => {
  const state = useRuntimeStore.getState();
  if (state.animationEngine) {
    state.animationEngine.stopAll();
  }
  
  useRuntimeStore.setState({
    ast: null,
    currentPage: 1,
    pageHistory: [],
    variables: new Map(),
    dslVariables: new Set(),
    positions: new Map(),
    evaluator: null,
    animationEngine: null,
  });
};