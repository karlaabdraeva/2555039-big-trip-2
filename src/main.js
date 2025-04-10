import PointModel from './model/point-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import HeaderPresenter from './presenter/header-presenter.js';
import { generateFilters } from './utils/filter.js';

const siteHeaderElement = document.querySelector('.page-header');
const tripMainElement = siteHeaderElement.querySelector('.trip-main');
const filtersElement = document.querySelector('.trip-main__trip-controls');
const siteMainElement = document.querySelector('.trip-events');

const pointModel = new PointModel();

const boardPresenter = new BoardPresenter({
  container: siteMainElement,
  pointModel: pointModel
});

const filters = generateFilters(pointModel.points);

const headerPresenter = new HeaderPresenter({
  tripMainElement,
  filtersElement,
  filters,
  onNewEventClick: () => boardPresenter.createNewEvent(),
  onFilterTypeChange: () => {}
});

boardPresenter.init();
headerPresenter.init();
