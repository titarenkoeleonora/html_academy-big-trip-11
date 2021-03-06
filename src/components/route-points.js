import {typeRoutePointMap, MAX_SHOWED_OFFERS_COUNT, Mode} from "../constants";
import AbstractComponent from "./abstract-component";
import {getTimeDifference, formatTime} from "../utils/date-utils";

const createOffersMarkup = (offers) => offers.slice(0, MAX_SHOWED_OFFERS_COUNT).map((offer) => {
  return (
    `<li class="event__offer">
        <span class="event__offer-title">${offer.title}</span>
        &plus;
        &euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
      </li>`
  );
}).join(`\n`);

const createRoutePointsTemplate = (tripPoint, mode) => {
  const {type, dateFrom, dateTo, destination, basePrice, checkedOffers} = tripPoint;

  const offersMarkup = mode !== Mode.ADDING && checkedOffers.length > 0 ? createOffersMarkup(checkedOffers) : ``;
  return (
    `<li class="trip-events__item">
      <div class="event">
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${typeRoutePointMap[type]} ${destination.name}</h3>

        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateFrom}">${formatTime(dateFrom)}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateTo}">${formatTime(dateTo)}</time>
          </p>
          <p class="event__duration">${getTimeDifference(dateFrom, dateTo)}</p>
        </div>

        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>

        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${offersMarkup}
        </ul>

        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`
  );
};

export default class RoutePoints extends AbstractComponent {
  constructor(point, mode) {
    super();

    this._point = point;
    this._mode = mode;
  }

  getTemplate() {
    return createRoutePointsTemplate(this._point, this._mode);
  }

  setClickHandler(handler) {
    if (this.getElement().querySelector(`.event__rollup-btn`)) {
      this.getElement().querySelector(`.event__rollup-btn`).addEventListener(`click`, handler);
    }
  }
}
