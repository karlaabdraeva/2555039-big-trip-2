import { eventPoints } from '../mock/points';
import { destinations } from '../mock/destinations';
import { offers } from '../mock/offers';

export default class PointModel {
  #points = eventPoints;
  #offers = offers;
  #destinations = destinations;

  get points() {
    return this.#points;
  }

  set points(newPoints) {
    this.#points = newPoints;
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
    if(!offersType || !offersType.offers || offersId.length === 0){
      return [];
    }
    return offersType.offers.filter((item) => offersId.includes(item.id));
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === Number(id)) || null;
  }

  updatePoint(update) {
    this.#points = this.#points.map((point) =>
      point.id === update.id ? update : point
    );
  }


}
