import { render, replace, remove } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import { FilterType, UpdateType } from '../const.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #onFilterChange = null;

  #filterComponent = null;

  constructor({ container, filterModel, onFilterChange }) {
    this.#filterContainer = container;
    this.#filterModel = filterModel;
    this.#onFilterChange = onFilterChange;

    this.#filterModel.addObserver(this.#handleModelChange);
  }

  init() {
    const filters = Object.values(FilterType);
    const previousComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filters,
      currentFilter: this.#filterModel.getFilter(),
      onFilterTypeChange: this.#handleFilterTypeChange,
    });

    if (previousComponent) {
      replace(this.#filterComponent, previousComponent);
      remove(previousComponent);
    } else {
      render(this.#filterComponent, this.#filterContainer);
    }
  }

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.getFilter() === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);

    // вызываем внешний колбэк, если задан
    this.#onFilterChange?.();
  };

  // перерисовка компонента при изменении модели
  #handleModelChange = () => {
    this.init();
  };
}
