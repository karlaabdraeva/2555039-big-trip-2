import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import NewEventButtonView from '../view/new-event-button-view.js';
import { render, RenderPosition } from '../framework/render.js';

export default class HeaderPresenter {
  #tripMainElement = null;
  #filtersElement = null;
  #onNewEventClick = null;
  #filters = [];
  #onFilterTypeChange = null;

  constructor({ tripMainElement, filtersElement, onNewEventClick, filters, onFilterTypeChange }) {
    this.#tripMainElement = tripMainElement;
    this.#filtersElement = filtersElement;
    this.#onNewEventClick = onNewEventClick;
    this.#filters = filters;
    this.#onFilterTypeChange = onFilterTypeChange;
  }

  init() {
    render(new TripInfoView(), this.#tripMainElement, RenderPosition.AFTERBEGIN);
    render(new FilterView({
      filters: this.#filters,
      onFilterTypeChange: this.#onFilterTypeChange
    }), this.#filtersElement);
    this.#renderNewEventButton();
  }

  #renderNewEventButton() {
    const newEventButtonComponent = new NewEventButtonView({
      onClick: this.#onNewEventClick
    });
    render(newEventButtonComponent, this.#tripMainElement, RenderPosition.BEFOREEND);
  }
}
