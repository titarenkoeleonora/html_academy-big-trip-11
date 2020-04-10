import {createCostTemplate} from "./components/cost.js";
import {createDayTemplate} from "./components/day.js";
import {createEventEditTemplate} from "./components/event-edit.js";
import {createEventsListTemplate} from "./components/events-list.js";
import {createFiltersTemplate} from "./components/filters.js";
import {createRoutePointsTemplate} from "./components/route-points.js";
import {createRouteTemplate} from "./components/route.js";
import {createSiteMenuTemplate} from "./components/site-menu.js";
import {createSortingTemplate} from "./components/sotring.js";
import {createDaysContainerTemplate} from "./components/trip-days.js";
import {createTripInfoTemplate} from "./components/trip-info.js";
import {TRIP_POINT_TYPES, CITIES} from "./components/constants.js";

const POINTS_COUNT = 3;

const tripMainElement = document.querySelector(`.trip-main`);
const tripControlsElement = tripMainElement.querySelector(`.trip-controls`);
const tripControlsTitlesElement = tripControlsElement.querySelectorAll(`h2`);
const [firstTitleElement, secondTitleElement] = tripControlsTitlesElement;
const siteMainElement = document.querySelector(`.page-main`);
const tripEventsElement = siteMainElement.querySelector(`.trip-events`);

const render = (container, template, place = `beforeend`) => container.insertAdjacentHTML(place, template);

render(tripMainElement, createTripInfoTemplate(), `afterbegin`);

const tripInfoElement = tripMainElement.querySelector(`.trip-info`);

render(tripInfoElement, createRouteTemplate());
render(tripInfoElement, createCostTemplate());

render(firstTitleElement, createSiteMenuTemplate(), `afterend`);
render(secondTitleElement, createFiltersTemplate(), `afterend`);
render(tripEventsElement, createSortingTemplate());
render(tripEventsElement, createEventEditTemplate());
render(tripEventsElement, createDaysContainerTemplate());

const daysContainerElement = tripEventsElement.querySelector(`.trip-days`);

render(daysContainerElement, createDayTemplate());

const dayElement = daysContainerElement.querySelector(`.day`);

render(dayElement, createEventsListTemplate());

const eventsListElement = dayElement.querySelector(`.trip-events__list`);

const renderRoutePoints = (container, template, place) => {
  for (let i = 0; i < POINTS_COUNT; i++) {
    render(container, template, place);
  }
};

renderRoutePoints(eventsListElement, createRoutePointsTemplate());

const TripDescriptions = [
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  `Cras aliquet varius magna, non porta ligula feugiat eget.`,
  `Fusce tristique felis at fermentum pharetra.`,
  `Aliquam id orci ut lectus varius viverra.`,
  `Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.`,
  `Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.`,
  `Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.`,
  `Sed sed nisi sed augue convallis suscipit in sed felis.`,
  `Aliquam erat volutpat.`,
  `Nunc fermentum tortor ac porta dapibus.`,
  `In rutrum ac purus sit amet tempus.`,
];

// const typeRoutePointMap = {
//   'taxi': `Taxi to`,
//   'bus': `Bus to`,
//   'train': `Train to`,
//   'ship': `Ship to`,
//   'transport': `Transport to`,
//   'drive': `Drive to`,
//   'flight': `Flight to`,
//   'check': `Check-in in`,
//   'sightseeing': `Sightseeing in`,
//   'restaurant': `Restaurant in`,
// };

const descriptionsCount = {
  MIN: 1,
  MAX: 3,
};

const picturesCount = {
  MIN: 1,
  MAX: 5,
};

const priceSize = {
  MIN: 10,
  MAX: 150,
};

const getRandomArrayItem = (array) => {
  const randomIndex = getRandomInteger(0, array.length);

  return array[randomIndex];
};

const getRandomInteger = (min, max) => {
  // случайное число от min до (max+1)
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

// Генерирует случайное описание фото

// Shuffle array
const shuffledDescriptions = TripDescriptions.sort(() => 0.5 - Math.random());

// Get sub-array of first n elements after shuffled
let selectedDescriptions = shuffledDescriptions.slice(0, getRandomInteger(descriptionsCount.MIN, descriptionsCount.MAX)).join(` `);

// Генерирует случайные дату и время

const castTimeFormat = (value) => {
  return value < 10 ? `0${value}` : String(value);
};

const formatTime = () => {
  const hours = castTimeFormat(new Date().getHours() % 12);
  const minutes = castTimeFormat(new Date().getMinutes());

  return `${hours}:${minutes}`;
};

const getRandomDate = () => {
  const targetDate = new Date();
  const sign = Math.random() > 0.5 ? 1 : -1;
  const diffValue = sign * getRandomInteger(0, 10);

  const dd = targetDate.getDate() + diffValue;
  const mm = targetDate.getMonth() + 1;
  const yy = targetDate.getFullYear() % 100;

  return `${dd}/${mm}/${yy}`;
};

// Генерирует случайные фото

const getRandomPictures = () => {
  const photosArray = [];
  const count = getRandomInteger(picturesCount.MIN, picturesCount.MAX);

  for (let i = 0; i < count; i++) {
    photosArray.push({
      src: `http://picsum.photos/248/152?r=${Math.random()}`,
    });
  }
  return photosArray;
};

const generateTripPoint = () => {
  return {
    type: getRandomArrayItem(TRIP_POINT_TYPES),
    dateFrom: `${getRandomDate()} ${formatTime()}`,
    dateTo: `${getRandomDate()} ${formatTime()}`,
    destination: {
      name: getRandomArrayItem(CITIES),
      description: selectedDescriptions,
      pictures: getRandomPictures(),
    },
    basePrice: getRandomInteger(priceSize.MIN, priceSize.MAX),
    isFavorite: Math.random() > 0.5,
    offers: [],
  };
};

console.log(generateTripPoint());

