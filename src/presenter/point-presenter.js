import { render, replace, remove } from '../framework/render.js';
import PointView from '../view/point-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';

export default class PointPresenter {
  #pointListContainer = null;
  #pointModel = null;

  #point = null;
  #offers = null;
  #destination = null;

  #handleModeChange = null;
  #handleDataChange = null;

  #pointComponent = null;
  #pointEditComponent = null;

  #mode = 'DEFAULT';

  constructor({ container, pointModel, onModeChange, onDataChange }) {
    this.#pointListContainer = container;
    this.#pointModel = pointModel;
    this.#handleModeChange = onModeChange;
    this.#handleDataChange = onDataChange;
  }

  init(point) {
    this.#point = point;
    this.#offers = this.#pointModel.getOffersById(point.type, point.offers);
    this.#destination = this.#pointModel.getDestinationById(point.destination);

    const prevPointComponent = this.#pointComponent;
    const prevEditComponent = this.#pointEditComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destination,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#pointEditComponent = new FormEditPointView({
      point: this.#point,
      offers: this.#pointModel.getOffersByType(point.type),
      checkedOffers: this.#offers,
      destinations: this.#destination,
      onFormSubmit: this.#handleFormSubmit,
      onEditClick: this.#handleFormCancel
    });

    if (!prevPointComponent || !prevEditComponent) {
      render(this.#pointComponent, this.#pointListContainer);
      this.#pointComponent.setHandlers();
      return;
    }

    if (this.#mode === 'DEFAULT') {
      replace(this.#pointComponent, prevPointComponent);
    } else {
      replace(this.#pointEditComponent, prevEditComponent);
    }

    remove(prevPointComponent);
    remove(prevEditComponent);

    this.#pointComponent.setHandlers();
  }

  resetView() {
    if (this.#mode === 'EDITING') {
      replace(this.#pointComponent, this.#pointEditComponent);
      this.#mode = 'DEFAULT';
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  #handleEditClick = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
    this.#pointEditComponent.setHandlers();
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = 'EDITING';
  };

  #handleFormSubmit = () => {
    replace(this.#pointComponent, this.#pointEditComponent);
    this.#pointComponent.setHandlers();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = 'DEFAULT';
  };

  #handleFormCancel = () => {
    replace(this.#pointComponent, this.#pointEditComponent);
    this.#pointComponent.setHandlers();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = 'DEFAULT';
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    });
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#handleFormCancel();
    }
  };
}

