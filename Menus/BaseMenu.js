
import {MenuItem} from "./MenuItem.js";

const template = document.createElement("template");

template.innerHTML =`
    <slot class="items"></slot>
`;

class BaseMenu extends HTMLElement {

    constructor(menuItems = []) {
        super();
        this.selectionEvent = new Event("selection");

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // this.name = name;
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


customElements.define("base-menu", BaseMenu);

export {BaseMenu};
