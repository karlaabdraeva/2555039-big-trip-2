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
  #formEditPointComponent = null;

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

    const previousPointComponent = this.#pointComponent;
    const previousFormComponent = this.#formEditPointComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destination,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#formEditPointComponent = new FormEditPointView({
      point: this.#point,
      offers: this.#pointModel.offers,
      checkedOffers: this.#offers,
      destinations: this.#pointModel.destinations,
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleFormCancel,
      onResetClick: this.#handleFormCancel,
      onEsc: this.#handleFormCancel
    });

    if (!previousPointComponent || !previousFormComponent) {
      render(this.#pointComponent, this.#pointListContainer);
      this.#pointComponent.setHandlers();
      return;
    }

    if (this.#mode === 'DEFAULT') {
      replace(this.#pointComponent, previousPointComponent);
    } else {
      replace(this.#formEditPointComponent, previousFormComponent);
    }

    remove(previousPointComponent);
    remove(previousFormComponent);

    this.#pointComponent.setHandlers();
  }

  resetView() {
    if (this.#mode === 'EDITING') {
      if (
        this.#formEditPointComponent &&
        this.#formEditPointComponent.element &&
        this.#formEditPointComponent.element.parentElement
      ) {
        replace(this.#pointComponent, this.#formEditPointComponent);
      } else {
        render(this.#pointComponent, this.#pointListContainer);
      }
      document.removeEventListener('keydown', this.#handleEscapeKeyDown);
      this.#mode = 'DEFAULT';
    }
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#formEditPointComponent);
  }

  #handleEditClick = () => {
    replace(this.#formEditPointComponent, this.#pointComponent);
    this.#formEditPointComponent._restoreHandlers();
    document.addEventListener('keydown', this.#handleEscapeKeyDown);
    this.#handleModeChange();
    this.#mode = 'EDITING';
  };

  #handleFormSubmit = (updatedPoint) => {
    this.#handleDataChange(updatedPoint);
    replace(this.#pointComponent, this.#formEditPointComponent);
    this.#pointComponent.setHandlers();
    document.removeEventListener('keydown', this.#handleEscapeKeyDown);
    this.#mode = 'DEFAULT';
  };

  #handleFormCancel = () => {
    if (
      this.#formEditPointComponent &&
      this.#formEditPointComponent.element &&
      this.#formEditPointComponent.element.parentElement
    ) {
      replace(this.#pointComponent, this.#formEditPointComponent);
    } else {
      render(this.#pointComponent, this.#pointListContainer);
    }

    this.#pointComponent.setHandlers();
    document.removeEventListener('keydown', this.#handleEscapeKeyDown);
    this.#mode = 'DEFAULT';
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    });
  };

  #handleEscapeKeyDown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#handleFormCancel();
    }
  };
}
