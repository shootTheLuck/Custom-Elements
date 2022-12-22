
import {BaseMenu} from "./BaseMenu.js";
import {MenuItem} from "./MenuItem.js";

const template = document.createElement("template");

template.innerHTML =
`<style>

    :host  {
        user-select: none;
        position: fixed;
        border-style: solid;
        display: none;
        z-index: 30;
        color: var(--dropdown-menu-color, inherit);
        background-color: var(--dropdown-menu-background-color, white);
        font-size: var(--dropdown-menu-font-size, inherit);
        font-family: var(--dropdown-menu-font-family, inherit);

        border-color: var(--dropdown-menu-border-color, grey);
        border-width: var(--dropdown-menu-border-width, 0.1em);
    }

    /* don't show dotted lines when focused */
    :host(:focus) {
        outline: 0;
    }

    .items {
        padding: 0;
        margin: 0;
        line-height: 1.5em;
    }

</style>

`;

class DropdownMenu extends BaseMenu {

    constructor(name, menuItems = []) {
        super(menuItems);
        this.name = name;
        // this.selectionEvent = new Event("selection");

        // this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // this.name = name;
        // this.menuItems = this.shadowRoot.querySelector(".items");
        // for (let i = 0; i < menuItems.length; i++) {
            // this.addMenuItem(menuItems[i]);
        // }

        // this.isOpen = false;
    }

}

customElements.define("dropdown-menu", DropdownMenu);

export {DropdownMenu};