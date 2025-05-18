import { EndPoint, Method } from './const.js';
import ApiService from './framework/api-service.js';

export default class TripApiService extends ApiService {
  constructor(endPoint, authorization) {
    super(endPoint, authorization);
  }

  get points() {
    return this._load({url: EndPoint.POINTS})
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({url: EndPoint.OFFERS})
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({url: EndPoint.DESTINATIONS})
      .then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `${EndPoint.POINTS}/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });
    const parsedResponse = await ApiService.parseResponse(response);
    return parsedResponse;
  }

  async addPoint(point) {
    const response = await this._load({
      url: EndPoint.POINTS,
      method: Method.POST,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  }

  async deletePoint(point) {
    const response = await this._load({
      url: `${EndPoint.POINTS}/${point.id}`,
      method: Method.DELETE,
    });

    return response;
  }

  #adaptToServer(point) {
    const adaptedPoint = {
      ...point,
      'base_price': Number(point.basePrice),
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'is_favorite': point.isFavorite,
      'destination': point.destination || null,
    };

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;

    return adaptedPoint;
  }
}
