
//makeElementDraggable adapted from https://www.w3schools.com/howto/howto_js_draggable.asp

function makeElementDraggable(element, dragger) {
    let initialOffsetLeft = 0;
    let initialOffsetTop = 0;
    const scrollMap = new Map();
    dragger.addEventListener("mousedown", startDrag);

    function traverseChildren(element, callback) {
        callback(element);
        if (element.children) {
            for (const child of element.children) {
                traverseChildren(child, callback);
            }
        }
    }

    function startDrag(evt) {
        if (evt.button === 0) {
            initialOffsetLeft = evt.clientX - element.offsetLeft;
            initialOffsetTop = evt.clientY - element.offsetTop;
            document.addEventListener("mouseup", endDrag, true);
            document.addEventListener("mousemove", drag, true);

            /* re-append to put this higher in the stacking context
             * delay to allow other elements to lose focus
             * preserve scroll for child elements
             */

            setTimeout(function() {
                traverseChildren(element, (el) => {
                    scrollMap.set(el, el.scrollTop);
                });
                element.parentElement.appendChild(element);
                traverseChildren(element, (el) => {
                    el.scrollTop = scrollMap.get(el);
                });
            }, 1);

        }
    }

    function drag(evt) {
        let top = Math.min(Math.max(evt.clientY, 0), window.innerHeight);
        element.style.top = top - initialOffsetTop + "px";
        element.style.left = (evt.clientX - initialOffsetLeft) + "px";
    }

    function endDrag() {
        document.removeEventListener("mouseup", endDrag, true);
        document.removeEventListener("mousemove", drag, true);
    }
}


const template = document.createElement("template");

template.innerHTML =
`<style>
    :host {

        /* theme overridable variables */

        --title-bar-color: var(--application-window-title-bar-color, white);
        --title-bar-background-color: var(--application-window-title-bar-background-color, rgba(50, 50, 50, 1.0));
        --title-bar-font-family: var(--application-window-title-bar-font-family, inherit);
        --title-bar-font-style: var(--application-window-title-bar-font-style, inherit);
        --title-bar-font-size: var(--application-window-title-bar-font-size, inherit);
        --title-bar-height: var(--application-window-title-bar-height, 1.75em);
        --close-button-color: var(--application-window-close-button-color, black);

        --color: var(--application-window-color, inherit);
        --background-color: var(--application-window-background-color, inherit);
        --font-family: var(--application-window-font-family, inherit);
        --font-style: var(--application-window-font-style, inherit);
        --font-size: var(--application-window-font-size, inherit);
        --border-width: var(--application-window-border-width, 3px);
        --border-color: var(--application-window-border-color, grey);
        --border-radius: var(--application-window-border-radius, 6px);

        border-style: solid;
        border-width: var(--border-width);
        border-color: var(--border-color);
        border-radius: var(--border-radius);
        box-sizing: border-box;
        color: var(--color);
        background-color: var(--background-color);
        font-family: var(--font-family);
        font-style: var(--font-style);
        font-size: var(--font-size);
        opacity: 1;
        position: absolute;

        /* set initial width and height */
        width: 400px;
        height: 400px;
        top: calc(50% - 200px);
        left: calc(50% - 200px);

        min-height: calc(var(--title-bar-height) + var(--border-width));
        min-width: 16em;
        transition: opacity 40ms linear;
        overflow: hidden;
        margin: 0;
        white-space: nowrap;
        user-select: none;
        flex-direction: column;
    }

    .title-bar {
        color: var(--title-bar-color);
        background-color: var(--title-bar-background-color);
        border-bottom: solid 3px;
        border-color: inherit;
        flex-shrink: 0;
        height: var(--title-bar-height);
        line-height: var(--title-bar-height);
        position: relative;
    }

    .title {
        user-select: none;
        font-size: var(--title-bar-font-size);
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0%);
        vertical-align: middle;
    }

    .close-button {
        background-color: rgba(180, 180, 180, 0);
        border: 2px solid rgba(180, 180, 180, 0);
        font-size: calc(2px + var(--title-bar-height) * 0.5);
        font-weight: 900;
        line-height: 0.9em;
        color: var(--close-button-color);
        padding: 0;
        margin: calc(var(--title-bar-height) * 0.15);
        float: right;
        vertical-align: middle;
    }

    .close-button:hover {
        border: 2px solid grey;
        background-color: rgb(180, 180, 180);
    }

    .close-button:focus {
        background-color: rgb(120,120,120);
    }

    .client-area {
        color: inherit;
        background-color: inherit;
        font-family: inherit;
        font-style: inherit;
        font-size: inherit;
        overflow: hidden;
        height: 100%;
        display: block;
        position: relative;
    }

</style>

<div class="title-bar">
    <span class="title"></span>
    <button class="close-button">&#x2715</button>
</div>

`;

