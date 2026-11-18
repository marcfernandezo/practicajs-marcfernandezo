import { shuffle } from './utils.js';

const FLIP_BACK_DELAY = 800;

const createCard = (pokemon) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.id = pokemon.id;
  return card;
};

export const createBoard = (container, pokemons, onComplete) => {
  const images = new Map(pokemons.map(({ id, image }) => [String(id), image]));
  let firstCard = null;
  let locked = false;
  let matchedPairs = 0;

  // Precargamos las imágenes para que aparezcan al instante al girar la carta
  images.forEach((src) => {
    new Image().src = src;
  });

  const flip = (card) => {
    card.classList.add('flipped');
    card.style.backgroundImage = `url("${images.get(card.dataset.id)}")`;
  };

  const unflip = (card) => {
    card.classList.remove('flipped');
    card.style.backgroundImage = '';
  };

  const handleCardClick = (card) => {
    // Las cartas giradas (incluidas las emparejadas) ya no se pueden tocar
    if (locked || card.classList.contains('flipped')) return;

    flip(card);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    if (firstCard.dataset.id === card.dataset.id) {
      firstCard.classList.add('matched');
      card.classList.add('matched');
      firstCard = null;
      matchedPairs++;

      if (matchedPairs === pokemons.length) onComplete();
      return;
    }

    const previousCard = firstCard;
    firstCard = null;
    locked = true;

    setTimeout(() => {
      unflip(previousCard);
      unflip(card);
      locked = false;
    }, FLIP_BACK_DELAY);
  };

  const cards = shuffle([...pokemons, ...pokemons]).map(createCard);
  cards.forEach((card) => card.addEventListener('click', () => handleCardClick(card)));
  container.replaceChildren(...cards);
};
