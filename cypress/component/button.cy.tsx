
import { Button } from '@renderer/shared/ui/button';

describe('Button', () => {
  it('renders button content', () => {
    cy.mount(
      <Button>Connect VPN</Button>,
    );

    cy.contains('button', 'Connect VPN')
      .should('be.visible');
  });

  it('handles click events', () => {
    const onClick = cy.stub().as('onClick');

    cy.mount(
      <Button onClick={onClick}>
        Connect VPN
      </Button>,
    );

    cy.contains('button', 'Connect VPN').click();

    cy.get('@onClick')
      .should('have.been.calledOnce');
  });

  it('supports a disabled state', () => {
    cy.mount(
      <Button disabled>
        Connect VPN
      </Button>,
    );

    cy.contains('button', 'Connect VPN')
      .should('be.disabled');
  });

  it('uses the native button type by default', () => {
    cy.mount(
      <Button>Connect VPN</Button>,
    );

    cy.get('button')
      .should('have.attr', 'type', 'button');
  });

  it('supports the secondary variant', () => {
    cy.mount(
      <Button variant="secondary">
        Disconnect VPN
      </Button>,
    );

    cy.get('button')
      .should('have.css', 'background-color', 'rgb(9, 39, 71)');
  });

  it('supports the primary variant', () => {
    cy.mount(
      <Button>Connect VPN</Button>,
    );

    cy.get('button')
      .should('have.css', 'background-color', 'rgb(255, 212, 67)');
  });
});
