import NoEventPointsView from '../view/no-event-points-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { filterEventPoints } from '../utils/filter.js';
import { sortByDate, sortByTime, sortByPrice } from '../utils/sort.js';
import PointPresenter from './point-presenter.js';
import { SortType, UpdateType, UserAction, FilterType, TimeLimit } from '../const.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import LoadingView from '../view/loading-view.js';
import HeaderPresenter from './header-presenter.js';
import ErrorLoadView from '../view/error-load-view.js';

export default class BoardPresenter {
  #container = null;
  #pointModel = null;
  #filterModel = null;
  #hasError = false;
  #errorComponent = null;
  #headerPresenter = null;
  #sortComponent = null;
  #noEventPointsComponent = null;
  #newEventButtonComponent = null;
  #loadingComponent = new LoadingView();
  #eventListComponent = new EventListView();

  #isLoading = true;
  #isCreatingNewPoint = false;

  #currentSortType = SortType.DAY;
  #eventPointsPresenters = new Map();
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({ container, pointModel, filterModel }) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;

    this.#headerPresenter = new HeaderPresenter({
      container: document.querySelector('.trip-main'),
      pointModel: this.#pointModel
    });

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const currentFilter = this.#filterModel.getFilter();
    const filtered = filterEventPoints(this.#pointModel.points);
    const current = filtered.find((filter) => filter.type === currentFilter);
    const filteredPoints = current ? current.points : [];

    switch (this.#currentSortType) {
      case SortType.DAY:
        return [...filteredPoints].sort(sortByDate);
      case SortType.PRICE:
        return [...filteredPoints].sort(sortByPrice);
      case SortType.TIME:
        return [...filteredPoints].sort(sortByTime);
      default:
        return filteredPoints;
    }
  }

  init() {
    this.#renderBoard();
    this.#attachNewEventButton();
  }

  #renderPoint(point) {
    const presenter = new PointPresenter({
      container: this.#eventListComponent.element,
      pointModel: this.#pointModel,
      filterModel: this.#filterModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    presenter.init(point);
    this.#eventPointsPresenters.set(point.id, presenter);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #renderBoard() {
    if(this.#hasError) {
      return;
    }
    if (this.#errorComponent) {
      remove(this.#errorComponent);
      this.#errorComponent = null;
    }

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (!this.#sortComponent) {
      this.#renderSort();
    }

    if (this.points.length === 0 && !this.#isCreatingNewPoint) {
      this.#renderNoPoints();
      return;
    }

    render(this.#eventListComponent, this.#container);
    this.points.forEach((point) => this.#renderPoint(point));
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#container);
  }

  #renderNoPoints() {
    const currentFilter = this.#filterModel.getFilter();
    this.#noEventPointsComponent = new NoEventPointsView(currentFilter);
    render(this.#noEventPointsComponent, this.#container);
  }

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.ERROR:
        this.#isLoading = false;
        this.#hasError = true;
        remove(this.#loadingComponent);

        this.#errorComponent = new ErrorLoadView();
        render(this.#errorComponent, this.#container);
        break;


      case UpdateType.INIT:
        this.#isLoading = false;
        this.#hasError = false;
        remove(this.#loadingComponent);

        if (this.#errorComponent) {
          remove(this.#errorComponent);
          this.#errorComponent = null;
        }

        if (this.#noEventPointsComponent) {
          remove(this.#noEventPointsComponent);
          this.#noEventPointsComponent = null;
        }

        this.#headerPresenter.init(this.#pointModel.points);
        this.#renderSort();
        render(this.#eventListComponent, this.#container);
        this.#renderBoard();
        this.#newEventButtonComponent.addEventListener('click', this.#handleNewEventButtonClick);
        this.#toggleNewEventButton(false);
        break;
      case UpdateType.PATCH:
        if (this.#eventPointsPresenters.has(data.id)) {
          this.#eventPointsPresenters.get(data.id).init(data);
        } else {
          this.#clearEventPointsList();
          this.#renderBoard();
        }
        break;

      case UpdateType.MINOR:
        this.#clearEventPointsList();
        this.#renderBoard();
        break;

      case UpdateType.MAJOR:
        if (this.#isCreatingNewPoint) {
          this.#handleModeChange();
        }

        this.#clearBoard({ resetSortType: true });
        this.#renderSort();
        this.#renderBoard();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType || this.#hasError) {
      return;
    }

    this.#eventPointsPresenters.forEach((presenter) => presenter.resetView());
    this.#currentSortType = sortType;
    this.#clearEventPointsList();
    this.#sortComponent.element.remove();
    this.#renderSort();
    this.#renderBoard();
  };

  #handleViewAction = async (actionType, updateType, updatedPoint) => {
    this.#uiBlocker.block();
    try {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          this.#eventPointsPresenters.get(updatedPoint.id).setSaving();
          await this.#pointModel.updatePoint(updateType, updatedPoint);
          break;

        case UserAction.ADD_POINT:
          this.#eventPointsPresenters.forEach((p) => p.setSaving());
          await this.#pointModel.addPoint(updateType, updatedPoint);
          this.#isCreatingNewPoint = false;
          break;

        case UserAction.DELETE_POINT:
          this.#eventPointsPresenters.get(updatedPoint.id).setDeleting();
          await this.#pointModel.deletePoint(updateType, updatedPoint);
          this.#isCreatingNewPoint = false;
          break;
      }
    } catch {
      this.#eventPointsPresenters.get(updatedPoint.id)?.setAborting();
    }
    this.#uiBlocker.unblock();
  };

  #handleModeChange = () => {
    this.#eventPointsPresenters.forEach((presenter) => presenter.resetView());
  };

  #clearEventPointsList() {
    this.#eventPointsPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPointsPresenters.clear();
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#eventPointsPresenters.forEach((p) => p.destroy());
    this.#eventPointsPresenters.clear();
    remove(this.#sortComponent);
    remove(this.#noEventPointsComponent);
    remove(this.#eventListComponent);
    remove(this.#loadingComponent);
    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #attachNewEventButton() {
    this.#newEventButtonComponent = document.querySelector('.trip-main__event-add-btn');
    this.#newEventButtonComponent.addEventListener('click', this.#handleNewEventButtonClick);
  }

  #handleNewEventButtonClick = () => {
    if(this.#hasError) {
      return;
    }
    this.#toggleNewEventButton(true);
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
      onModeChange: this.#handleModeChange,
      onToggleButton: () => {
        this.#isCreatingNewPoint = false;
        this.#toggleNewEventButton(false);
        this.#clearEventPointsList();
        this.#renderBoard();
      }
    });

    const newPoint = pointPresenter.createPoint();
    this.#eventPointsPresenters.set(newPoint, pointPresenter);
  };

  #toggleNewEventButton(isDisabled) {
    if (this.#newEventButtonComponent) {
      this.#newEventButtonComponent.disabled = isDisabled;
      this.#newEventButtonComponent.classList.toggle('disabled', isDisabled);
    }
  }
}

