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
      ],

      exclude: [
        '**/*.test.ts',
        '**/*.d.ts',
        '**/index.ts',
      ],

      reportsDirectory: './coverage',
    },
  },
});
