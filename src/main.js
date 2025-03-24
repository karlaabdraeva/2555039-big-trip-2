import FiltersView from './view/filters-view';
import { render } from './render.js';
import BoardPresenter from './presenter/board-presenter.js';

const filtersElement = document.querySelector('.trip-main__trip-controls');
const siteMainElement = document.querySelector('.trip-events');
const boardPresenter = new BoardPresenter({container: siteMainElement});

render(new FiltersView(), filtersElement);

boardPresenter.init();
