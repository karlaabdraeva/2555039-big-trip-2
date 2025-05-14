import { eventPoints } from '../mock/points';
import { destinations } from '../mock/destinations';
import { offers } from '../mock/offers';
import Observable from '../framework/observable';

export default class PointModel extends Observable {
  #points = eventPoints;
  #offers = offers;
  #destinations = destinations;

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }

  getOffersByType(type) {
    const offerGroup = this.#offers.find((offer) => offer.type === type);
    return offerGroup?.offers ?? [];
  }

  getOffersById(type, offersId) {
    if (!type || !Array.isArray(offersId)) {
      return [];
    }

    const availableOffers = this.getOffersByType(type);

    return availableOffers.filter((item) => offersId.includes(item.id));
  }


  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  updatePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, updatedPoint.id);
  }

  addPoint(updateType, newPoint) {
    this.#points = [
      newPoint,
      ...this.#points,
    ];
    this._notify(updateType, newPoint);
  }

  deletePoint(updateType, point) {
    const index = this.#points.findIndex((item) => item.id === point.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }
    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, point.id);
  }
}

