import { MAX_POINTS_FOR_FULL_ROUTE } from '../const.js';
import TripInfoView from '../view/trip-info-view.js';
import { render, RenderPosition, remove } from '../framework/render.js';

export default class HeaderPresenter {
  #offers = null;
  #container = null;
  #destinations = null;
  #pointModel = null;
  #tripInfoComponent = null;

  constructor({ container, pointModel }) {
    this.#container = container;
    this.#pointModel = pointModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
  }

  #tripTitleData(points) {
    const sortedPoints = [...points].sort((currentPoint, nextPoint) => currentPoint.dateFrom - nextPoint.dateFrom);
    const firstPoint = sortedPoints[0];
    const lastPoint = sortedPoints[sortedPoints.length - 1];

    let routeTitle = '';
    if (sortedPoints.length > MAX_POINTS_FOR_FULL_ROUTE) {
      const firstName = this.#pointModel.getDestinationById(firstPoint.destination);
      const lastName = this.#pointModel.getDestinationById(lastPoint.destination);
      routeTitle = `${firstName.name} — ... — ${lastName.name}`;
    } else {
      routeTitle = sortedPoints.map((point) => {
        const destination = this.#pointModel.getDestinationById(point.destination);
        return destination ? destination.name : '';
      }).join(' — ');
    }

    return {
      title: routeTitle,
    };
  }

  #tripDates(points) {
    if (points.length === 0) {
      return {
        startDate: null,
        endDate: null
      };
    }

    const sortedPoints = [...points].sort((firstPoint, secondPoint) => firstPoint.dateFrom - secondPoint.dateFrom);
    const startDate = sortedPoints[0].dateFrom;
    const endDate = sortedPoints[sortedPoints.length - 1].dateTo;

    const options = { day: '2-digit', month: 'short' };
    const formattedStart = startDate.toLocaleDateString('en-GB', options).toUpperCase();
    const formattedEnd = endDate.toLocaleDateString('en-GB', options).toUpperCase();

    return {
      startDate: formattedStart,
      endDate: formattedEnd
    };
  }


  #getTotalPrice(points) {
    return points.reduce((sum, point) => {
      sum += point.basePrice + this.#getOffersPrice(point.offers, point.type);
      return sum;
    }, 0);
  }

  #getOffersPrice(selectedOffers, type) {
    const offers = this.#offers.find((item) => item.type === type)?.offers || [];
    return offers.reduce((sum, item) => {
      if (selectedOffers.includes(item.id)) {
        sum += item.price;
      }
      return sum;
    }, 0);
  }

  init(points) {
    if (!points || points.length === 0) {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    this.#destinations = this.#pointModel.destinations;
    this.#offers = this.#pointModel.offers;

    if (!this.#tripInfoComponent) {
      this.#tripInfoComponent = new TripInfoView({
        title: this.#tripTitleData(points).title,
        tripDates: this.#tripDates(points),
        totalCost: this.#getTotalPrice(points)
      });
      render(this.#tripInfoComponent, this.#container, RenderPosition.AFTERBEGIN);
    } else {
      this.#tripInfoComponent.updateData({
        title: this.#tripTitleData(points).title,
        tripDates: this.#tripDates(points),
        totalCost: this.#getTotalPrice(points)
      });
    }
  }

  #handleModelEvent = () => {
    const points = this.#pointModel.points;

    if (!points || points.length === 0) {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    this.init(points);
  };
}
