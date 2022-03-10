
import {BaseMenu} from "./BaseMenu.js";

const template = document.createElement("template");

template.innerHTML =
`<style>

    :host  {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        position: fixed;
        border-style: solid;
        display: none;
        z-index: 30;
        color: var(--context-menu-color, inherit);
        background-color: var(--context-menu-background-color, white);
        font-size: var(--context-menu-font-size, inherit);
        font-family: var(--context-menu-font-family, Arial, Helvetica, sans-serif);

        border-color: var(--context-menu-border-color, grey);
        border-width: var(--context-menu-border-width, 0.1em);
        border-radius: var(--context-menu-border-radius, 0);
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
class ContextMenu extends BaseMenu {

    constructor(name, menuItems = []) {
        super(name, menuItems);
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.autoDisplay = true;
        this.positionedFromParent = true;

        this.previousFocusedElement = null;
        this.targetElement = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.style.position = "absolute";
        this.style.padding = "0";

        this.parentElement.addEventListener("contextmenu", (evt) => {
            if (this.autoDisplay) {
                this.open(evt);
            }
        });

        this.addEventListener("blur", (evt) => {
            this.close();
        });
    }

    /* override */
    open(evt, specialLineItem) {
        super.open();
        this.tabIndex = 0;

        evt.preventDefault();
        evt.stopPropagation();
        let x = evt.clientX;
        let y = evt.clientY;

        this.removeSpecialMenuItems();

        if (specialLineItem) {
            const menuItem = this.addMenuItem(specialLineItem);
            menuItem.isSpecial = true;
        }

        let rect = this.getBoundingClientRect();
        let parentRect = this.parentElement.getBoundingClientRect();
        let sWidth = window.innerWidth;
        let sHeight = window.innerHeight;

        if (x + rect.width > sWidth) {
            x -= rect.width;
        }

        if (y + rect.height > sHeight) {
            y -= rect.height;
        }

        if (this.positionedFromParent) {
            this.style.left = x - parentRect.left + "px";
            this.style.top = y - parentRect.top + "px";
        } else {
            this.style.left = x  + "px";
            this.style.top = y + window.scrollY + "px";
        }

        this.itemSelected = null;
        this.targetElement = evt.target;
        this.previousFocusedElement = document.activeElement;
        this.focus();
    }

    close() {
        super.close();
        this.tabIndex = -1;

        if (this.previousFocusedElement) {
            this.previousFocusedElement.focus();
        }
    }

    removeSpecialMenuItems(propertyName) {
        for (let i = this.children.length; i--;) {
            if (this.children[i].isSpecial) {
                this.removeChild(this.children[i]);
            }
        }
    }

}

customElements.define("context-menu", ContextMenu);

export {ContextMenu};