import FormSortingView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import FormEditView from '../view/edit-view.js';
import PointView from '../view/point-view.js';
import FormCreatingView from '../view/form-creating-view.js';
import { render } from '../render.js';

export default class BoardPresenter {
  formSortingComponent = new FormSortingView();
  eventListComponent = new EventListView();

  constructor ({ container }) {
    this.container = container;
  }

  init() {
    render(this.formSortingComponent, this.container);
    render(this.eventListComponent, this.container);
    render(new FormEditView(), this.eventListComponent.getElement());
    render(new FormCreatingView(), this.eventListComponent.getElement());

    for (let i = 0; i < 3; i++) {
      render(new PointView(), this.eventListComponent.getElement());
    }
  }
}
