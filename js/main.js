import { SESSION_USER_KEY } from './config.js';
import { initGame } from './game.js';
import { initRegister } from './register.js';

const handleWin = () => {
  // Se guardará la partida en el ranking en el siguiente paso
};

const showGame = () => initGame(handleWin);

const init = () => {
  if (sessionStorage.getItem(SESSION_USER_KEY)) {
    showGame();
  } else {
    initRegister(showGame);
  }
};

init();
