import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Fable, Statement } from '@fable-js/parser';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';
import { AnimationEngine } from '../engine/AnimationEngine.js';
import Konva from 'konva';

export interface RuntimeState {
  // Story data
  ast: Fable | null;
  currentPage: number;
  pageHistory: number[];

  // Variables - track both DSL-defined and runtime values
  variables: Map<string, any>;
  dslVariables: Set<string>; // Variables defined in DSL

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

// Auto-generated selectors for optimized state access
export const useRuntimeSelectors = () => {
  // Use subscribeWithSelector for optimized re-renders
  const currentPage = useRuntimeStore((state) => state.getCurrentPage());
  const currentPageId = useRuntimeStore((state) => state.currentPage);
  const variables = useRuntimeStore((state) => Object.fromEntries(state.variables));
  const pageHistory = useRuntimeStore((state) => [...state.pageHistory]);
  const storyTitle = useRuntimeStore((state) => state.ast?.title || 'Untitled Story');
  const totalPages = useRuntimeStore((state) => state.ast?.pages.length || 0);
  const isLoaded = useRuntimeStore((state) => state.ast !== null);

  // Actions (stable references)
  const store = useRuntimeStore();

  return {
    // Current page state
    currentPage,
    currentPageId,

    // Variables (shallow compared)
    variables,
    getVariable: store.getVariable,
    hasVariable: store.hasVariable,

    // Navigation
    pageHistory,
    canGoBack: pageHistory.length > 0,

    // Story state
    storyTitle,
    totalPages,
    isLoaded,

    // Actions (stable references)
    setVariable: store.setVariable,
    goToPage: store.goToPage,
    goBack: store.goBack,
    executeStatements: store.executeStatements,
    reset: store.reset,

    // Advanced selectors
    getVariableValue: (name: string) => variables[name],
    hasNonZeroVariable: (name: string) => variables[name] !== undefined && variables[name] !== 0,
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
  evaluator: null,
  animationEngine: null,

  setAst: (ast: Fable, preserveState = true) => {
    console.log('🏪 RuntimeStore Debug - setAst called:', {
      ast,
      preserveState,
      astPages: ast.pages,
      astPageIds: ast.pages.map(p => ({ id: p.id, type: typeof p.id })),
      firstPageId: ast.pages.length > 0 ? ast.pages[0].id : 'no pages'
    });

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
      getVariable: (name: string) => newVariables.get(name) ?? 0,
      hasVariable: (name: string) => newVariables.has(name),
    });

    // Helper to execute init/set statements
    const executeInitStatements = (stmts: any[]) => {
      stmts?.forEach((stmt: any) => {
        if (stmt.type === 'init' || stmt.type === 'set') {
          const value = evaluator.evaluate(stmt.value);
          newVariables.set(stmt.variable, value);
          console.log(`  📝 ${stmt.type === 'init' ? 'Init' : 'Set'} ${stmt.variable} = ${value}`);
        }
      });
    };

    // Execute fable-level init statements first
    if (ast.statements) {
      console.log('📜 setAst: Executing fable-level statements:', ast.statements);
      executeInitStatements(ast.statements);
    }

    // Execute initial page statements (e.g., init roll to random 1..6)
    const firstPage = ast.pages[0];
    if (firstPage?.statements) {
      console.log('📜 setAst: Executing initial page statements:', firstPage.statements);
      executeInitStatements(firstPage.statements);
    }

    set({
      ast,
      currentPage: ast.pages.length > 0 ? ast.pages[0].id : 1,
      pageHistory: [],
      dslVariables,
      variables: newVariables,
      evaluator: new ExpressionEvaluator({
        getVariable: (name: string) => newVariables.get(name) ?? 0,
        hasVariable: (name: string) => newVariables.has(name),
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
          console.log(`📝 Init ${stmt.variable} = ${initValue}`);
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
            animationEngine.moveAgent(stmt.agentId, {
              x: stmt.to[0],
              y: stmt.to[1],
              duration: stmt.duration,
              easing: stmt.easing,
            });
          } else {
            console.warn('AnimationEngine not available for move action');
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
      // Keep AST and evaluator intact for reset functionality
    }));
  },

  setAnimationEngine: (engine: AnimationEngine | null) => {
    set({ animationEngine: engine });
  },

  // Computed properties
  getCurrentPage: () => {
    const { ast, currentPage } = get();
    const foundPage = ast?.pages.find(page => page.id === currentPage);
    console.log('🔍 getCurrentPage Debug:', {
      currentPage,
      currentPageType: typeof currentPage,
      availablePages: ast?.pages.map(p => ({ id: p.id, type: typeof p.id })),
      foundPage: foundPage ? { id: foundPage.id, agentsCount: foundPage.agents?.length || 0 } : null
    });
    return foundPage;
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
    evaluator: null,
    animationEngine: null,
  });
};