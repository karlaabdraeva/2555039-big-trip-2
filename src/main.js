import {render, RenderPosition} from './framework/render.js';
import TripInfoView from './view/trip-info-view.js';
import FiltersView from './view/filters-view';
import PointsModel from './model/point-model.js';
import BoardPresenter from './presenter/board-presenter.js';

const filtersElement = document.querySelector('.trip-main__trip-controls');
const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.page-header');
const tripMainElement = siteHeaderElement.querySelector('.trip-main');

const pointsModel = new PointsModel();

render(new TripInfoView(), tripMainElement, RenderPosition.AFTERBEGIN);
render(new FiltersView(), filtersElement);
const boardPresenter = new BoardPresenter({
  container: siteMainElement, pointsModel, tripMainElement
});
boardPresenter.init();
