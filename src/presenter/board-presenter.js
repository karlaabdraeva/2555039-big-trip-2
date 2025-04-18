import NoPointView from '../view/no-point-view.js';
import FormCreatingView from '../view/form-creating-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import PointView from '../view/point-view.js';
import { render, replace, RenderPosition } from '../framework/render.js';

export default class BoardPresenter {
  #container = null;
  #pointModel = null;
  #filterModel = null;
  #noPointComponent = null;
  #sortComponent = new SortView();
  #eventListComponent = new EventListView();

  constructor({ container, pointModel, filterModel }) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;
  }

  init() {
    this.#renderBoard();
  }

  #getPoints() {
    const currentFilter = this.#filterModel.getCurrentFilter();
    const allPoints = [...this.#pointModel.points];
    const filterFn = this.#filterModel.filterFn; // если есть функция фильтрации в модели
    return filterFn ? filterFn(currentFilter, allPoints) : allPoints;
  }

  #renderBoard() {
    const points = this.#getPoints();

    if (points.length === 0) {
      this.#noPointComponent = new NoPointView(this.#filterModel.getCurrentFilter()); // передаём активный фильтр
      render(this.#noPointComponent, this.#container);
      return;
    }

    render(this.#sortComponent, this.#container);
    render(this.#eventListComponent, this.#container);

    for (const point of points) {
      this.#renderEventPoint(point);
    }
  }

  #renderEventPoint(point) {
    const destination = this.#pointModel.getDestinationById(point.destination);

    if (!destination) {
      return;
    }

    const escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };

    const eventPointComponent = new PointView({
      point,
      offers: this.#pointModel.getOffersById(point.type, point.offers),
      destinations: destination,
      onEditClick: () => {
        replacePointToForm();
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    const eventEditFormComponent = new FormEditPointView({
      point,
      offers: this.#pointModel.getOffersByType(point.type),
      checkedOffers: this.#pointModel.getOffersById(point.type, point.offers),
      destinations: destination,
      onFormSubmit: () => {
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onEditClick: () => {
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    function replacePointToForm() {
      replace(eventEditFormComponent, eventPointComponent);
    }

    function replaceFormToPoint() {
      replace(eventPointComponent, eventEditFormComponent);
    }

    render(eventPointComponent, this.#eventListComponent.element);
  }

  createNewEvent() {
    if (this.#noPointComponent) {
      this.#noPointComponent.element.remove();
      this.#noPointComponent = null;

      render(this.#sortComponent, this.#container);
      render(this.#eventListComponent, this.#container);
    }

    const newPoint = {
      type: 'flight',
      destination: 1,
      dateFrom: new Date().toISOString(),
      dateTo: new Date().toISOString(),
      offers: [],
      basePrice: 0,
    };

    const destination = this.#pointModel.getDestinationById(newPoint.destination) || {
      name: '',
      description: '',
      pictures: []
    };

    const offers = this.#pointModel.getOffersByType(newPoint.type);

    const eventCreateComponent = new FormCreatingView({
      point: newPoint,
      offers,
      destination,
      onFormSubmit: () => {
        // логика сохранения
      }
    });

    render(eventCreateComponent, this.#eventListComponent.element, RenderPosition.AFTERBEGIN);
  }
}


