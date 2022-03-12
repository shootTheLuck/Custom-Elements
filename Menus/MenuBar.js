
import {DropdownMenu} from "./DropdownMenu.js";

const template = document.createElement("template");

template.innerHTML =
`<style>
    :host {
        border-bottom: var(--menu-bar-border-bottom, 3px solid red);
        background-color: var(--menu-bar-background-color, rgba(50, 50, 50, 0.1));
        height: var(--menu-bar-height, 32px);
        line-height: var(--menu-bar-height, 32px);
        font-family: var(--menu-bar-font-family, Arial, Helvetica, sans-serif);
        font-size: var(--menu-bar-font-size, 0.975em);

        display: block;
        width: 100%;
        padding: 0;
        margin: 0;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
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

        const nameDisplay = document.createElement("label");
        nameDisplay.style.display = "inline-block";
        nameDisplay.style.padding = "0 0.75em 0 0.75em";
        nameDisplay.tabIndex = 0;
        nameDisplay.innerText = menu.name;
        nameDisplay.appendChild(menu);

        this.appendChild(nameDisplay);

        const closeOnSecondClick = () => {
            if (menu.isOpen) {
                menu.close();
                nameDisplay.removeEventListener("click", closeOnSecondClick);
            }
        };

        nameDisplay.addEventListener("mousedown", (evt) => {
            if (evt.button > 0 || menu.disabled) return;
            if (!menu.isOpen) {
                menu.open();
                menu.focus();
            } else {
                nameDisplay.addEventListener("click", closeOnSecondClick);
            }
        });

        nameDisplay.addEventListener("blur", (evt) => {
            menu.close();
            nameDisplay.removeEventListener("click", closeOnSecondClick);
        });

        nameDisplay.addEventListener("mouseenter", (evt) => {
            let aMenuIsOpen = false;
            for (const child of this.children) {
                let dropdown = child.children[0];
                if (dropdown instanceof DropdownMenu && dropdown.isOpen) {
                    dropdown.close();
                    aMenuIsOpen = true;
                }
            }
            if (aMenuIsOpen) {
                menu.open();
                nameDisplay.focus();
            }
        });

        menu.addEventListener("selection", (evt) => {
            this.selectionEvent.menu = menu;
            this.selectionEvent.menuItem = evt.menuItem;
            this.selectionEvent.value = evt.value;
            this.dispatchEvent(this.selectionEvent);
            nameDisplay.removeEventListener("click", closeOnSecondClick);
        });

        return menu;
    }

}


customElements.define("menu-bar", MenuBar);

export {MenuBar};