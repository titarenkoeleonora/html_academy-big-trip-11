import AbstractComponent from "./abstract-component";

export const MenuItem = {
  TABLE: `table`,
  STATISTICS: `statistics`,
};

const createSiteMenuTemplate = () => {
  return (
    `<nav class="trip-controls__trip-tabs  trip-tabs">
      <a class="trip-tabs__btn  trip-tabs__btn--active" href="#" id="table">Table</a>
      <a class="trip-tabs__btn" href="#" id="statistics">Stats</a>
    </nav>`
  );
};

export default class SiteMenuComponent extends AbstractComponent {
  constructor() {
    super();

    this._menuItemClickHandler = this.menuItemClickHandler.bind(this);
  }

  getTemplate() {
    return createSiteMenuTemplate();
  }

  setActiveItem(menuItem) {
    this._removeActiveClass();

    const item = document.querySelector(`#${menuItem}`);

    if (item) {
      item.classList.add(`trip-tabs__btn--active`);
    }
  }

  _removeActiveClass() {
    const items = document.querySelectorAll(`.trip-tabs__btn`);

    items.forEach((item) => item.classList.remove(`trip-tabs__btn--active`));
  }

  menuItemClickHandler(handler) {
    return (evt) => {
      if (!evt.target.id) {
        return;
      }

      const menuItem = evt.target.id;

      handler(menuItem);
    };
  }

  tableChangeHandler(handler) {
    document.querySelector(`#table`).addEventListener(`click`, this._menuItemClickHandler(handler));
  }
  statisticChangeHandler(handler) {
    document.querySelector(`#statistics`).addEventListener(`click`, this._menuItemClickHandler(handler));
  }
}
