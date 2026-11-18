import { getRandomPokemons } from './api/pokeapi.js';
import { createBoard } from './board.js';
import { MAX_POKEMON } from './config.js';
import { showModal } from './modal.js';
import { createTimer } from './timer.js';
import { formatTime } from './utils.js';

const MAX_CARDS = MAX_POKEMON * 2;

const isValidCardsNumber = (value) => {
  if (!/^\d+$/.test(value)) return false;

  const number = Number(value);
  return number > 0 && number % 2 === 0 && number <= MAX_CARDS;
};

export const initGame = (onWin) => {
  const gameSection = document.querySelector('#game');
  const form = document.querySelector('#game-form');
  const input = document.querySelector('#cards-number');
  const playButton = document.querySelector('#play-btn');
  const board = document.querySelector('#game-board');
  const message = document.querySelector('#game-message');
  const timer = createTimer(document.querySelector('#timer'));

  // Sirve para ignorar respuestas de partidas antiguas si se pulsa "Volver a jugar" mientras carga
  let currentGameId = 0;

  const startGame = async (cardsNumber) => {
    const gameId = ++currentGameId;

    timer.stop();
    board.replaceChildren();
    playButton.textContent = 'Volver a jugar';
    message.textContent = 'Cargando pokémons...';

    try {
      const pokemons = await getRandomPokemons(cardsNumber / 2);
      if (gameId !== currentGameId) return;

      message.textContent = '';
      board.hidden = false;

      createBoard(board, pokemons, () => {
        const time = timer.stop();
        message.textContent = `¡Enhorabuena! Has completado la partida en ${formatTime(time)}`;
        onWin({ time, cards: cardsNumber });
      });

      timer.start();
    } catch (error) {
      if (gameId !== currentGameId) return;
      message.textContent = '';
      showModal(`No se han podido cargar los pokémons. ${error.message}`);
    }
  };

  gameSection.hidden = false;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const value = input.value.trim();

    if (!isValidCardsNumber(value)) {
      showModal(`El número de cartas debe ser un entero, positivo y par (máximo ${MAX_CARDS}).`);
      return;
    }

    startGame(Number(value));
  });
};
