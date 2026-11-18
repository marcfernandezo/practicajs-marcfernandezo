import { createUser, findUserByEmail, updateUser } from './api/firebase.js';
import { SESSION_USER_KEY } from './config.js';

const saveUser = async (username, email) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    await updateUser(existingUser.id, { username });
    return existingUser.id;
  }

  return createUser({ username, email });
};

export const initRegister = (onRegistered) => {
  const form = document.querySelector('#user-form');
  const errorMessage = document.querySelector('#user-error');
  const submitButton = form.querySelector('button[type="submit"]');

  form.hidden = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim().toLowerCase();

    if (!username || !email) {
      errorMessage.textContent = 'Rellena todos los campos';
      return;
    }

    errorMessage.textContent = '';
    submitButton.disabled = true;

    try {
      const userId = await saveUser(username, email);
      sessionStorage.setItem(SESSION_USER_KEY, userId);
      form.hidden = true;
      onRegistered();
    } catch (error) {
      errorMessage.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });
};
