import { NoEventsMessage } from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

function createNoEventPointsTemplate(currentFilter) {
  const noEventsTextValue = NoEventsMessage[currentFilter];
  return (
    `<p class="trip-events__msg">${noEventsTextValue}</p>`
  );
}

export default class NoEventPointsView extends AbstractView {
  #filter = null;

  constructor(filterModel) {
    super();
    this.#filter = filterModel.filter;
  }

  get template() {
    return createNoEventPointsTemplate(this.#filter);
  }
}
