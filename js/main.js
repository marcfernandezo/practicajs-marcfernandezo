import { SESSION_USER_KEY } from './config.js';
import { initRegister } from './register.js';

const showGame = () => {
  // Se implementará en feature/game
};

const init = () => {
  if (sessionStorage.getItem(SESSION_USER_KEY)) {
    showGame();
  } else {
    initRegister(showGame);
  }
};

init();
