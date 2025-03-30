import FormSortingView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import FormEditView from '../view/edit-view.js';
import PointView from '../view/point-view.js';
import FormCreatingView from '../view/form-creating-view.js';
import { render } from '../render.js';

export default class BoardPresenter {
  formSortingComponent = new FormSortingView();
  eventListComponent = new EventListView();

  constructor ({ container, pointsModel }) {
    this.container = container;
    this.pointsModel = pointsModel;
  }

  init() {
    this.eventPoints = [...this.pointsModel.getPoints()];
    render(this.formSortingComponent, this.container);
    render(this.eventListComponent, this.container);
    render(new FormEditView({
      points: this.eventPoints[0],
      checkedOffers: this.pointsModel.getOffersById(this.eventPoints[0].type, this.eventPoints[0].offers),
      offers: this.pointsModel.getOffersByType(this.eventPoints[0].type),
      destinations: this.pointsModel.getDestinationsById(this.eventPoints[0].destination)
    }), this.eventListComponent.getElement());

    render(new FormCreatingView(), this.eventListComponent.getElement());

    for (let i = 1; i < this.eventPoints.length; i++) {
      render(new PointView({
        points: this.eventPoints[i],
        offers: this.pointsModel.getOffersById(this.eventPoints[i].type, this.eventPoints[i].offers),
        destinations: this.pointsModel.getDestinationsById(this.eventPoints[i].destination)
      }),
      this.eventListComponent.getElement());
    }
  }
}
