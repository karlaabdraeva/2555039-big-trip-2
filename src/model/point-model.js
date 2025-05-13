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

  set points(newPoints) {
    this.#points = newPoints;
  }

  // Метод для получения всех точек маршрута
  getPoints() {
    return this.#points;
  }

  // Метод для записи новых точек маршрута
  setPoints(newPoints) {
    this.#points = newPoints;
    this._notify('set');
  }

  // Метод для обновления конкретной точки маршрута
  updatePoint(update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error(`Can't update unexisting point (id: ${update.id})`);
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1),
    ];

    this._notify('update', update);
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }

  getOffersByType(type) {
    return this.#offers.find((offer) => offer.type === type) || { type, offers: [] };
  }

  getOffersById(type, offersId = []) {
    const offersType = this.getOffersByType(type);
    if (!offersType || !offersType.offers || offersId.length === 0) {
      return [];
    }
    return offersType.offers.filter((item) => offersId.includes(item.id));
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === Number(id)) || null;
  }
}

