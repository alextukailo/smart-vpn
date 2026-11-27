import { mount } from 'cypress/react';

import '../../src/renderer/src/app/styles/index.css';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

export {};
