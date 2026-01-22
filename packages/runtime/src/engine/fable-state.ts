/**
 * State management for FableJS runtime
 * Handles variables, page navigation, and story state
 */

import type { Fable } from '@fable-js/parser';

export class FableState {
  private ast: Fable;
  private currentPage: number;
  private variables: Map<string, any>;
  private pageHistory: number[];

  constructor(ast: Fable) {
    this.ast = ast;
    this.currentPage = 1;
    this.variables = new Map();
    this.pageHistory = [];
  }

  // Variable management
  setVariable(name: string, value: any): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): any {
    return this.variables.get(name);
  }

  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }

  // Page navigation
  goToPage(pageId: number): void {
    if (this.pageHistory[this.pageHistory.length - 1] !== this.currentPage) {
      this.pageHistory.push(this.currentPage);
    }
    this.currentPage = pageId;
  }

  goBack(): void {
    if (this.pageHistory.length > 0) {
      this.currentPage = this.pageHistory.pop()!;
    }
  }

  getCurrentPage(): Fable['pages'][0] | undefined {
    return this.ast.pages.find(page => page.id === this.currentPage);
  }

  // Reset story state
  reset(): void {
    this.currentPage = 1;
    this.variables.clear();
    this.pageHistory = [];
  }

  // Get all current state
  getState(): {
    currentPage: number;
    variables: Record<string, any>;
    pageHistory: number[];
  } {
    return {
      currentPage: this.currentPage,
      variables: Object.fromEntries(this.variables),
      pageHistory: [...this.pageHistory]
    };
  }
}