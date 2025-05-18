import { render, replace, remove, RenderPosition } from '../framework/render.js';
import PointView from '../view/point-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import NewPointView from '../view/new-point-view.js';
import { UserAction, UpdateType, Mode, BLANK_POINT } from '../const.js';

export default class PointPresenter {
  #container = null;
  #pointModel = null;
  #eventPointComponent = null;
  #eventEditFormComponent = null;
  #eventCreateFormComponent = null;
  #onToggleButton = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #escKeyDownHandler = null;
  #point = null;
  #mode = Mode.DEFAULT;

  constructor({container, pointModel, onDataChange, onModeChange, onToggleButton}) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
    this.#onToggleButton = onToggleButton;
  }

  init(point) {
    this.#point = point;

    const prevEventPointComponent = this.#eventPointComponent;
    const prevEventEditFormComponent = this.#eventEditFormComponent;

    this.#escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        if (this.#eventCreateFormComponent) {
          remove(this.#eventCreateFormComponent);
          this.#eventCreateFormComponent = null;
        } else {
          this.#eventEditFormComponent.reset(this.#point);
          this.#replaceFormToPoint();
        }
        document.removeEventListener('keydown', this.#escKeyDownHandler);
      }
    };

    this.#eventPointComponent = new PointView({
      point: point,
      offers: this.#pointModel.getOffersById(point.type, point.offers),
      destinations: this.#pointModel.getDestinationById(point.destination),
      onEditClick: () => {
        this.#replacePointToForm();
        document.addEventListener('keydown', this.#escKeyDownHandler);
      },
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#eventEditFormComponent = new FormEditPointView({
      point: point,
      offers: this.#pointModel.getOffersByType(point.type),
      checkedOffers: this.#pointModel.getOffersById(point.type, point.offers),
      destination: this.#pointModel.getDestinationById(point.destination),
      destinationsAll: this.#pointModel.destinations,
      pointModel: this.#pointModel,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteForm,

      onEditClick: () => {
        this.#eventEditFormComponent.reset(this.#point);
        this.#replaceFormToPoint();
        document.removeEventListener('keydown', this.#escKeyDownHandler);
      }
    });

    if (prevEventPointComponent === null || prevEventEditFormComponent === null) {
      render(this.#eventPointComponent, this.#container);
      this.#eventPointComponent.setHandlers();
      return;
    }


    if (this.#mode === Mode.DEFAULT && prevEventPointComponent !== null && prevEventPointComponent.element) {
      replace(this.#eventPointComponent, prevEventPointComponent);
      this.#eventPointComponent.setHandlers();
    }

    if (this.#mode === Mode.EDITING && prevEventEditFormComponent !== null && prevEventEditFormComponent.element) {
      replace(this.#eventPointComponent, prevEventEditFormComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevEventPointComponent);
    remove(prevEventEditFormComponent);
  }

  createPoint() {
    return this.#createPoint();
  }

  destroy() {
    remove(this.#eventPointComponent);
    remove(this.#eventEditFormComponent);
    if (this.#eventCreateFormComponent !== null) {
      remove(this.#eventCreateFormComponent);
    }
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      const wasCreating = this.#mode === Mode.NEW;

      this.#replaceFormToPoint();

      if (wasCreating && this.#onToggleButton) {
        this.#onToggleButton();
      }
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditFormComponent.updateElement({
        isSaving: true,
        isDisabled: false,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditFormComponent.updateElement({
        isDeleting: true,
        isDisabled: false,
      });
    }
  }

  setAborting() {
    const resetFormState = () => {
      this.#eventEditFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    if (this.#mode === Mode.DEFAULT) {
      if (this.#eventPointComponent) {
        this.#eventPointComponent.shake();
      }
      return;
    }

    if (this.#mode === Mode.EDITING) {
      this.#eventEditFormComponent.shake(resetFormState);
    }

    if (this.#mode === Mode.NEW && this.#eventCreateFormComponent) {
      this.#eventCreateFormComponent.shake();
    }
  }

  #createPoint = () => {
    if (this.#eventEditFormComponent !== null || this.#eventCreateFormComponent !== null) {
      return;
    }
    const point = BLANK_POINT;
    this.#point = point;

    this.#escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.#handleCancelCreate();
      }
    };

    this.#eventCreateFormComponent = new NewPointView({
      point,
      offers: this.#pointModel.getOffersByType(point.type),
      destination: this.#pointModel.getDestinationById(point.destination),
      destinationsAll: this.#pointModel.destinations,
      pointModel: this.#pointModel,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteForm,
      onFormCancel: this.#handleCancelCreate
    });

    document.addEventListener('keydown', this.#escKeyDownHandler);

    render(this.#eventCreateFormComponent, this.#container, RenderPosition.AFTERBEGIN);
    this.#mode = Mode.NEW;
    return point;
  };

  #replacePointToForm = () => {
    replace(this.#eventEditFormComponent, this.#eventPointComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  };

  #replaceFormToPoint = () => {
    if (this.#eventCreateFormComponent) {
      remove(this.#eventCreateFormComponent);
      this.#eventCreateFormComponent = null;
    } else {
      this.#eventEditFormComponent.reset(this.#point);
      replace(this.#eventPointComponent, this.#eventEditFormComponent);
    }
    this.#mode = Mode.DEFAULT;
  };

  #handleFavoriteClick = () => {
    const updatedPoint = {...this.#point, isFavorite: !this.#point.isFavorite};
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      updatedPoint
    );
  };

  #handleFormSubmit = (update) => {
    if (this.#mode === Mode.NEW) {
      this.#handleDataChange(
        UserAction.ADD_POINT,
        UpdateType.MINOR,
        update,
      );
    } else {
      this.#handleDataChange(
        UserAction.UPDATE_POINT,
        UpdateType.MINOR,
        update,
      );
    }
  };

  #handleDeleteForm = (point) => {
    if (this.#mode === Mode.NEW) {
      this.#handleCancelCreate();
    } else {
      this.#handleDataChange(
        UserAction.DELETE_POINT,
        UpdateType.MINOR,
        point,
      );
    }
  };

  #handleCancelCreate = () => {
    if (this.#eventCreateFormComponent !== null) {
      remove(this.#eventCreateFormComponent);
      this.#eventCreateFormComponent = null;
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
    this.#mode = Mode.DEFAULT;
    this.#onToggleButton();
  };
}
