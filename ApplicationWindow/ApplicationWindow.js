
//makeElementDraggable adapted from https://www.w3schools.com/howto/howto_js_draggable.asp

function makeElementDraggable(element, dragger) {
    var initialOffsetLeft = 0;
    var initialOffsetTop = 0;
    dragger.addEventListener("mousedown", startDrag);

    function startDrag(evt) {
        if (evt.button === 0) {
            initialOffsetLeft = evt.clientX - element.offsetLeft;
            initialOffsetTop = evt.clientY - element.offsetTop;
            document.addEventListener("mouseup", endDrag, true);
            document.addEventListener("mousemove", drag, true);
            /* re-append to put this higher in the stacking context */
            /* delay to allow other elements to lose focus */
            setTimeout(function() {
                element.parentElement.appendChild(element);
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


const template = document.createElement('template');

template.innerHTML =
`<style>
    :host {

        /*  theme overridable variables */

        --title-bar-color: var(--application-window-title-bar-color, white);
        --title-bar-background-color: var(--application-window-title-bar-color, rgba(50, 50, 50, 1.0));
        --title-bar-font-family: var(--application-window-title-bar-font-family, inherit);
        --title-bar-font-style: var(--application-window-title-bar-font-style, inherit);
        --title-bar-font-size: var(--application-window-title-bar-font-size, inherit);

        --color: var(--application-window-color, white);
        --background-color: var(--application-window-background-color, rgba(10, 10, 10, 1.0));
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
        top: 30%;
        left: 35%;
        width: 400px;
        transition: opacity 40ms linear;
        overflow: hidden;
        margin: 0;
        resize: both;
        white-space: nowrap;
        user-select: none;

        display: none;
        flex-direction: column;
    }

    .title-bar {
        color: var(--title-bar-color);
        background-color: var(--title-bar-background-color);
        border-bottom: solid 3px;
        border-color: inherit;
        flex-shrink: 0;
        height: 32px;
        line-height: 32px;
        width: 100%;
    }

    .title {
        user-select: none;
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0%);
        vertical-align: middle;
    }

    .client-area {
        color: inherit;
        background-color: inherit;
        font-family: inherit;
        font-style: inherit;
        font-size: inherit;
        overflow: auto;
        padding: 5px;
        height: 100%;
        display: block;
        position: relative;
    }

    .close-button {
        background-color: rgba(180, 180, 180, 0);
        border: 2px solid rgba(180, 180, 180, 0);
        margin: 3px;
        height: 22px;
        width: 22px;
        padding: 0;
        position: absolute;
        left : 100%;
        transform: translate(-30px,0);
    }

    .close-button:hover,
    .close-button:focus {
        border: 2px solid grey;
        background-color: rgb(180, 180, 180);
        /*
        cursor: pointer;
        */
    }

    .close-button:active {
        background-color: rgb(120,120,120);
    }

    /* https://stackoverflow.com/questions/18920542/draw-an-x-in-css*/

    .close-button:before,
    .close-button:after{
        content: '';
        position: absolute;
        width: 12px;
        height: 2px;
        /* background-color will be color of the x*/
        background-color: black;
    }

    .close-button:before{
        transform: translate(1px, -1px) rotate(45deg) ;
        left: 2px;
    }
    .close-button:after{
        transform: translate(-1px, -1px) rotate(-45deg) ;
        right: 2px;
    }
</style>

<div class="title-bar">
    <span class="title"></span>
    <button class="close-button"></button>
</div>

<slot name="client-area" class="client-area">

</slot>
`;

class ApplicationWindow extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            title: "Application Window",
            resize: "both", //"none", "vertical", "horizontal"
            draggable: true,
            closeable: true,
        };

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.titleBar = this.shadowRoot.querySelector(".title-bar");
        this.titleDisplay = this.shadowRoot.querySelector(".title");
        this.closeButton = this.shadowRoot.querySelector(".close-button");
        this.clientArea = this.shadowRoot.querySelector(".client-area");

        this.setTitle(opts.title || defaults.title);
        this.resize = (opts.resize !== undefined)? opts.resize : defaults.resize;

        const draggable = (opts.draggable !== undefined)? opts.draggable : defaults.draggable;
        const closeable = (opts.closeable !== undefined)? opts.closeable : defaults.closeable;

        if (draggable) {
            makeElementDraggable(this, this.titleBar);
        }
        if (closeable) {
            this.closeButton.addEventListener("click", this.close.bind(this));
        }

        this.openEvent = new Event("open");
        this.closedEvent = new Event("closed");
        this.closed = true;

        // override appendChild
        // give element a named slot so it can be styled by global css
        this.appendChild = function(element) {
            element.setAttribute("slot", "client-area");
            this.append(element);
            return element;
        };
    }

    connectedCallback() {
        this.style.resize = this.resize;
    }

    setTitle(text) {
        this.titleDisplay.textContent = text;
    }

    addMarkup(string) {
        // package in an element with a named slot
        // so it can be styled by global css
        const div = document.createElement("div");
        div.setAttribute("slot", "client-area");
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
        if (!this.closed) {
            this.closed = true;
            this.style.opacity = 0;
            this.addEventListener("transitionend", () => {
                if (this.closed) {
                    this.style.display = "none";
                }
            });
            this.dispatchEvent(this.closedEvent);
        }
    }

    open() {
        if (this.closed) {
            this.closed = false;
            this.style.opacity = 1.0;
            this.style.display = "flex";
            /* re-append to put this higher in the stacking context */
            this.parentElement.appendChild(this);
            this.dispatchEvent(this.openEvent);
        }
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
