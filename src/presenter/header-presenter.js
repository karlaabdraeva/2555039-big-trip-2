import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import NewEventButtonView from '../view/new-event-button-view.js';
import { render, RenderPosition } from '../framework/render.js';
import { generateFilters } from '../utils/filter.js';

export default class HeaderPresenter {
  #tripMainElement = null;
  #filtersElement = null;
  #onNewEventClick = null;
  #filterModel = null;
  #pointModel = null;
  #filterComponent = null;

  constructor({ tripMainElement, filtersElement, onNewEventClick, filterModel, pointModel }) {
    this.#tripMainElement = tripMainElement;
    this.#filtersElement = filtersElement;
    this.#onNewEventClick = onNewEventClick;
    this.#filterModel = filterModel;
    this.#pointModel = pointModel;
  }

  init() {
    render(new TripInfoView(), this.#tripMainElement, RenderPosition.AFTERBEGIN);

    // устанавливаем обработчик изменений
    this.#filterModel.setOnChange(this.#handleFilterModelChange);

    this.#renderFilterView();
    this.#renderNewEventButton();
  }

  #renderFilterView() {
    if (this.#filterComponent) {
      this.#filterComponent.element.remove();
      this.#filterComponent = null;
    }

    const filters = generateFilters(this.#pointModel.points);

    this.#filterComponent = new FilterView({
      filters,
      onFilterTypeChange: (filterType) => {
        this.#filterModel.setCurrentFilter(filterType);
      }
    });

    render(this.#filterComponent, this.#filtersElement);
  }

  #renderNewEventButton() {
    const newEventButtonComponent = new NewEventButtonView({
      onClick: this.#onNewEventClick
    });

    render(newEventButtonComponent, this.#tripMainElement, RenderPosition.BEFOREEND);
  }

  #handleFilterModelChange = () => {
    this.#renderFilterView();
  };
}

