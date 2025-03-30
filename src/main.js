import FiltersView from './view/filters-view';
import PointsModel from './model/points-model.js';
import { render } from './render.js';
import BoardPresenter from './presenter/board-presenter.js';

const filtersElement = document.querySelector('.trip-main__trip-controls');
const siteMainElement = document.querySelector('.trip-events');

const pointsModel = new PointsModel();
render(new FiltersView(), filtersElement);
const boardPresenter = new BoardPresenter({container: siteMainElement, pointsModel});
boardPresenter.init();
