import NoPointView from '../view/no-point-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { filterEvents } from '../utils/filter.js';
import { sortByDate, sortByTime, sortByPrice } from '../utils/sort.js';
import PointPresenter from './point-presenter.js';
import { SortType, UpdateType, UserAction, FilterType, NoEventsMessage } from '../const.js';

export default class BoardPresenter {
  #container = null;
  #pointModel = null;
  #filterModel = null;

  #sortComponent = null;
  #noPointComponent = null;
  #eventListComponent = new EventListView();

  #eventPointsPresenters = new Map();
  #currentSortType = SortType.DAY;
  #isCreatingNewPoint = false;

  constructor({ container, pointModel, filterModel }) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filterType = this.#filterModel.getFilter();
    const filteredPoints = filterEvents[filterType](this.#pointModel.points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return [...filteredPoints].sort(sortByTime);
      case SortType.PRICE:
        return [...filteredPoints].sort(sortByPrice);
      default:
        return [...filteredPoints].sort(sortByDate);
    }
  }

  init() {
    this.#renderSort();
    this.#renderBoard();
    this.#attachNewEventButton();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      container: this.#eventListComponent.element,
      pointModel: this.#pointModel,
      filterModel: this.#filterModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });

    pointPresenter.init(point);
    this.#eventPointsPresenters.set(point.id, pointPresenter);
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPoints();
    this.#sortComponent.element.remove();
    this.#renderSort();
    this.#renderBoard();
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#clearPoints();
    remove(this.#sortComponent);
    remove(this.#noPointComponent);
    remove(this.#eventListComponent);

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #clearPoints() {
    this.#eventPointsPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPointsPresenters.clear();
  }

  #handleModeChange = () => {
    this.#eventPointsPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = (actionType, updateType, updatedPoint) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointModel.updatePoint(updateType, updatedPoint);
        break;
      case UserAction.ADD_POINT:
        this.#pointModel.addPoint(updateType, updatedPoint);
        this.#isCreatingNewPoint = false;
        break;
      case UserAction.DELETE_POINT:
        this.#pointModel.deletePoint(updateType, updatedPoint);
        this.#isCreatingNewPoint = false;
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        if (this.#eventPointsPresenters.has(data.id)) {
          this.#eventPointsPresenters.get(data.id).init(data);
        }
        break;
      case UpdateType.MINOR:
        this.#clearPoints();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderSort();
        this.#renderBoard();
        break;
    }
  };

  #renderNoPoints() {
    const filterType = this.#filterModel.getFilter();
    const message = NoEventsMessage[filterType];
    this.#noPointComponent = new NoPointView(message);
    render(this.#noPointComponent, this.#container);
  }

  #renderBoard() {
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    if (this.points.length === 0 && !this.#isCreatingNewPoint) {
      this.#renderNoPoints();
      return;
    }

    render(this.#eventListComponent, this.#container);

    this.points.forEach((point) => this.#renderPoint(point));
  }

  createNewEvent() {
    this.#handleNewEventButtonClick();
  }

  #attachNewEventButton() {
    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    newEventButton.addEventListener('click', this.#handleNewEventButtonClick);
  }

  #handleNewEventButtonClick = () => {
    this.#isCreatingNewPoint = true;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#handleModeChange();
    this.#clearBoard({ resetSortType: true });
    this.#renderSort();
    render(this.#eventListComponent, this.#container);
    this.#renderBoard();

    const pointPresenter = new PointPresenter({
      container: this.#eventListComponent.element,
      pointModel: this.#pointModel,
      filterModel: this.#filterModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });

    const newPoint = pointPresenter.createPoint();
    this.#eventPointsPresenters.set(newPoint.id, pointPresenter);
  };
}

