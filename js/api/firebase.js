import { FIREBASE_URL } from '../config.js';

const request = async (path, method = 'GET', body) => {
  const options = { method, headers: { 'Content-Type': 'application/json' } };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${FIREBASE_URL}/${path}.json`, options);

  if (!response.ok) {
    throw new Error(`Error ${response.status} al conectar con Firebase`);
  }

  return response.json();
};

// Firebase devuelve { id1: {...}, id2: {...} } o null: lo pasamos a array
const toArray = (data) => Object.entries(data ?? {}).map(([id, value]) => ({ id, ...value }));

export const getUsers = async () => toArray(await request('users'));

export const findUserByEmail = async (email) => {
  const users = await getUsers();
  return users.find((user) => user.email === email);
};

export const createUser = async (user) => {
  const { name } = await request('users', 'POST', user);
  return name;
};

export const updateUser = (id, data) => request(`users/${id}`, 'PATCH', data);

export const getGames = async () => toArray(await request('games'));

export const createGame = async (game) => {
  const { name } = await request('games', 'POST', game);
  return name;
};
