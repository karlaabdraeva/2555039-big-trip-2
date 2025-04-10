export const EVENT_POINTS_TYPE = [
  'Taxi',
  'Bus',
  'Train',
  'Ship',
  'Drive',
  'Flight',
  'Check-in',
  'Sightseeing',
  'Restaurant',
];

export const DATE_FORMAT = {
  monthDay: 'MMM D',
  fullDate: 'DD/MM/YY HH:mm',
  hours: 'hh:mm'
};

export const EVENT_POINTS_COUNT = 10;

export const FILTER_TYPES = ['everything', 'future', 'present', 'past'];
export const SORT_TYPES = ['day', 'event', 'time', 'price', 'offers'];

export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TYPE: 'type',
  TIME: 'time',
  PRICE: 'price',
};

export const DATE_NOW = new Date().toISOString();
