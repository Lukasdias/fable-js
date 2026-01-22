import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: [],
  },
  // Mock canvas module for Konva
  define: {
    global: 'globalThis',
  },
});