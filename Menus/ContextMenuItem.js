
import {MenuItem} from "./MenuItem.js";

class ContextMenuItem extends MenuItem {

    connectedCallback() {
        super.connectedCallback();
        // this.style.color = "var(--context-menu-item-color, inherit)";
        // this.style.color = "var(--context-menu-item-color, inherit)";
        // this.style.backgroundColor = "var(--context-menu-item-background-color, white)";
    }
}

customElements.define("context-menu-item", ContextMenuItem);

export {ContextMenuItem};