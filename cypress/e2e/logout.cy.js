describe('Logout', () => {
  it('borra el usuario de sessionStorage y vuelve al registro', () => {
    cy.mockBackend({ users: { 'user-1': { username: 'ash', email: 'ash@pokemon.com' } } });
    cy.visitAsUser('user-1');

    cy.get('#logout-btn').should('be.visible').click();

    cy.window().its('sessionStorage').invoke('getItem', 'user').should('be.null');
    cy.get('#user-form').should('be.visible');
    cy.get('#game').should('not.be.visible');
  });
});
