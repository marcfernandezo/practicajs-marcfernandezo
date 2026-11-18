import { createGame, getGames, getUsers } from './api/firebase.js';
import { SESSION_USER_KEY } from './config.js';
import { formatTime } from './utils.js';

const MAX_VISIBLE_GAMES = 5;
const TOP_GAMES = 4;
const ELLIPSIS = null;

const tableBody = document.querySelector('#ranking tbody');
const message = document.querySelector('#ranking-message');

// Primero más cartas y, si empatan, menos tiempo
const sortGames = (games) => [...games].sort((a, b) => b.cards - a.cards || a.time - b.time);

// Decide qué filas se ven: las 4 primeras + "..." y, si la nueva partida queda fuera, "..." + partida + "..."
const getVisibleRows = (games, highlightId) => {
  const toRow = (game) => ({ game, position: games.indexOf(game) + 1 });

  if (games.length <= MAX_VISIBLE_GAMES) return games.map(toRow);

  const rows = games.slice(0, TOP_GAMES).map(toRow);
  const highlightIndex = games.findIndex((game) => game.id === highlightId);

  if (highlightIndex < TOP_GAMES) return [...rows, ELLIPSIS];

  if (highlightIndex > TOP_GAMES) rows.push(ELLIPSIS);
  rows.push(toRow(games[highlightIndex]));
  if (highlightIndex < games.length - 1) rows.push(ELLIPSIS);

  return rows;
};

const createCell = (text) => {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
};

const createGameRow = ({ game, position }, highlightId) => {
  const row = document.createElement('tr');

  if (game.id === highlightId) row.classList.add('highlight');

  row.append(
    createCell(position),
    createCell(game.user?.username ?? '—'),
    createCell(game.user?.email ?? '—'),
    createCell(formatTime(game.time)),
    createCell(game.cards),
  );

  return row;
};

const createEllipsisRow = () => {
  const row = document.createElement('tr');
  const cell = createCell('...');
  row.classList.add('ellipsis');
  cell.colSpan = 5;
  row.append(cell);
  return row;
};

export const renderRanking = async (highlightId) => {
  try {
    const [games, users] = await Promise.all([getGames(), getUsers()]);
    const usersById = new Map(users.map((user) => [user.id, user]));
    const sortedGames = sortGames(games).map((game) => ({ ...game, user: usersById.get(game.userId) }));

    message.textContent = sortedGames.length ? '' : 'Todavía no hay partidas';

    const rows = getVisibleRows(sortedGames, highlightId).map((row) =>
      row === ELLIPSIS ? createEllipsisRow() : createGameRow(row, highlightId),
    );
    tableBody.replaceChildren(...rows);
  } catch (error) {
    message.textContent = `No se ha podido cargar el ranking. ${error.message}`;
  }
};

export const addGameToRanking = async ({ time, cards }) => {
  const userId = sessionStorage.getItem(SESSION_USER_KEY);

  try {
    const gameId = await createGame({ userId, time, cards });
    await renderRanking(gameId);
  } catch (error) {
    message.textContent = `No se ha podido guardar la partida. ${error.message}`;
  }
};
