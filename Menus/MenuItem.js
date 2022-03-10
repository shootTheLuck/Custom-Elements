
const template = document.createElement("template");

template.innerHTML =
`<style>

    :host {
        display: block;
        position: relative;

        color: var(--menu-item-color, inherit);
        background-color: var(--menu-item-background-color, inherit);
        font-size: var(--menu-item-font-size, inherit);
        font-family: var(--menu-item-font-family, inherit);

    }

    :host(:hover) {
        color: var(--menu-item-color-hover, white);
        background-color: var(--menu-item-background-color-hover, red);
    }

    :host([disabled]) {
        color: grey;
        background-color: inherit;
    }

    .icon {
        margin: 0 2px 0 5px;
    }

    .name {
        margin: 0 20px 0 5px;
        font-size: inherit;
    }

    .toolTip {
        padding: 0 2px 0 2px;
    }

</style>

<span class="icon"></span>
<span class="name"></span>
<span class="tooltip"></span>

`;

class MenuItem extends HTMLElement {

    constructor(name, opts = {icon: null, toolTip: null, special: false}) {
        super();
        this.selectionEvent = new Event("selection");

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.iconDisplay = this.shadowRoot.querySelector(".icon");
        if (opts.icon) {
            var icon = document.createElement("span");
            icon.innerText = "x";
            icon.className = "icon";
            this.iconDisplay.appendChild(icon);
        }

        this.nameDisplay = this.shadowRoot.querySelector(".name");
        this.name = name;

        this.tooltipDisplay = this.shadowRoot.querySelector(".tooltip");
        if (opts.toolTip) {
            var toolTip = document.createElement("span");
            toolTip.innerText = "x";
            toolTip.className = "tooltip";
            this.tooltipDisplay.appendChild(toolTip);
        }

        this.addEventListener("click", (evt) => {
            if (!this.disabled) {
                this.selectionEvent.value = this.name;
                this.dispatchEvent(this.selectionEvent);
            }
        });

    }

    connectedCallback() {

    }

    get name() {
        return this.nameDisplay.innerText;
    }

    set name(name) {
        this.nameDisplay.innerText = name;
    }

    disable() {
        this.disabled = true;
        this.setAttribute("disabled", true);
    }

    enable() {
        this.disabled = false;
        this.removeAttribute("disabled");
    }

}

customElements.define("menu-item", MenuItem);

export {MenuItem};