import { render, replace, remove, RenderPosition } from '../framework/render.js';
import PointView from '../view/point-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import NewPointView from '../view/new-point-view.js';
import { UserAction, UpdateType, Mode, BLANK_POINT } from '../const.js';

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
  #newPointComponent = null;

  #mode = Mode.DEFAULT;
  #escKeyDownHandler = null;

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
    const prevFormComponent = this.#formEditPointComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destination,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#formEditPointComponent = new FormEditPointView({
      point: this.#point,
      offers: this.#pointModel.getOffersByType(point.type),
      checkedOffers: this.#offers,
      destinations: this.#pointModel.destinations,
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleFormCancel,
      onResetClick: this.#handleFormCancel,
      onEsc: this.#handleFormCancel
    });

    if (this.#mode === Mode.DEFAULT) {
      if (prevPointComponent?.element?.parentElement) {
        replace(this.#pointComponent, prevPointComponent);
      } else {
        render(this.#pointComponent, this.#pointListContainer);
      }
    }

    if (this.#mode === Mode.EDITING) {
      if (prevFormComponent?.element?.parentElement) {
        replace(this.#formEditPointComponent, prevFormComponent);
      }
    }

    remove(prevPointComponent);
    remove(prevFormComponent);

    this.#pointComponent.setHandlers();
  }

  createPoint() {
    this.#point = { ...BLANK_POINT, id: Date.now() };

    this.#escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.#cancelCreatePoint();
      }
    };

    this.#newPointComponent = new NewPointView({
      point: this.#point,
      offers: this.#pointModel.getOffersByType(this.#point.type),
      destination: this.#pointModel.getDestinationById(this.#point.destination),
      destinationsAll: this.#pointModel.destinations,
      pointModel: this.#pointModel,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleCancelClick,
      onFormCancel: this.#handleCancelClick
    });

    render(this.#newPointComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);

    this.#mode = Mode.NEW;
    return this.#point;
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToPoint();
    }
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#formEditPointComponent);
    remove(this.#newPointComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #handleEditClick = () => {
    replace(this.#formEditPointComponent, this.#pointComponent);
    this.#formEditPointComponent._restoreHandlers();
    document.addEventListener('keydown', this.#handleEscapeKeyDown);

    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  };

  #handleFormSubmit = (updatedPoint) => {
    if (this.#mode === Mode.NEW) {
      const pointWithId = { ...updatedPoint, id: Date.now() };
      this.#handleDataChange(UserAction.ADD_POINT, UpdateType.MINOR, pointWithId);
      this.#cancelCreatePoint();
    } else {
      this.#handleDataChange(UserAction.UPDATE_POINT, UpdateType.PATCH, updatedPoint);
      this.#replaceFormToPoint();
    }
  };

  #handleCancelClick = () => {
    this.#cancelCreatePoint();
  };

  #cancelCreatePoint = () => {
    remove(this.#newPointComponent);
    this.#newPointComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #replaceFormToPoint() {
    if (this.#formEditPointComponent?.element?.parentElement) {
      this.#formEditPointComponent.reset();
      replace(this.#pointComponent, this.#formEditPointComponent);
      this.#pointComponent.setHandlers();
    }
    document.removeEventListener('keydown', this.#handleEscapeKeyDown);
    this.#mode = Mode.DEFAULT;
  }

  #handleFormCancel = () => {
    this.#replaceFormToPoint();
  };

  #handleFavoriteClick = () => {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };

    this.#handleDataChange(UserAction.UPDATE_POINT, UpdateType.PATCH, updatedPoint);
  };

  #handleEscapeKeyDown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#handleFormCancel();
    }
  };
}
