import PointModel from './model/point-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import HeaderPresenter from './presenter/header-presenter.js';

const siteHeaderElement = document.querySelector('.page-header');
const tripMainElement = siteHeaderElement.querySelector('.trip-main');
const filtersElement = document.querySelector('.trip-main__trip-controls');
const siteMainElement = document.querySelector('.trip-events');

const pointModel = new PointModel();

const boardPresenter = new BoardPresenter({
  container: siteMainElement,
  pointModel: pointModel
});

const headerPresenter = new HeaderPresenter({
  tripMainElement,
  filtersElement,
  onNewEventClick: () => boardPresenter.createNewEvent()
});

boardPresenter.init();
headerPresenter.init();
