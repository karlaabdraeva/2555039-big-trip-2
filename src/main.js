import PointModel from './model/point-model.js';
import FilterModel from './model/filter-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import HeaderPresenter from './presenter/header-presenter.js';

const siteHeaderElement = document.querySelector('.page-header');
const tripMainElement = siteHeaderElement.querySelector('.trip-main');
const filtersElement = document.querySelector('.trip-main__trip-controls');
const siteMainElement = document.querySelector('.trip-events');

// Создаём модели
const pointModel = new PointModel();
const filterModel = new FilterModel();

// Создаём презентеры
const boardPresenter = new BoardPresenter({
  container: siteMainElement,
  pointModel,
  filterModel,
});

const headerPresenter = new HeaderPresenter({
  tripMainElement,
  filtersElement,
  onNewEventClick: () => boardPresenter.createNewEvent(),
  pointModel,
  filterModel,
});

// Инициализируем презентеры
headerPresenter.init();
boardPresenter.init();


