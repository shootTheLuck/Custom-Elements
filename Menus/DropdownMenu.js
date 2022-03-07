
import {MenuItem} from "./MenuItem.js";

const template = document.createElement("template");

template.innerHTML =
`<style>

    :host  {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;

        display: inline-block;
        padding-left: 0.75em;
        padding-right: 0.75em;

        color: inherit;
        font-size: inherit;
        font-family: inherit;
    }

    /* don't show dotted lines when focused */
    :host(:focus) {
        outline: 0;
    }

    .name {
        color: var(--menu-name-color, inherit);
        font-size: var(--menu-name-font-size, inherit);
        font-family: var(--menu-name-font-family, inherit);
    }

    .items {

        color: var(--menu-item-color, inherit);
        background-color: var(--menu-item-background-color, white);
        font-size: var(--menu-item-font-size, inherit);
        font-family: var(--menu-item-font-family, inherit);

        display: none;
        position: fixed;
        border-style: solid;
        border-color: grey;
        border-width: 0.1em;
        padding: 0;
        margin: 0;
        line-height: 1.5em;
    }

</style>

<div class="name"></div>
<slot class="items"></slot>

`;

class DropdownMenu extends HTMLElement {

    constructor(name, menuItems = []) {
        super();
        this.selectionEvent = new Event("selection");

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.nameDisplay = this.shadowRoot.querySelector(".name");
        this.name = name;
        this.menuItems = this.shadowRoot.querySelector(".items");
        for (let i = 0; i < menuItems.length; i++) {
            this.addMenuItem(menuItems[i]);
        }

        this.isOpen = false;
        this.mouseClickHandler = this.handleMouseClick.bind(this);

        this.addEventListener("mousedown", (evt) => {
            if (evt.button > 0 || this.disabled) return;
            if (!this.isOpen) {
                this.open();
            } else {
                this.addEventListener("click", this.mouseClickHandler);
            }
        });

        this.addEventListener("blur", (evt) => {
            this.close();
        });
    }

    get name() {
        return this.nameDisplay.innerText;
    }

    set name(name) {
        this.nameDisplay.innerText = name;
    }

    connectedCallback() {
        this.tabIndex = 0;
        document.addEventListener("keydown", (evt) => {
            if (evt.key === "Escape") {
                this.close();
            }
        });
    }

    open() {
        this.menuItems.style.display = "block";
        this.isOpen = true;
    }

    close() {
        this.menuItems.style.display = "none";
        this.isOpen = false;
        this.removeEventListener("click", this.mouseClickHandler);
    }

    handleMouseClick() {
        if (this.isOpen) {
            this.close();
        }
    }

    getMenuItem(name) {
        for (const menuItem of this.children) {
            if (menuItem.name === name) {
                return menuItem;
            }
        }
    }

    addMenuItem(menuItem, opts = {}) {

        menuItem = (typeof menuItem === "string")? new MenuItem(menuItem, opts) : menuItem;
        if (opts.special == true) {
            menuItem.isSpecial = true;
        }
        menuItem.addEventListener("selection", (evt) => {
            this.selectionEvent.menuItem = menuItem;
            this.selectionEvent.value = evt.value;
            this.dispatchEvent(this.selectionEvent);
            this.close();
        });

        this.appendChild(menuItem);
        return menuItem;
    }

    removeMenuItem(name) {
        const menuItem = this.getMenuItem(name);
        if (menuItem) {
            menuItem.remove();
        }
    }

    removeMenuItemsByClass(className) {
        const array = this.querySelectorAll("." + className);
        for (const menuItem of array) {
            this.removeChild(menuItem);
        }
    }

    removeSpecialMenuItems(propertyName) {
        for (let i = this.children.length; i--;) {
            if (this.children[i].isSpecial) {
                this.removeChild(this.children[i]);
            }
        }
    }

    addDividerAfter(name) {
        const menuItem = this.getMenuItem(name);
        menuItem.style.borderBottom = "0.1em solid lightGrey";
    }

    resetToDefaultItems() {
        this.removeItemsByClass("special");
    }

    enableAllMenuItems() {
        for (const menuItem of this.children) {
            menuItem.removeAttribute("disabled");
        }
    }

    enableMenuItem(name) {
        const menuItem = this.getMenuItem(name);
        if (menuItem) {
            menuItem.enable();
        }
    }

    disableMenuItem(name) {
        const menuItem = this.getMenuItem(name);
        if (menuItem) {
            menuItem.disable();
        }
    }

    disable() {
        this.disabled = true;
        this.setAttribute("disabled", true);
    }

    enable() {
        this.disabled = false;
        this.removeAttribute("disabled", true);
    }
}

customElements.define("dropdown-menu", DropdownMenu);

export {DropdownMenu};