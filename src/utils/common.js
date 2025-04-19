export function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function createUpperCase(word) {
  return (`${word[0].toUpperCase()}${word.slice(1)}`);
}
