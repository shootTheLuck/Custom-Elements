
import {DropdownMenu} from "./DropdownMenu.js";

const template = document.createElement("template");

template.innerHTML =
`<style>
    :host {
        position: absolute;
        top: 0;
        left: 0;
        border-bottom: 3px solid red;
        background-color: rgba(50, 50, 50, 0.1);
        height: 32px;
        line-height: 32px;
        width: 100%;
        padding: 0;
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 0.975em;
    }

</style>

<slot></slot>
`;


class MenuBar extends HTMLElement {

    constructor(opts = {}) {
        super();
        this.selectionEvent = new Event("selection");

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

    }

    connectedCallback() {

    }

    addDropdownMenu(menu, menuItems = []) {

        menu = (typeof menu === "string")? new DropdownMenu(menu, menuItems) : menu;
        this.appendChild(menu);

        menu.addEventListener("selection", (evt) => {
            this.selectionEvent.menu = menu;
            this.selectionEvent.menuItem = evt.menuItem;
            this.selectionEvent.value = evt.value;
            this.dispatchEvent(this.selectionEvent);
        });

        menu.addEventListener("mouseenter", (evt) => {
            for (const child of this.children) {
                if (child instanceof DropdownMenu && child.isOpen) {
                    menu.open();
                    menu.focus();
                }
            }
        });

        return menu;
    }

}


customElements.define("menu-bar", MenuBar);

export {MenuBar};