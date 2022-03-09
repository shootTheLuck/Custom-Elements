
import {MenuItem} from "./MenuItem.js";

const template = document.createElement("template");

template.innerHTML =
`<style>

    :host  {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;


        display: none;
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        position: fixed;
        border-style: solid;
        border-color: grey;
        border-width: 0.1em;
        background-color: red;
    }

    /* don't show dotted lines when focused */
    :host(:focus) {
        outline: 0;
    }

    .items {

        color: var(--menu-item-color, inherit);
        background-color: var(--menu-item-background-color, white);
        font-size: var(--menu-item-font-size, inherit);
        font-family: var(--menu-item-font-family, inherit);

        padding: 0;
        margin: 0;
        line-height: 1.5em;
    }

</style>

<slot class="items"></slot>

`;

class DropdownMenu extends HTMLElement {

    constructor(name, menuItems = []) {
        super();
        this.selectionEvent = new Event("selection");

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.name = name;
        this.menuItems = this.shadowRoot.querySelector(".items");
        for (let i = 0; i < menuItems.length; i++) {
            this.addMenuItem(menuItems[i]);
        }

        this.isOpen = false;
    }

    connectedCallback() {
        document.addEventListener("keydown", (evt) => {
            if (evt.key === "Escape") {
                this.close();
            }
        });
    }

    open() {
        this.style.display = "block";
        this.isOpen = true;
    }

    close() {
        this.style.display = "none";
        this.isOpen = false;
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