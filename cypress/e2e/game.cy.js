describe('Juego', () => {
  beforeEach(() => {
    cy.mockBackend({ users: { 'user-1': { username: 'ash', email: 'ash@pokemon.com' } } });
    cy.visitAsUser('user-1');
  });

  it('muestra el formulario de partida y el timer', () => {
    cy.get('#game-form').should('be.visible');
    cy.get('#cards-number').should('be.visible');
    cy.get('#play-btn').should('be.visible');
    cy.get('#game-board').should('not.be.visible');
  });

  ['', 'abc', '7', '-4', '2.5', '0'].forEach((value) => {
    it(`muestra un error en el modal con "${value}"`, () => {
      if (value) cy.get('#cards-number').type(value);
      cy.get('#play-btn').click();
      cy.get('#modal').should('be.visible').and('have.attr', 'open');
      cy.get('#game-board .card').should('not.exist');
    });
  });

  it('empieza la partida con un número par y cambia el texto del botón', () => {
    cy.startGame(8);
    cy.get('#play-btn').should('contain.text', 'Volver a jugar');
    cy.get('#game-board').should('be.visible');
    cy.get('#timer').invoke('text').should('match', /^\d+m \d+s$/);

    // Cada pokémon aparece exactamente 2 veces
    cy.get('#game-board .card').then(($cards) => {
      const counts = {};
      [...$cards].forEach((card) => {
        counts[card.dataset.id] = (counts[card.dataset.id] ?? 0) + 1;
      });
      expect(Object.keys(counts)).to.have.length(4);
      Object.values(counts).forEach((count) => expect(count).to.equal(2));
    });
  });

  it('gira la carta con la clase "flipped" y muestra la imagen con background-image', () => {
    cy.startGame(4);
    cy.get('#game-board .card').first().click()
      .should('have.class', 'flipped')
      .and('have.css', 'background-image')
      .and('include', 'favicon.svg');
  });

  it('vuelve a tapar dos cartas distintas y no gira una tercera mientras tanto', () => {
    cy.startGame(6);
    cy.get('#game-board .card').then(($cards) => {
      const cards = [...$cards];
      const first = cards[0];
      const second = cards.find((card) => card.dataset.id !== first.dataset.id);
      const third = cards.find((card) => card !== first && card !== second);

      cy.wrap(first).click();
      cy.wrap(second).click();
      cy.wrap(third).click();

      cy.wrap(first).should('have.class', 'flipped');
      cy.wrap(second).should('have.class', 'flipped');
      cy.wrap(third).should('not.have.class', 'flipped');

      cy.wrap(first).should('not.have.class', 'flipped');
      cy.wrap(second).should('not.have.class', 'flipped');
    });
  });

  it('marca las parejas con la clase "matched" y fondo verde', () => {
    cy.startGame(4);
    cy.get('#game-board .card').first().invoke('attr', 'data-id').then((id) => {
      cy.get(`#game-board .card[data-id="${id}"]`).each(($card) => cy.wrap($card).click());
      cy.get(`#game-board .card[data-id="${id}"]`)
        .should('have.class', 'matched')
        .and('have.css', 'background-color', 'rgb(0, 128, 0)');
    });
  });

  it('el timer cuenta minutos y segundos y se para al ganar', () => {
    cy.clock();
    cy.startGame(4);
    cy.tick(3000);
    cy.get('#timer').should('have.text', '0m 3s');
    cy.tick(62000);
    cy.get('#timer').should('have.text', '1m 5s');

    cy.solveBoard();
    cy.get('#game-board .card.matched').should('have.length', 4);
    cy.tick(5000);
    cy.get('#timer').should('have.text', '1m 5s');
  });

  it('al pulsar 3 veces "Volver a jugar" solo queda una partida y el timer funciona', () => {
    cy.clock();
    cy.startGame(4);
    cy.tick(4000);

    cy.get('#cards-number').clear().type('6');
    cy.get('#play-btn').click().click().click();
    cy.get('#timer').should('have.text', '0m 0s');
    cy.get('#game-board .card').should('have.length', 6);

    cy.tick(2000);
    cy.get('#timer').should('have.text', '0m 2s');
    cy.tick(1000);
    cy.get('#timer').should('have.text', '0m 3s');
  });
});
