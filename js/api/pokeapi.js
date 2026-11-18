import { MAX_POKEMON, POKEAPI_URL } from '../config.js';
import { getRandomIds } from '../utils.js';

const getPokemon = async (id) => {
  const response = await fetch(`${POKEAPI_URL}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`Error ${response.status} al conectar con PokeAPI`);
  }

  const { name, sprites } = await response.json();

  return {
    id,
    name,
    image: sprites.other['official-artwork'].front_default ?? sprites.front_default,
  };
};

export const getRandomPokemons = (count) => {
  const ids = getRandomIds(count, MAX_POKEMON);
  return Promise.all(ids.map(getPokemon));
};
