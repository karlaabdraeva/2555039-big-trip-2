import { DATE_FORMAT, EVENT_POINTS_TYPE } from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { humanizeEventDate } from '../utils/date.js';
import { createUpperCase } from '../utils/common.js';
import flatpickr from 'flatpickr';
import he from 'he';
import 'flatpickr/dist/flatpickr.min.css';

function createTypeTemplate(type) {
  return (
    `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">${createUpperCase(type)}</label>
    </div>`
  );
}

function createOfferTemplate(offer) {
  return (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="${offer.id}" type="checkbox" name="${offer.id}">
      <label class="event__offer-label" for="${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`
  );
}

function createOffersListTemplate(offers) {
  if (!offers.length) {
    return '';
  }

  return (
    `<section class="event__section event__section--offers">
      <h3 class="event__section-title">Offers</h3>
      <div class="event__available-offers">
        ${offers.map(createOfferTemplate).join('')}
      </div>
    </section>`
  );
}

function createPhotosTemplate(pictures) {
  return pictures.map((photo) => `<img class="event__photo" src="${photo.src}" alt="${photo.description}">`).join('');
}

function createDestinationTemplate(destination) {
  if (!destination || (!destination.description && !destination.pictures?.length)) {
    return '';
  }

  return (
    `<section class="event__section event__section--destination">
      <h3 class="event__section-title">Destination</h3>
      <p class="event__destination-description">${he.encode(destination.description)}</p>
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${createPhotosTemplate(destination.pictures)}
        </div>
      </div>
    </section>`
  );
}

function createNewEventTemplate(point, offers, destination, destinationsAll) {
  const { type, dateFrom, dateTo, basePrice } = point;
  const destinationName = destination?.name || '';

  return (
    `<form class="event event--edit">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${EVENT_POINTS_TYPE.map(createTypeTemplate).join('')}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-1">${createUpperCase(type)}</label>
          <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode(destinationName)}" list="destination-list-1" required>
          <datalist id="destination-list-1">
            ${destinationsAll.map((item) => `<option value="${item.name}"></option>`).join('')}
          </datalist>
        </div>

        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizeEventDate(dateFrom, DATE_FORMAT.fullDate)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizeEventDate(dateTo, DATE_FORMAT.fullDate)}">
        </div>

        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="0" required>
        </div>

        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>
      <section class="event__details">
        ${createOffersListTemplate(offers)}
        ${createDestinationTemplate(destination)}
      </section>
    </form>`
  );
}

export default class NewPointView extends AbstractStatefulView {
  #offers = null;
  #destination = null;
  #destinationsAll = null;
  #pointModel = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #handleFormSubmit = null;
  #handleFormCancel = null;

  constructor({ offers, destinationsAll, pointModel, onFormSubmit, onFormCancel }) {
    super();
    this.#offers = offers;
    this.#destination = {};
    this.#destinationsAll = destinationsAll;
    this.#pointModel = pointModel;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormCancel = onFormCancel;

    this._setState(NewPointView.parsePointToState());
    this._restoreHandlers();
  }

  get template() {
    return createNewEventTemplate(
      this._state,
      this.#offers,
      this.#destination,
      this.#destinationsAll
    );
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(NewPointView.parseStateToPoint(this._state));
  };

  #formCancelHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormCancel();
  };

  _restoreHandlers() {
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formCancelHandler);
    this.element.addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelectorAll('.event__type-input').forEach((el) =>
      el.addEventListener('change', this.#typeChangeHandler)
    );
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((el) =>
      el.addEventListener('change', this.#offerChangeHandler)
    );
    this.#setDatePickers();
  }


  #typeChangeHandler = (evt) => {
    const newType = evt.target.value;
    this.#offers = this.#pointModel.getOffersByType(newType);
    this.updateElement({
      ...this._state,
      type: newType,
      offers: []
    });
  };

  #destinationChangeHandler = (evt) => {
    const destination = this.#destinationsAll.find((d) => d.name === evt.target.value);
    if (!destination) {
      evt.target.value = '';
      return;
    }

    this.#destination = this.#pointModel.getDestinationById(destination.id);
    this.updateElement({ ...this._state, destination: destination.id });
  };

  #priceInputHandler = (evt) => {
    const value = evt.target.value;
    const numeric = Number(value);

    if (!/^\d*$/.test(value)) {
      evt.target.value = this._state.basePrice; // сбросим к предыдущему значению
      return;
    }

    this._setState({ ...this._state, basePrice: isNaN(numeric) ? 0 : numeric });
  };

  #offerChangeHandler = (evt) => {
    const id = evt.target.id;
    let updatedOffers = [...this._state.offers];
    if (evt.target.checked) {
      updatedOffers.push(id);
    } else {
      updatedOffers = updatedOffers.filter((oId) => oId !== id);
    }
    this._setState({ ...this._state, offers: updatedOffers });
  };

  #setDatePickers() {
    const [dateFromInput, dateToInput] = this.element.querySelectorAll('.event__input--time');

    this.#datepickerFrom = flatpickr(dateFromInput, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      TIME_24HR: true,
      defaultDate: this._state.dateFrom,
      onClose: this.#dateFromChangeHandler,
      maxDate: this._state.dateTo
    });

    this.#datepickerTo = flatpickr(dateToInput, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      TIME_24HR: true,
      defaultDate: this._state.dateTo,
      onClose: this.#dateToChangeHandler,
      minDate: this._state.dateFrom
    });
  }

  #dateFromChangeHandler = ([selectedDate]) => {
    this._setState({ ...this._state, dateFrom: selectedDate });
    this.#datepickerTo.set('minDate', selectedDate);
  };

  #dateToChangeHandler = ([selectedDate]) => {
    this._setState({ ...this._state, dateTo: selectedDate });
    this.#datepickerFrom.set('maxDate', selectedDate);
  };

  removeElement() {
    super.removeElement();
    this.#datepickerFrom?.destroy();
    this.#datepickerTo?.destroy();
  }

  static parsePointToState = () => ({
    type: EVENT_POINTS_TYPE[0],
    dateFrom: new Date(),
    dateTo: new Date(),
    basePrice: '',
    destination: {},
    offers: []
  });

  static parseStateToPoint = (state) => ({ ...state });
}
