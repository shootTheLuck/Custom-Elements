
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

        /*  theme overridable variables
         *  replace "--" with "--modal-window-"
         */

        --border-width: 3px;
        --border-color: grey;
        --border-radius: 6px;
        --title-color: white;
        --title-bar-background-color: rgba(50, 50, 50, 1.0);
        --background-color: rgba(10, 10, 10, 1.0);
        --color: white;

        border-style: solid;
        border-width: var(--modal-window-border-width, var(--border-width));
        border-color: var(--modal-window-border-color, var(--border-color));
        border-radius: var(--modal-window-border-radius, var(--border-radius));
        color: var(--color);
        background-color: var(--background-color);
        opacity: 1;
        position: absolute;
        top: 30%;
        left: 35%;
        width: 400px;
        transition: opacity 40ms linear;
        overflow: hidden;
        resize: both;
        white-space: nowrap;
        user-select: none;

        display: none;
        flex-direction: column;
    }

    .title-bar {
        border-bottom: solid 3px;
        border-color: var(--modal-window-border-color, inherit);
        background-color: var(--modal-window-title-bar-background-color, var(--title-bar-background-color));
        flex-shrink: 0;
        height: 32px;
        line-height: 32px;
        width: 100%;
    }

    .title {
        color: var(--modal-window-title-color, var(--title-color));
        user-select: none;
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0%);
        vertical-align: middle;
    }

    .client-area {
        color: var(--modal-window-color, inherit);
        background-color: var(--modal-window-background-color, inherit);
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

<slot class="client-area">

</slot>
`;

class ModalWindow extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            resize: "both", //"none", "vertical", "horizontal"
            title: "Modal Window"
        };

        this.resize = opts.resize || defaults.resize;

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.titleBar = this.shadowRoot.querySelector(".title-bar");
        this.titleDisplay = this.shadowRoot.querySelector(".title");
        makeElementDraggable(this, this.titleBar);
        this.setTitle(opts.title || defaults.title);

        this.closeButton = this.shadowRoot.querySelector(".close-button");
        this.closeButton.addEventListener("click", this.close.bind(this));

        this.clientArea = this.shadowRoot.querySelector(".client-area");

        this.openEvent = new Event("open");
        this.closedEvent = new Event("closed");
        this.closed = true;
    }

    connectedCallback() {
        // override appendChild
        this.appendChild = function(element) {
            this.clientArea.appendChild(element);
            return element;
        };

        this.style.resize = this.resize;
    }

    setTitle(text) {
        this.titleDisplay.textContent = text;
    }

    addMarkup(string) {
        this.clientArea.insertAdjacentHTML("beforeend", string);
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
}

customElements.define("modal-window", ModalWindow);

export {ModalWindow};
