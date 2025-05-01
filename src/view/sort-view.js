import AbstractView from '../framework/view/abstract-view.js';
import { SORT_BUTTONS } from '../const.js';

// Функция создания кнопок сортировки
function createSortButtonTemplate(buttons, currentSortType) {
  return buttons.map(({ sortType, state }) =>
    `<div class="trip-sort__item trip-sort__item--${sortType}">
      <input id="sort-${sortType}" class="trip-sort__input visually-hidden" type="radio" name="trip-sort"
        data-sort-type="${sortType}" value="sort-${sortType}"
        ${sortType === currentSortType ? 'checked' : ''} ${state}>
      <label class="trip-sort__btn" for="sort-${sortType}" data-sort-type="${sortType}">
        ${sortType}
      </label>
    </div>`
  ).join('');
}

// Основная функция шаблона сортировки
function createSortTemplate(currentSortType) {
  return (
    `<form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${createSortButtonTemplate(SORT_BUTTONS, currentSortType)}
    </form>`
  );
}

export default class SortView extends AbstractView {
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({ currentSortType, onSortTypeChange }) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (!evt.target.classList.contains('trip-sort__input')) {
      return;
    }

    evt.preventDefault();
    const selectedSortType = evt.target.dataset.sortType;

    // Если сортировка изменилась — только тогда вызываем колбэк
    if (selectedSortType !== this.#currentSortType) {
      this.#handleSortTypeChange(selectedSortType);
    }
  };
}
