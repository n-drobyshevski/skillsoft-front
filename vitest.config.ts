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
        'src/app/actions/**/*.{ts,tsx}', // Server actions
        'app/**/*.{ts,tsx}',             // App router components
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
    // Order matters (first match wins). The [id] brackets confuse Vite's glob-based
    // resolver, so the app-router subtree is mapped explicitly before the '@' rule.
    // '@' -> ./src then covers everything else, including '@/app/actions' which lives
    // at src/app/actions.ts (production tsconfig maps '@' to ./src).
    alias: [
      {
        find: /^@\/app\/\(workspace\)\/test-templates\/\[id\]\/(.*)/,
        replacement: path.resolve(__dirname, './app/(workspace)/test-templates/[id]/$1'),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // Stub out the Next.js `server-only` guard so client-component tests can run in jsdom
      {
        find: 'server-only',
        replacement: path.resolve(__dirname, './src/__tests__/mocks/server-only.ts'),
      },
    ],
  },
});
