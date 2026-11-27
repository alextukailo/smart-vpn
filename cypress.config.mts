import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,

  viewportWidth: 1280,
  viewportHeight: 800,

  screenshotOnRunFailure: true,

  defaultCommandTimeout: 4000,

  retries: {
    runMode: 0,
    openMode: 0,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },

    specPattern: 'cypress/component/**/*.cy.tsx',

    supportFile: 'cypress/support/component.ts',

    indexHtmlFile: 'cypress/support/component-index.html',
  },

  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.ts',

    supportFile: false,
  },
});
