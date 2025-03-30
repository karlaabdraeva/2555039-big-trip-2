import { EVENT_POINTS_COUNT } from '../const';
import { getRandomPoint } from '../mock/points';
import { destinations } from '../mock/destinations';
import { offers } from '../mock/offers';

export default class PointsModel {
  points = Array.from({length: EVENT_POINTS_COUNT}, getRandomPoint);
  offers = offers;
  destinations = destinations;

  getPoints() {
    return this.points;
  }

  getOffers() {
    return this.offers;
  }

  getDestinations () {
    return this.destinations;
  }

  getDestinationsById(id) {
    const allDestinations = this.getDestinations();
    return allDestinations.find((destination) => destination.id === id);
  }

  getOffersByType(type) {
    const allOffers = this.getOffers();
    return allOffers.find((offer) => offer.type === type);
  }

  getOffersById(type, offersId) {
    const offersType = this.getOffersByType(type);
    return offersType.offers.filter((item) => offersId.find((id) => item.id === id));
  }
}
