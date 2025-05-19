export const AUTHORIZATION = 'Basic a2FybGE6MTIzNA==';
export const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';
export const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export const EndPoint = {
  POINTS: 'points',
  OFFERS: 'offers',
  DESTINATIONS: 'destinations',
};

export const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export const MAX_POINTS_FOR_FULL_ROUTE = 3;

export const EVENT_POINTS_TYPE = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
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
export const SORT_BUTTONS = [
  {
    sortType: 'day',
    state: 'checked'
  },
  {
    sortType: 'event',
    state: 'disabled'
  },
  {
    sortType: 'time',
    state: ''
  },
  {
    sortType: 'price',
    state: ''
  },
  {
    sortType: 'offer',
    state: 'disabled'
  }
];

export const DATE_NOW = new Date().toISOString();

export const NoEventsMessage = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now'
};

export const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
  ERROR: 'ERROR'
};

export const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

export const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
  NEW: 'NEW',
};

export const BLANK_POINT = {
  basePrice: 0,
  dateFrom: new Date(),
  dateTo: new Date(),
  destination: 1,
  isFavorite: false,
  offers: [],
  type: 'taxi',
};

export const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend',
};
