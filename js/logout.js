import { SESSION_USER_KEY } from './config.js';

export const initLogout = () => {
  const logoutButton = document.querySelector('#logout-btn');

  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_USER_KEY);
    window.location.reload();
  });
};
