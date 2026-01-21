import { create } from 'zustand';
import type { Fable, Statement } from '@fable-js/parser';
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js';

export interface RuntimeState {
  // Story data
  ast: Fable | null;
  currentPage: number;
  pageHistory: number[];

  // Variables
  variables: Map<string, any>;

  // Evaluator instance
  evaluator: ExpressionEvaluator | null;

  // Actions
  setAst: (ast: Fable) => void;
  goToPage: (pageId: number) => void;
  goBack: () => void;
  setVariable: (name: string, value: any) => void;
  getVariable: (name: string) => any;
  hasVariable: (name: string) => boolean;
  executeStatements: (statements: Statement[]) => void;
  reset: () => void;

  // Computed
  getCurrentPage: () => Fable['pages'][0] | undefined;
  getState: () => {
    currentPage: number;
    variables: Record<string, any>;
    pageHistory: number[];
  };
}

export const useRuntimeStore = create<RuntimeState>((set, get) => ({
  // Initial state
  ast: null,
  currentPage: 1,
  pageHistory: [],
  variables: new Map(),
  evaluator: null,

  // Actions
  setAst: (ast: Fable) => {
    set({
      ast,
      currentPage: 1,
      pageHistory: [],
      variables: new Map(),
      evaluator: new ExpressionEvaluator({
        getVariable: (name: string) => get().variables.get(name),
        hasVariable: (name: string) => get().variables.has(name),
      }),
    });
  },

  goToPage: (pageId: number) => {
    const { pageHistory, currentPage } = get();
    if (pageHistory[pageHistory.length - 1] !== currentPage) {
      set({ pageHistory: [...pageHistory, currentPage] });
    }
    set({ currentPage: pageId });
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
    const { variables } = get();
    const newVariables = new Map(variables);
    newVariables.set(name, value);
    set({ variables: newVariables });
  },

  getVariable: (name: string) => {
    return get().variables.get(name);
  },

  hasVariable: (name: string) => {
    return get().variables.has(name);
  },

  executeStatements: (statements: Statement[]) => {
    if (!statements || statements.length === 0) return;

    const { evaluator } = get();
    if (!evaluator) return;

    // Execute statements in a batch
    statements.forEach((stmt: any) => {
      switch (stmt.type) {
        case 'set':
          const value = evaluator.evaluate(stmt.value);
          get().setVariable(stmt.variable, value);
          break;

        case 'go_to_page':
          get().goToPage(stmt.pageId);
          break;

        default:
          console.warn('Unknown statement type:', stmt.type);
      }
    });
  },

  reset: () => {
    set({
      currentPage: 1,
      pageHistory: [],
      variables: new Map(),
    });
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
}));