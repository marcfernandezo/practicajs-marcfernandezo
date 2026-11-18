import { formatTime } from './utils.js';

export const createTimer = (element) => {
  let intervalId = null;
  let startTime = 0;
  let seconds = 0;

  // Calculamos con Date.now() para que el tiempo no se desvíe aunque el intervalo se retrase
  const update = () => {
    seconds = Math.floor((Date.now() - startTime) / 1000);
    element.textContent = formatTime(seconds);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      update();
    }
    return seconds;
  };

  const start = () => {
    stop();
    startTime = Date.now();
    update();
    intervalId = setInterval(update, 250);
  };

  return { start, stop };
};
