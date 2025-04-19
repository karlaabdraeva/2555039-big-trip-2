export default class FilterModel {
  #currentFilter = 'everything';
  #onChange = null;

  getCurrentFilter() {
    return this.#currentFilter;
  }

  setOnChange(callback) {
    this.#onChange = callback;
  }

  setCurrentFilter(filterType) {
    if (this.#currentFilter === filterType) {
      return;
    }

    this.#currentFilter = filterType;
    if (this.#onChange) {
      this.#onChange();
    }
  }
}
