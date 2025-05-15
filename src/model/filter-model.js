import Observable from '../framework/observable';
import { FilterType } from '../const';

export default class FilterModel extends Observable {
  #currentFilter = FilterType.EVERYTHING;

  getFilter() {
    return this.#currentFilter;
  }

  setFilter(updateType, newFilter) {
    if (this.#currentFilter === newFilter) {
      return;
    }

    this.#currentFilter = newFilter;
    this._notify(updateType);
  }
}
