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

    // Создание новых компонентов
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

    // Безопасный replace/render в зависимости от режима
    if (this.#mode === 'DEFAULT') {
      if (previousPointComponent?.element?.parentElement) {
        replace(this.#pointComponent, previousPointComponent);
      } else {
        render(this.#pointComponent, this.#pointListContainer);
      }
    }

    if (this.#mode === 'EDITING') {
      if (previousFormComponent?.element?.parentElement) {
        replace(this.#formEditPointComponent, previousFormComponent);
      }
    }

    //удаляем старые компоненты
    remove(previousPointComponent);
    remove(previousFormComponent);

    this.#pointComponent.setHandlers();
  }


  resetView() {
    if (this.#mode !== 'EDITING') {
      return;
    }

    this.#replaceFormToPoint();
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#formEditPointComponent);
  }

  #handleEditClick = () => {
    // Безопасный replace только если точка в DOM
    if (!this.#pointComponent.element?.parentElement) {
      return;
    }

    replace(this.#formEditPointComponent, this.#pointComponent);
    this.#formEditPointComponent._restoreHandlers();
    document.addEventListener('keydown', this.#handleEscapeKeyDown);

    this.#handleModeChange();
    this.#mode = 'EDITING';
  };

  #handleFormSubmit = (updatedPoint) => {
    this.#handleDataChange(updatedPoint);
    this.#replaceFormToPoint();
  };

  #replaceFormToPoint() {
    if (!this.#formEditPointComponent.element?.parentElement) {
      return;
    }

    this.#formEditPointComponent.reset(); // откат формы в начальное состояние
    replace(this.#pointComponent, this.#formEditPointComponent);
    this.#pointComponent.setHandlers();

    document.removeEventListener('keydown', this.#handleEscapeKeyDown);
    this.#mode = 'DEFAULT';
  }

  #handleFormCancel = () => {
    this.#replaceFormToPoint();
  };

  #handleFavoriteClick = () => {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };

    this.#handleDataChange(updatedPoint);
  };


  #handleEscapeKeyDown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#handleFormCancel();
    }
  };
}

