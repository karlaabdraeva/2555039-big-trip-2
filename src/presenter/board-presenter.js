import NoPointView from '../view/no-point-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import FormEditView from '../view/edit-view.js';
import PointView from '../view/point-view.js';
import FormCreatingView from '../view/form-creating-view.js';
import { render, replace, RenderPosition } from '../framework/render.js';

export default class BoardPresenter {
  #container = null;
  #pointModel = null;
  #noPointComponent = null;
  #sortComponent = new SortView();
  #eventListComponent = new EventListView();
  #eventCreateComponent = new FormCreatingView();

  #eventPoints = [];

  constructor({ container, pointModel }) {
    this.#container = container;
    this.#pointModel = pointModel;
  }

  init() {
    this.#eventPoints = [...this.#pointModel.points];
    this.render();
  }

  render() {
    if (this.#eventPoints.length === 0) {
      this.#noPointComponent = new NoPointView();
      render(this.#noPointComponent, this.#container);
      return;
    }

    render(this.#sortComponent, this.#container);
    render(this.#eventListComponent, this.#container);

    for (let i = 1; i < this.#eventPoints.length; i++) {
      this.#renderEventPoint(this.#eventPoints[i]);
    }
  }

  #renderEventPoint(point) {
    const escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };

    const eventPointComponent = new PointView({
      point: point,
      offers: this.#pointModel.getOffersById(point.type, point.offers),
      destinations: this.#pointModel.getDestinationById(point.destination),
      onEditClick: () => {
        replacePointToForm();
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    const eventEditFormComponent = new FormEditView({
      point: point,
      offers: this.#pointModel.getOffersByType(point.type),
      checkedOffers: this.#pointModel.getOffersById(point.type, point.offers),
      destinations: this.#pointModel.getDestinationById(point.destination),
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

    render(this.#eventCreateComponent, this.#eventListComponent.element, RenderPosition.AFTERBEGIN);
  }
}
