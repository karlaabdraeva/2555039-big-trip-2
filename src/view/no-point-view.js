import AbstractView from '../framework/view/abstract-view.js';
import { NoEventsMessage, FilterType } from '../const.js';

function createNoPointTemplate(currentFilterType) {
  const message = NoEventsMessage[currentFilterType];
  return (
    `<p class="trip-events__msg">${message}</p>`
  );
}

export default class NoPointView extends AbstractView {
  #filterType = null;

  constructor(filterType = FilterType.EVERYTHING) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPointTemplate(this.#filterType);
  }
}
