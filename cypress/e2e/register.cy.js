describe('Registro', () => {
  beforeEach(() => {
    cy.mockBackend({
      users: { 'user-existing': { username: 'old-name', email: 'ash@pokemon.com' } },
    });
  });

  it('muestra solo el formulario de registro si no hay usuario en sessionStorage', () => {
    cy.visit('/');
    cy.get('#user-form').should('be.visible');
    cy.get('#username').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#game').should('not.be.visible');
  });

  it('crea un usuario nuevo y guarda su id en sessionStorage', () => {
    cy.visit('/');
    cy.get('#username').type('misty');
    cy.get('#email').type('misty@pokemon.com');
    cy.get('#user-form').submit();

    cy.wait('@createUser').its('request.body').should('deep.equal', {
      username: 'misty',
      email: 'misty@pokemon.com',
    });

    cy.window().its('sessionStorage').invoke('getItem', 'user').should('equal', 'user-1');
    cy.get('#user-form').should('not.be.visible');
    cy.get('#game').should('be.visible');
  });

  it('sobreescribe el username si el email ya existe', () => {
    cy.visit('/');
    cy.get('#username').type('ash');
    cy.get('#email').type('ash@pokemon.com');
    cy.get('#user-form').submit();

    cy.wait('@updateUser').its('request.body').should('deep.equal', { username: 'ash' });
    cy.get('@createUser.all').should('have.length', 0);

    cy.window().its('sessionStorage').invoke('getItem', 'user').should('equal', 'user-existing');
    cy.get('#game').should('be.visible');
  });

  it('muestra el juego directamente si ya hay usuario en sessionStorage', () => {
    cy.visitAsUser('user-existing');
    cy.get('#user-form').should('not.be.visible');
    cy.get('#game').should('be.visible');
  });
});
