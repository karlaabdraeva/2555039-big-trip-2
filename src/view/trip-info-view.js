import AbstractView from '../framework/view/abstract-view.js';

function createTripInfoTemplate({title, tripDates, totalCost}) {
  const { startDate, endDate } = tripDates;
  return (`
    <section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${title}</h1>
        <p class="trip-info__dates">
  ${startDate}&nbsp;&mdash;&nbsp;${endDate}
</p>
      </div>

      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #title = null;
  #tripDates = null;
  #totalCost = null;

  constructor({title, tripDates, totalCost}) {
    super();

    this.#title = title;
    this.#tripDates = tripDates;
    this.#totalCost = totalCost;
  }

  get template() {
    return createTripInfoTemplate({
      title: this.#title,
      tripDates: this.#tripDates,
      totalCost: this.#totalCost,
    });
  }

  updateData({title, tripDates, totalCost}) {
    this.#title = title;
    this.#tripDates = tripDates;
    this.#totalCost = totalCost;
    this.element.innerHTML = this.template;
  }
}
