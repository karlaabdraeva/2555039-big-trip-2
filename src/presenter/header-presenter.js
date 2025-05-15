import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import NewEventButtonView from '../view/new-event-button-view.js';
import { render, RenderPosition, replace } from '../framework/render.js';
import { generateFilters } from '../utils/filter.js';
import { UpdateType } from '../const.js';

export default class HeaderPresenter {
  #tripMainElement = null;
  #filtersElement = null;

  #onNewEventClick = null;
  #filterModel = null;
  #pointModel = null;

  #filterComponent = null;
  #tripInfoComponent = null;

  constructor({ tripMainElement, filtersElement, onNewEventClick, filterModel, pointModel }) {
    this.#tripMainElement = tripMainElement;
    this.#filtersElement = filtersElement;
    this.#onNewEventClick = onNewEventClick;
    this.#filterModel = filterModel;
    this.#pointModel = pointModel;
  }

  init() {
    this.#filterModel.addObserver(this.#handleFilterModelChange);

    this.#renderTripInfo();
    this.#renderFilters();
    this.#renderNewEventButton();
  }

  #renderTripInfo() {
    this.#tripInfoComponent = new TripInfoView();
    render(this.#tripInfoComponent, this.#tripMainElement, RenderPosition.AFTERBEGIN);
  }

  #renderFilters() {
    const filters = generateFilters(this.#pointModel.points);

    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filters,
      currentFilter: this.#filterModel.getFilter(),
      onFilterTypeChange: (filterType) => {
        this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
      }
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filtersElement);
    } else {
      replace(this.#filterComponent, prevFilterComponent);
    }
  }

  #renderNewEventButton() {
    const newEventButtonComponent = new NewEventButtonView({
      onClick: this.#onNewEventClick
    });

    render(newEventButtonComponent, this.#tripMainElement, RenderPosition.BEFOREEND);
  }

  #handleFilterModelChange = () => {
    this.#renderFilters();
  };
}