class ApplicationWindow extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            title: "Application Window",
            draggable: true,
            closeable: true,
            isOpen: true,
        };

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.titleBar = this.shadowRoot.querySelector(".title-bar");
        this.titleDisplay = this.shadowRoot.querySelector(".title");
        this.closeButton = this.shadowRoot.querySelector(".close-button");
        this.clientArea = document.createElement("slot");
        this.clientArea.className = "client-area";
        this.shadowRoot.appendChild(this.clientArea);

        this.title = ((opts.title !== undefined)? opts.title : defaults.title);

        const draggable = (opts.draggable !== undefined)? opts.draggable : defaults.draggable;
        const closeable = (opts.closeable !== undefined)? opts.closeable : defaults.closeable;
        const open = (opts.isOpen !== undefined)? opts.isOpen : defaults.isOpen;

        if (draggable) {
            makeElementDraggable(this, this.titleBar);
        }
        if (closeable) {
            /* don't drag with closeButton */
            this.closeButton.addEventListener("mousedown", (evt) => {
                evt.stopPropagation();
            });
            this.closeButton.addEventListener("mouseleave", (evt) => {
                this.closeButton.blur();
            });
            this.closeButton.addEventListener("click", this.close.bind(this));

            this.addEventListener("transitionend", () => {
                if (!this.isOpen) {
                    this.style.display = "none";
                }
            });
        }
        if (open) {
            this.isOpen = true;
        } else {
            this.isOpen = false;
            this.style.display = "none";
        }

        this.openEvent = new Event("open");
        this.closeEvent = new Event("close");
    }

    connectedCallback() {

    }

    set title(text) {
        this.titleDisplay.textContent = text;
    }

    get title() {
        return this.titleDisplay.textContent;
    }

    addMarkup(string) {
        // package in an element with a named slot
        // so it can be styled by global css
        const div = document.createElement("div");
        // div.setAttribute("slot", "client-area");
        div.insertAdjacentHTML("beforeend", string);
        this.append(div);
    }

    addShadow(element, clone) {
        var contentDiv = document.createElement("div");
        if (clone) {
            contentDiv.attachShadow({mode: "open"}).appendChild(element.cloneNode(true));
        } else {
            contentDiv.attachShadow({mode: "open"}).appendChild(element);
        }
        this.clientArea.appendChild(contentDiv);
    }

    close() {
        this.isOpen = false;
        this.style.opacity = 0;
        this.dispatchEvent(this.closeEvent);
    }

    open() {
        this.isOpen = true;
        this.style.opacity = 1.0;
        this.style.display = "flex";
        /* re-append to put this higher in the stacking context */
        this.parentElement.appendChild(this);
        this.dispatchEvent(this.openEvent);
    }

    maximize() {
        this.style.left = 0;
        this.style.top = 0;
        this.style.width = "100%";
        this.style.height = "100%";
    }
}

customElements.define("application-window", ApplicationWindow);

export {ApplicationWindow};
