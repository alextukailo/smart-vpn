import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',

    globals: false,

    include: [
      'src/**/*.test.ts',
    ],

    clearMocks: true,
    restoreMocks: true,

    coverage: {
      provider: 'v8',

      reporter: [
        'text',
        'html',
      ],

      include: [
        'src/shared/**/*.ts',
        'src/main/adapters/**/*.ts',
        'src/main/lib/**/*.ts',
        'src/main/services/**/*.ts',
        'src/main/repositories/**/*.ts',
        'src/main/ipc/validate-arguments.ts',
        'src/renderer/src/shared/lib/**/*.ts',
        'src/renderer/src/entities/**/lib/**/*.ts',
      ],

      exclude: [
        '**/*.test.ts',
        '**/*.d.ts',
        '**/index.ts',
      ],

      reportsDirectory: './coverage',

      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
