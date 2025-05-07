import NoPointView from '../view/no-point-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { filterEvents } from '../utils/filter.js';
import { SortType } from '../const.js';
import { sortByDate, sortByTime, sortByPrice } from '../utils/sort.js';
import PointPresenter from './point-presenter.js';

export default class BoardPresenter {
  #container = null;
  #pointModel = null;
  #filterModel = null;

  #sortComponent = null;
  #noPointComponent = null;
  #eventListComponent = new EventListView();

  #pointPresenters = new Map();

  #currentSortType = SortType.DAY; // текущее состояние сортировки

  constructor({ container, pointModel, filterModel }) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;

    this.#filterModel.setOnChange(this.#handleModelChange);
  }

  init() {
    this.#renderBoard();
  }

  #getPoints() {
    const filterType = this.#filterModel.getCurrentFilter();
    const filteredPoints = filterEvents[filterType](this.#pointModel.points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoints.sort(sortByTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortByPrice);
      default:
        return filteredPoints.sort(sortByDate);
    }
  }

  #renderBoard() {
    const points = this.#getPoints();

    if (points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    this.#renderEventList();
    this.#renderPoints(points);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #renderEventList() {
    render(this.#eventListComponent, this.#container);
  }

  #renderNoPoints() {
    this.#noPointComponent = new NoPointView(this.#filterModel.getCurrentFilter());
    render(this.#noPointComponent, this.#container);
  }

  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      container: this.#eventListComponent.element,
      pointModel: this.#pointModel,
      onDataChange: this.#handlePointDataChange,
      onModeChange: this.#handleModeChange
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #clearBoard({ resetSort = false } = {}) {
    this.#clearPoints();

    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    remove(this.#eventListComponent);

    if (resetSort) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return; // если сортировка та же — ничего не делать
    }

    this.#currentSortType = sortType;
    this.#clearPoints();
    this.#renderPoints(this.#getPoints());
  };

  #handleModelChange = () => {
    this.#clearBoard({ resetSort: true });
    this.#renderBoard();
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointDataChange = (updatedPoint) => {
    this.#pointModel.points = this.#pointModel.points.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );

    const presenter = this.#pointPresenters.get(updatedPoint.id);
    if (presenter) {
      presenter.init(updatedPoint);
    }
  };


  createNewEvent() {
    this.#handleModeChange();

    const newPoint = {
      id: Date.now(), // временный ID
      type: 'flight',
      destination: 1,
      dateFrom: new Date().toISOString(),
      dateTo: new Date().toISOString(),
      offers: [],
      basePrice: 0,
      isFavorite: false
    };

    const pointPresenter = new PointPresenter({
      container: this.#eventListComponent.element,
      pointModel: this.#pointModel,
      onDataChange: this.#handlePointDataChange,
      onModeChange: this.#handleModeChange
    });

    pointPresenter.init(newPoint);
    this.#pointPresenters.set(newPoint.id, pointPresenter);
  }
}
