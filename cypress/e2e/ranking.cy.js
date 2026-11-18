const USERS = {
  'user-1': { username: 'ash', email: 'ash@pokemon.com' },
  'user-2': { username: 'misty', email: 'misty@pokemon.com' },
};

// 6 partidas guardadas, ya desordenadas a propósito
const GAMES = {
  g1: { userId: 'user-2', time: 50, cards: 8 },
  g2: { userId: 'user-2', time: 90, cards: 20 },
  g3: { userId: 'user-1', time: 20, cards: 8 },
  g4: { userId: 'user-2', time: 15, cards: 12 },
  g5: { userId: 'user-1', time: 60, cards: 6 },
  g6: { userId: 'user-1', time: 30, cards: 6 },
};

const rowTexts = () =>
  cy.get('#ranking tbody tr').then(($rows) => [...$rows].map((row) => row.innerText.replace(/\s+/g, ' ').trim()));

describe('Ranking', () => {
  it('muestra un mensaje si no hay partidas', () => {
    cy.mockBackend({ users: USERS });
    cy.visitAsUser('user-1');
    cy.get('#ranking').should('be.visible').and('contain.text', 'Todavía no hay partidas');
  });

  it('tiene las columnas Posición, Username, Mail, Tiempo y Cartas', () => {
    cy.mockBackend({ users: USERS });
    cy.visitAsUser('user-1');
    ['Posición', 'Username', 'Mail', 'Tiempo', 'Cartas'].forEach((column) => {
      cy.get('#ranking thead').should('contain.text', column);
    });
  });

  it('ordena por cartas (desc) y tiempo (asc) y muestra 4 + "..." si hay más de 5', () => {
    cy.mockBackend({ users: USERS, games: GAMES });
    cy.visitAsUser('user-1');

    rowTexts().should('deep.equal', [
      '1 misty misty@pokemon.com 1m 30s 20',
      '2 misty misty@pokemon.com 0m 15s 12',
      '3 ash ash@pokemon.com 0m 20s 8',
      '4 misty misty@pokemon.com 0m 50s 8',
      '...',
    ]);
    cy.get('#ranking .highlight').should('not.exist');
  });

  it('guarda la partida ganada en Firebase y la resalta', () => {
    cy.mockBackend({ users: USERS });
    cy.visitAsUser('user-1');
    cy.clock();
    cy.startGame(4);
    cy.tick(7000);
    cy.solveBoard();

    cy.wait('@createGame').its('request.body').should('deep.equal', { userId: 'user-1', time: 7, cards: 4 });
    cy.get('#ranking tr.highlight')
      .should('have.length', 1)
      .and('contain.text', 'ash@pokemon.com')
      .and('contain.text', '0m 7s')
      .and('have.css', 'background-color', 'rgb(255, 255, 0)');
  });

  it('si la partida nueva queda fuera del top 5 muestra "..." + partida + "..."', () => {
    cy.mockBackend({ users: USERS, games: { ...GAMES, g7: { userId: 'user-2', time: 99, cards: 2 } } });
    cy.visitAsUser('user-1');
    cy.clock();
    cy.startGame(4);
    cy.tick(5000);
    cy.solveBoard();

    cy.get('#ranking tr.highlight').should('exist');
    rowTexts().should('deep.equal', [
      '1 misty misty@pokemon.com 1m 30s 20',
      '2 misty misty@pokemon.com 0m 15s 12',
      '3 ash ash@pokemon.com 0m 20s 8',
      '4 misty misty@pokemon.com 0m 50s 8',
      '...',
      '7 ash ash@pokemon.com 0m 5s 4',
      '...',
    ]);
  });
});
