import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { DATE_FORMAT, EVENT_POINTS_TYPE } from '../const.js';
import { humanizeEventDate } from '../utils/date.js';
import { createUpperCase } from '../utils/common.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

function createTypeTemplate(type) {
  return (`
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">${createUpperCase(type)}</label>
    </div>`);
}

function createOfferTemplate(offer, checkedOffers) {
  const isChecked = checkedOffers.includes(offer.id) ? 'checked' : '';
  return `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="${offer.id}" type="checkbox" name="${offer.id}" ${isChecked}>
      <label class="event__offer-label" for="${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`;
}

function createOffersListTemplate(offers, checkedOffers) {
  if (!offers.length) {
    return '';
  }
  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offers.map((offer) => createOfferTemplate(offer, checkedOffers)).join('')}
      </div>
    </section>`;
}

function createPhotoTemplate(photo) {
  return `<img class="event__photo" src="${photo.src}" alt="${photo.description}">`;
}

function createDestinationTemplate(description, pictures) {
  if (!description && !pictures.length) {
    return '';
  }

  const encodedDescription = he.encode(description);

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${encodedDescription}</p>
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${pictures.map(createPhotoTemplate).join('')}
        </div>
      </div>
    </section>`;
}

function createDestinationOptions(destinations) {
  return destinations.map((item) => `<option value="${item.name}"></option>`).join('');
}

function createFormEditPointTemplate(state) {
  const {
    type, dateFrom, dateTo, basePrice,
    destinationName, description, pictures,
    offers, checkedOffers, destinations
  } = state;

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
               <legend class="visually-hidden">Event type</legend>
                ${EVENT_POINTS_TYPE.map((item) => createTypeTemplate(item)).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${createUpperCase(type)}</label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${createDestinationOptions(destinations)}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <input class="event__input event__input--time" type="text" value="${humanizeEventDate(dateFrom, DATE_FORMAT.fullDate)}"> —
            <input class="event__input event__input--time" type="text" value="${humanizeEventDate(dateTo, DATE_FORMAT.fullDate)}">
          </div>

          <div class="event__field-group event__field-group--price">
            <input class="event__input event__input--price" type="number" value="${basePrice}">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>

        <section class="event__details">
          ${createOffersListTemplate(offers, checkedOffers)}
          ${createDestinationTemplate(description, pictures, destinations, destinationName)}
        </section>
      </form>
    </li>`;
}

export default class FormEditPointView extends AbstractStatefulView {
  _offers = null;
  _destinations = null;
  _dateFromPicker = null;
  _dateToPicker = null;
  _callback = {};

  constructor({ point, offers, destinations, onFormSubmit, onResetClick, onRollupClick, onEsc }) {
    super();

    const selectedDestination = destinations.find((d) => d.id === point.destination) || {};
    const offerSet = offers.find((o) => o.type === point.type) || { offers: [] };

    this._offers = offers;
    this._destinations = destinations;

    this._initialState = {
      ...point,
      offers: offerSet.offers,
      checkedOffers: point.offers,
      destinationName: selectedDestination.name || '',
      description: selectedDestination.description || '',
      pictures: selectedDestination.pictures || [],
      destinations
    };

    this._setState(this._initialState);

    this._callback.formSubmit = onFormSubmit;
    this._callback.resetButtonClick = onResetClick;
    this._callback.rollupButtonClick = onRollupClick;
    this._callback.esc = onEsc;

    this._restoreHandlers();
  }

  get template() {
    return createFormEditPointTemplate(this._state);
  }

  removeElement() {
    super.removeElement();
    if (this._dateFromPicker) {
      this._dateFromPicker.destroy();
      this._dateFromPicker = null;
    }
    if (this._dateToPicker) {
      this._dateToPicker.destroy();
      this._dateToPicker = null;
    }
  }

  _restoreHandlers() {
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setResetButtonClickHandler(this._callback.resetButtonClick);
    this.setRollupButtonClickHandler(this._callback.rollupButtonClick);
    this._setTypeChangeHandler();
    this._setDestinationChangeHandler();
    this._setDatePickers();
  }

  setFormSubmitHandler(callback) {
    this.element.querySelector('form')?.addEventListener('submit', (evt) => {
      evt.preventDefault();
      callback(this._state);
    });
  }

  setResetButtonClickHandler(callback) {
    this.element.querySelector('.event__reset-btn')?.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.reset();
      callback();
    });
  }

  setRollupButtonClickHandler(callback) {
    this.element.querySelector('.event__rollup-btn')?.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.reset();
      callback();
    });
  }

  setEscKeyDownHandler(callback) {
    const escHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        document.removeEventListener('keydown', escHandler);
        callback();
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  _setTypeChangeHandler() {
    this.element.querySelector('.event__type-group')?.addEventListener('change', (evt) => {
      const newType = evt.target.value;
      const matchedOffers = this._offers.find((o) => o.type === newType)?.offers || [];
      this.updateElement({
        type: newType,
        offers: matchedOffers,
        checkedOffers: []
      });
    });
  }

  _setDestinationChangeHandler() {
    this.element.querySelector('.event__input--destination')?.addEventListener('input', (evt) => {
      const inputValue = evt.target.value;
      const foundDestination = this._destinations.find((d) => d.name === inputValue);
      if (foundDestination) {
        this.updateElement({
          destination: foundDestination.id,
          destinationName: foundDestination.name,
          description: foundDestination.description,
          pictures: foundDestination.pictures
        });
      }
    });
  }

  _setDatePickers() {
    const [dateFromElement, dateToElement] = this.element.querySelectorAll('.event__input--time');

    const flatPickerConfig = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: { firstDayOfWeek: 1 },
      'time_24hr': true,
    };

    this._datePickerFrom = flatpickr(dateFromElement, {
      ...flatPickerConfig,
      defaultDate: this._state.dateFrom,
      onClose: this._handleDateFromChange,
      maxDate: this._state.dateTo,
    });

    this._datePickerTo = flatpickr(dateToElement, {
      ...flatPickerConfig,
      defaultDate: this._state.dateTo,
      onClose: this._handleDateToChange,
      minDate: this._state.dateFrom,
    });
  }

  _handleDateFromChange = ([userDate]) => {
    this.updateElement({ dateFrom: userDate.toISOString() });
  };

  _handleDateToChange = ([userDate]) => {
    this.updateElement({ dateTo: userDate.toISOString() });
  };

  reset() {
    if (!this.element || !this.element.parentElement) {
      return;
    }

    this.updateElement(this._initialState);
  }
}

