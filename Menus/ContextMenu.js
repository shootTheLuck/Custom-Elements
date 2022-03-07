
import {DropdownMenu} from "./DropdownMenu.js";

class ContextMenu extends DropdownMenu {

    constructor(name, menuItems = []) {
        super(name, menuItems);

        this.autoDisplay = true;
        this.positionedFromParent = true;

        this.previousFocusedElement = null;
        this.targetElement = null;
        this.itemHovered = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.style.position = "absolute";
        this.style.padding = "0";

        this.nameDisplay.style.display = "none";
        this.menuItems.style.color = "var(--context-menu-items-color, inherit)";
        this.menuItems.style.backgroundColor = "var(--context-menu-items-background-color, white)";
        this.menuItems.style.borderColor = "var(--context-menu-items-border-color, grey)";
        this.menuItems.style.borderWidth = "var(--context-menu-items-border-width, 0.1em)";

        this.parentElement.addEventListener("contextmenu", (evt) => {
            if (this.autoDisplay) {
                this.open(evt);
            }
        });
    }

    /* override */
    open(evt, specialLineItem) {
        super.open();
        evt.preventDefault();
        evt.stopPropagation();
        let x = evt.clientX;
        let y = evt.clientY;

        this.removeSpecialMenuItems();

        if (specialLineItem) {
            this.addMenuItem(specialLineItem, {special: true});
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

        this.itemHovered = null;
        this.itemSelected = null;
        this.targetElement = evt.target;
        this.previousFocusedElement = document.activeElement;
        this.focus();
    }

    close() {
        super.close();
        if (this.previousFocusedElement) {
            this.previousFocusedElement.focus();
        }
    }

    addMenuItem(menuItem, opts = {}) {
        const contextMenuItem = super.addMenuItem(menuItem, opts);
        // contextMenuItem.style.backgroundColor = "var(--context-menu-items-background-color, purple)";
    }

}

customElements.define("context-menu", ContextMenu);

export {ContextMenu};