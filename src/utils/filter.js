import { FilterType, DATE_NOW, NoEventsMessage } from '../const.js';
import dayjs from 'dayjs';

export const filterEvents = {
  [FilterType.EVERYTHING]: (events) => events,
  [FilterType.FUTURE]: (events) => events.filter(({ dateFrom }) => Date.parse(dateFrom) > Date.parse(DATE_NOW)),
  [FilterType.PRESENT]: (events) => events.filter(({ dateFrom, dateTo }) =>
    Date.parse(dateFrom) <= Date.parse(DATE_NOW) && Date.parse(dateTo) >= Date.parse(DATE_NOW)),
  [FilterType.PAST]: (events) => events.filter(({ dateTo }) => Date.parse(dateTo) < Date.parse(DATE_NOW)),
};

export function filterEventPoints(points) {
  const now = dayjs();

  const filteredPoints = {
    [FilterType.EVERYTHING]: points,
    [FilterType.FUTURE]: points.filter((point) => dayjs(point.dateFrom).isAfter(now)),
    [FilterType.PRESENT]: points.filter((point) =>
      dayjs(point.dateFrom).isBefore(now) && dayjs(point.dateTo).isAfter(now)
    ),
    [FilterType.PAST]: points.filter((point) => dayjs(point.dateTo).isBefore(now))
  };

  return Object.entries(filteredPoints).map(([type, filtered]) => ({
    type,
    count: filtered.length,
    placeholder: filtered.length === 0 ? NoEventsMessage[type] : null,
    points: filtered
  }));
}


