// Backend falso: los tests no escriben en la base de datos real de Firebase
// ni dependen de que PokeAPI esté disponible.

const FIREBASE = 'https://practica-663f0-default-rtdb.europe-west1.firebasedatabase.app';

Cypress.Commands.add('mockBackend', ({ users = {}, games = {} } = {}) => {
  const db = { users: { ...users }, games: { ...games } };
  let nextId = 1;

  cy.wrap(db).as('db');

  // Igual que Firebase: una colección vacía se devuelve como `null`
  const replyCollection = (req, collection) => req.reply({
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(Object.keys(collection).length ? collection : null),
  });

  cy.intercept('GET', `${FIREBASE}/users.json`, (req) => replyCollection(req, db.users)).as('getUsers');
  cy.intercept('GET', `${FIREBASE}/games.json`, (req) => replyCollection(req, db.games)).as('getGames');

  cy.intercept('POST', `${FIREBASE}/users.json`, (req) => {
    const id = `user-${nextId++}`;
    db.users[id] = req.body;
    req.reply({ name: id });
  }).as('createUser');

  cy.intercept('PATCH', `${FIREBASE}/users/*.json`, (req) => {
    const id = req.url.split('/users/')[1].replace('.json', '');
    db.users[id] = { ...db.users[id], ...req.body };
    req.reply(req.body);
  }).as('updateUser');

  cy.intercept('POST', `${FIREBASE}/games.json`, (req) => {
    const id = `game-${nextId++}`;
    db.games[id] = req.body;
    req.reply({ name: id });
  }).as('createGame');

  cy.intercept('GET', 'https://pokeapi.co/api/v2/pokemon/*', (req) => {
    const id = Number(req.url.split('/').pop());
    const image = `/favicon.svg?pokemon=${id}`;
    req.reply({
      name: `pokemon-${id}`,
      sprites: { front_default: image, other: { 'official-artwork': { front_default: image } } },
    });
  }).as('getPokemon');
});

// Abre la app con un usuario ya registrado en sessionStorage
Cypress.Commands.add('visitAsUser', (userId = 'user-1') => {
  cy.visit('/', {
    onBeforeLoad: (win) => win.sessionStorage.setItem('user', userId),
  });
});

Cypress.Commands.add('startGame', (cardsNumber) => {
  cy.get('#cards-number').clear().type(String(cardsNumber));
  cy.get('#play-btn').click();
  cy.get('#game-board .card').should('have.length', cardsNumber);
});

// Gira todas las parejas del tablero, una tras otra
Cypress.Commands.add('solveBoard', () => {
  cy.get('#game-board .card').then(($cards) => {
    const ids = [...new Set([...$cards].map((card) => card.dataset.id))];

    ids.forEach((id) => {
      cy.get(`#game-board .card[data-id="${id}"]`).each(($card) => cy.wrap($card).click());
    });
  });
});
