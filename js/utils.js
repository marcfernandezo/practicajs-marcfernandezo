// Algoritmo de Fisher-Yates: devuelve una copia desordenada del array
export const shuffle = (array) => {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

// Devuelve `count` números distintos entre 1 y `max`
export const getRandomIds = (count, max) => {
  const ids = Array.from({ length: max }, (_, index) => index + 1);
  return shuffle(ids).slice(0, count);
};

export const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};
