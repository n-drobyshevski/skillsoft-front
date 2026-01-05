/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/__tests__/setup.ts'],

    // Global test utilities
    globals: true,

    // Include patterns - tests in __tests__ folders
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],

    // Exclude patterns
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'src/__tests__/setup.ts',
      'src/__tests__/mocks/**',
      'src/__tests__/utils/**',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/hooks/**/*.{ts,tsx}',
        'src/services/**/*.ts',
        'src/lib/**/*.ts',
        'src/store/**/*.ts',
        'src/components/**/*.tsx',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/__tests__/**',
        'src/components/ui/**', // shadcn components - external
      ],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter
    reporters: ['verbose'],

    // Mock reset
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './app'),
    },
  },
});
