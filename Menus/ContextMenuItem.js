
import {MenuItem} from "./MenuItem.js";

class ContextMenuItem extends MenuItem {

    constructor(name, opts = {icon: null, toolTip: null, className: null}) {
        super(name, opts);

    }


    connectedCallback() {
        super.connectedCallback();

    }
}

export {ContextMenuItem};