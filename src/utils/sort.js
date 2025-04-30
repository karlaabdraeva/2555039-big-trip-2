import dayjs from 'dayjs';
import { getEventDuration } from './date';

export function sortByDate(eventA, eventB) {
  return dayjs(eventA.dateFrom).diff(dayjs(eventB.dateFrom));
}

export function sortByTime(eventA, eventB) {
  const eventADuration = getEventDuration(eventA);
  const eventBDuration = getEventDuration(eventB);

  return eventBDuration - eventADuration;
}

export function sortByPrice(eventB, eventA) {
  return eventA.basePrice - eventB.basePrice;
}
