import PointModel from './model/point-model.js';
import FilterModel from './model/filter-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripApiService from './trip-api-service.js';
import { END_POINT, AUTHORIZATION } from './const.js';

const siteHeaderElement = document.querySelector('.page-header');
const tripEventsElement = document.querySelector('.trip-events');
const siteHeaderTripControls = siteHeaderElement.querySelector('.trip-controls__filters');

const pointModel = new PointModel({
  tripApiService: new TripApiService(END_POINT, AUTHORIZATION),
});
const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({
  container: tripEventsElement,
  pointModel,
  filterModel
});

pointModel.init()
  .then(() => {
    new FilterPresenter({
      filterContainer: siteHeaderTripControls,
      filterModel,
      pointModel
    }).init();

    boardPresenter.init();
  })
  .catch(() => {
    new FilterPresenter({
      filterContainer: siteHeaderTripControls,
      filterModel,
      pointModel
    }).init();

    boardPresenter.init();
  });


