import { SESSION_USER_KEY } from './config.js';
import { initGame } from './game.js';
import { addGameToRanking, renderRanking } from './ranking.js';
import { initRegister } from './register.js';

const showGame = () => {
  initGame(addGameToRanking);
  renderRanking();
};

const init = () => {
  if (sessionStorage.getItem(SESSION_USER_KEY)) {
    showGame();
  } else {
    initRegister(showGame);
  }
};

init();
