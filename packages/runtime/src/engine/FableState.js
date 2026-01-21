/**
 * State management for FableJS runtime
 * Handles variables, page navigation, and story state
 */

export class FableState {
  constructor(ast) {
    this.ast = ast;
    this.currentPage = 1;
    this.variables = new Map();
    this.pageHistory = [];
  }

  // Variable management
  setVariable(name, value) {
    this.variables.set(name, value);
  }

  getVariable(name) {
    return this.variables.get(name);
  }

  hasVariable(name) {
    return this.variables.has(name);
  }

  // Page navigation
  goToPage(pageId) {
    if (this.pageHistory[this.pageHistory.length - 1] !== this.currentPage) {
      this.pageHistory.push(this.currentPage);
    }
    this.currentPage = pageId;
  }

  goBack() {
    if (this.pageHistory.length > 0) {
      this.currentPage = this.pageHistory.pop();
    }
  }

  getCurrentPage() {
    return this.ast.pages.find(page => page.id === this.currentPage);
  }

  // Reset story state
  reset() {
    this.currentPage = 1;
    this.variables.clear();
    this.pageHistory = [];
  }

  // Get all current state
  getState() {
    return {
      currentPage: this.currentPage,
      variables: Object.fromEntries(this.variables),
      pageHistory: [...this.pageHistory]
    };
  }
}