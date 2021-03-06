import {render, remove} from "../utils/render";
import {RenderPosition, Mode} from "../constants";
import DaysComponent from "../components/trip-days";
import {getAllDates, getUniqueDates} from "../utils/date-utils";
import NoPointsComponent from "../components/no-points";
import SortComponent, {SortType} from "../components/sort";
import DayComponent from "../components/day";
import EventsListComponent from "../components/events-list";
import PointController, {EmptyPoint} from "./point-controller";
import {newEventButtonElement} from "../main";

const getSortedPoints = (points, sortType) => {
  let sortedPoints = [];
  const showingPoints = points.slice();

  switch (sortType) {
    case SortType.DEFAULT:
      sortedPoints = showingPoints;
      break;
    case SortType.TIME:
      sortedPoints = showingPoints.sort((a, b) => (b.dateTo - b.dateFrom) - (a.dateTo - a.dateFrom));
      break;
    case SortType.PRICE:
      sortedPoints = showingPoints.sort((a, b) => b.basePrice - a.basePrice);
      break;
  }

  return sortedPoints;
};

export default class TripController {
  constructor(container, pointsModel, api) {
    this._api = api;

    this._container = container;

    this._pointsModel = pointsModel;
    this._pointControllers = [];
    this._datesArray = [];

    this._daysComponent = new DaysComponent();
    this._dayComponent = new DayComponent();
    this._noPointsComponent = new NoPointsComponent();
    this._sortComponent = new SortComponent();
    this._eventsListComponent = new EventsListComponent();

    this._creatingPoint = null;

    this._sortTypeChangeHandler = this._sortTypeChangeHandler.bind(this);
    this._dataChangeHandler = this._dataChangeHandler.bind(this);
    this._viewChangeHandler = this._viewChangeHandler.bind(this);
    this._filterChangeHandler = this._filterChangeHandler.bind(this);

    this._pointsModel.setFilterChangeHandler(this._filterChangeHandler);
  }

  hide() {
    this._daysComponent.hide();
    this._sortComponent.hide();
  }

  show() {
    this._daysComponent.show();
    this._sortComponent.show();
  }

  render() {
    const points = this._pointsModel.getPoints();
    render(this._container, this._daysComponent);

    if (points.length === 0) {
      render(this._container, this._noPointsComponent);
      this._sortComponent.hide();
      return;
    }

    remove(this._noPointsComponent);
    this._sortComponent.show();
    this._renderTripDays(points);
  }

  createPoint() {
    if (this._creatingPoint) {
      return;
    }

    const destinations = this._pointsModel.getDestinations();
    const offers = this._pointsModel.getOffers();

    this._creatingPoint = new PointController(this._daysComponent.getElement(), this._dataChangeHandler, this._viewChangeHandler, destinations, offers);

    if (EmptyPoint.destination.name) {
      EmptyPoint.destination.name = ``;
    }

    this._creatingPoint.render(EmptyPoint, Mode.ADDING);

    this._pointControllers = this._pointControllers.concat(this._creatingPoint);
  }

  _removePoints() {
    this._pointControllers.forEach((pointController) => pointController.destroy());
    this._pointControllers = [];
  }

  _renderTripDays(points) {
    render(this._container, this._sortComponent, RenderPosition.AFTERBEGIN);
    this._sortComponent.setSortTypeHandler(this._sortTypeChangeHandler);
    getAllDates(points, this._datesArray);

    const tripEventsDates = this._datesArray;
    const tripDays = getUniqueDates(tripEventsDates);
    const destinations = this._pointsModel.getDestinations();
    const offers = this._pointsModel.getOffers();

    let tripDayComponent = null;
    let dayDate = null;
    let dateTime = null;

    tripDays.forEach((day, index) => {
      tripDayComponent = new DayComponent(day, index);
      const eventsListElement = new EventsListComponent();

      render(this._daysComponent.getElement(), tripDayComponent);
      render(tripDayComponent.getElement(), eventsListElement);

      const tripDayEventsList = tripDayComponent.getElement().querySelector(`.trip-events__list`);
      dayDate = tripDayComponent.getElement().querySelector(`.day__date`);
      dateTime = new Date(dayDate.dateTime);

      for (const point of points) {
        if (point.dateFrom.toDateString() === dateTime.toDateString()) {
          const pointController = new PointController(tripDayEventsList, this._dataChangeHandler, this._viewChangeHandler, destinations, offers);
          pointController.render(point, Mode.DEFAULT);
          this._pointControllers.push(pointController);
        }
      }
    });
  }

  _renderInEmptyDays(points) {
    const destinations = this._pointsModel.getDestinations();
    const offers = this._pointsModel.getOffers();

    render(this._daysComponent.getElement(), this._dayComponent);
    render(this._dayComponent.getElement(), this._eventsListComponent);

    for (const point of points) {
      const pointController = new PointController(this._eventsListComponent.getElement(), this._dataChangeHandler, this._viewChangeHandler, destinations, offers);
      pointController.render(point, Mode.DEFAULT);
    }
  }

  _updatePoints() {
    this._datesArray = [];
    const daysComponent = this._daysComponent.getElement();

    daysComponent.innerHTML = ``;

    this._removePoints();
    this.render();
  }

  _dataChangeHandler(pointController, oldData, newData, favoriteChecked = false) {
    if (oldData === EmptyPoint) {
      this._creatingPoint = null;
      if (newData === null) {
        newEventButtonElement.removeAttribute(`disabled`);
        pointController.destroy();
        this._updatePoints();
      } else {
        this._api.createPoint(newData)
          .then((pointModel) => {
            this._pointsModel.addPoint(pointModel);
            pointController.render(pointModel, Mode.DEFAULT);
            this._updatePoints();
            newEventButtonElement.removeAttribute(`disabled`);
          })
          .catch(() => {
            pointController._replacePointToEditForm();
            pointController.shake();
          });
      }
    } else if (newData === null) {
      this._api.deletePoint(oldData.id)
        .then(() => {
          this._pointsModel.removePoint(oldData.id);
          this._updatePoints();
          newEventButtonElement.removeAttribute(`disabled`);
        })
        .catch(() => {
          pointController.shake();
        });
    } else {
      this._api.updatePoint(oldData.id, newData)
        .then((pointModel) => {
          const isSuccess = this._pointsModel.updatePoint(oldData.id, pointModel);
          if (isSuccess) {
            if (!favoriteChecked) {
              pointController.render(pointModel, Mode.DEFAULT);
              this._updatePoints();
            }
          }
        })
        .catch(() => {
          pointController.shake();
        });
    }
  }

  _viewChangeHandler() {
    this._pointControllers.forEach((it) => it.setDefaultView());
  }

  _sortTypeChangeHandler(sortType) {
    const points = this._pointsModel.getPoints();
    const sortedPoints = getSortedPoints(points, sortType);

    this._daysComponent.getElement().innerHTML = ``;
    this._eventsListComponent.getElement().innerHTML = ``;

    if (sortType === SortType.DEFAULT) {
      this._renderTripDays(sortedPoints);
    } else {
      this._renderInEmptyDays(sortedPoints);
    }
  }

  _filterChangeHandler() {
    this._updatePoints();
  }
}
