import dayjs from 'dayjs';

export function getRandomArrayElement (items) {
  return items [Math.floor(Math.random() * items.length)];
}

export function humanizeEventDate(date, format) {
  return (date) ? dayjs(date).format(format) : '';
}

export function getTimeGap(dateFrom, dateTo) {
  const durationInMinutes = dayjs(dateTo).diff(dateFrom, 'minute');

  if (durationInMinutes < 60) {
    return `${durationInMinutes}M`;
  }

  const durationInHours = dayjs(dateTo).diff(dateFrom, 'hour');

  if (durationInHours < 24) {
    const durationMinute = durationInMinutes % 60;
    return `${durationInHours}H ${durationMinute}M`;
  }

  const durationInDays = dayjs(dateTo).diff(dateFrom, 'day');
  const hours = durationInHours % 24;
  const minutes = durationInMinutes % 60;

  return `${durationInDays}D ${hours}H ${minutes}M`;
}

export function createUpperCase(word) {
  return (`${word[0].toUpperCase()}${word.slice(1)}`);
}
