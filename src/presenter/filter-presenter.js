import { render, replace, remove } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import { UpdateType } from '../const.js';
import { filterEventPoints } from '../utils/filter.js';

export default class FilterPresenter {
  #filterModel = null;
  #filterContainer = null;
  #filterComponent = null;
  #pointModel = null;

  constructor({filterContainer, filterModel, pointModel}) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointModel = pointModel;

    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#pointModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    const points = this.#pointModel.points;
    return filterEventPoints(points);
  }

  init() {
    const filters = this.filters;
    const prevFilterComponent = this.#filterComponent;
    this.#filterComponent = new FilterView({
      filters,
      currentFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange,
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
