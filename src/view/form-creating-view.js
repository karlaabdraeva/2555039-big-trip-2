import AbstractView from '../framework/view/abstract-view';
import { DATE_FORMAT, EVENT_POINTS_TYPE } from '../const';
import { humanizeEventDate } from '../utils/date';
import { createUpperCase } from '../utils/common';

function createTypeTemplate(type){
  return (
    `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${createUpperCase(type)}</label>
    </div>`
  );
}

function createOfferTemplate(offer) {
  const {id,title, price} = offer;
  return (
    `<div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="${id}" type="checkbox" name="${id}">
        <label class="event__offer-label" for="${id}">
          <span class="event__offer-title">${title}</span>
         &plus;&euro;&nbsp;
          <span class="event__offer-price">${price}</span>
        </label>
      </div>`
  );
}

function createOffersListTemplate({offers}) {
  if (offers.length !== 0) {
    return (
      `<section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${offers.map((offer) => createOfferTemplate(offer)).join('')}
        </div>
      </section>`
    );
  }

  return '';
}

function createPhotoTemplate(photo) {
  const {src, description} = photo;
  return `<img class="event__photo" src=${src} alt=${description}>`;
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
  return '';
}

function createDestinationTemplate(destination = {}) {
  const { description = '', pictures = [] } = destination;
  if (!description && pictures.length === 0) {
    return '';
  }
  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${description}</p>
      ${createPhotoContainerTemplate(pictures)}
    </section>`
  );
}

function createNewEventTemplate(points, offers, destination = {}) {
  const { type, dateFrom, dateTo, basePrice } = points;
  const { name = '' } = destination;

  return (`
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
          <input class="event__input  event__input--destination" id="event-destination-1"
                 type="text" name="event-destination" value="${name}" list="destination-list-1">
          <datalist id="destination-list-1">
            <option value="${name}"></option>
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1"
                 type="text" name="event-start-time" value="${humanizeEventDate(dateFrom, DATE_FORMAT.fullDate)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1"
                 type="text" name="event-end-time" value="${humanizeEventDate(dateTo, DATE_FORMAT.fullDate)}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1"
                 type="text" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>

      <section class="event__details">
        ${createOffersListTemplate(offers)}
        ${createDestinationTemplate(destination)}
      </section>
    </form>`
  );
}

export default class FormCreatingView extends AbstractView {
  #point;
  #offers;
  #destination;
  #handleFormSubmit;

  constructor({ point, offers, destination, onFormSubmit }) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#destination = destination;
    this.#handleFormSubmit = onFormSubmit;

    this.#registerHandlers();
  }

  get template() {
    return createNewEventTemplate(this.#point, this.#offers, this.#destination);
  }

  #registerHandlers() {
    this.element.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.#handleFormSubmit();
    });
  }
}

