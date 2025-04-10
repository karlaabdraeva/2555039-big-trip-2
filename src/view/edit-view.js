import AbstractView from '../framework/view/abstract-view';
import { DATE_FORMAT, EVENT_POINTS_TYPE } from '../const';
import { humanizeEventDate } from '../utils/date';
import { createUpperCase } from '../utils/common';

function createTypeTemplate(type) {
  return (
    `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${createUpperCase(type)}</label>
    </div>`
  );
}

function createOfferTemplate(offers, checkedOffers) {
  const {id, title, price} = offers;
  const isChecked = checkedOffers.map((item) => item.id).includes(id) ? 'checked' : '';
  return (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id=${id} type="checkbox" name=${id} ${isChecked}>
      <label class="event__offer-label" for=${id}>
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>`);
}

function createOffersListTemplate({offers}, checkedOffers) {
  if (offers.length !== 0) {
    return (
      `<section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>

        <div class="event__available-offers">
          ${offers.map((offer) => createOfferTemplate(offer, checkedOffers)).join('')}
        </div>
      </section>`
    );
  }
  return '';
}

function createPhotoTemplate(photo) {
  const {src, description} = photo;
  return (
    `<img class="event__photo" src=${src} alt=${description}>`
  );
}

function createPhotoContainerTemplate(pictures) {
  if (pictures.length > 0) {
    return (
      `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${pictures.map((item) => createPhotoTemplate(item)).join('')}
        </div>
      </div>`
    );
  }
}

function createDestinationTemplate(destination) {
  const {description, pictures} = destination;
  if (description > 0 || pictures.length > 0) {
    return (
      `<section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${description}</p>

          ${createPhotoContainerTemplate(pictures)}
      </section>`
    );
  }
}

function createFormEditTemplate (point, offers, checkedOffers, destinations) {
  const {type, dateFrom, dateTo, basePrice} = point;
  const {name} = destinations;
  return `
  <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
                ${EVENT_POINTS_TYPE.map((item) => createTypeTemplate(item)).join('')}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${createUpperCase(type)}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value='${name}' list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinations}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizeEventDate(dateFrom, DATE_FORMAT.fullDate)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizeEventDate(dateTo, DATE_FORMAT.fullDate)}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value=${basePrice}>
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        ${createOffersListTemplate(offers, checkedOffers)}
        ${createDestinationTemplate(destinations)}
      </section>
    </form>
  `;
}

export default class FormEditView extends AbstractView {
  #point = null;
  #offers = null;
  #checkedOffers = null;
  #destinations = null;
  #handleFormSubmit = null;
  #handleEditClick = null;

  constructor({point, offers, checkedOffers, destinations, onFormSubmit, onEditClick}) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#checkedOffers = checkedOffers;
    this.#destinations = destinations;
    this.#handleEditClick = onEditClick;
    this.#handleFormSubmit = onFormSubmit;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editClickHandler);
    this.element.addEventListener('submit', this.#formSubmitHandler);
  }

  get template () {
    return createFormEditTemplate(this.#point, this.#offers, this.#checkedOffers, this.#destinations);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };
}
