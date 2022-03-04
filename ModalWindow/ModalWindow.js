
//makeElementDraggable adapted from https://www.w3schools.com/howto/howto_js_draggable.asp

function makeElementDraggable(element, dragger) {
    var initialOffsetLeft = 0;
    var initialOffsetTop = 0;
    dragger.addEventListener("mousedown", startDrag);

    function startDrag(evt) {
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


class ModalWindow extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            className: "modalWindow",
            width: "400px",
            resize: "both", //"none", "vertical", "horizontal"
            title: "Modal Window"
        };

        this.className = opts.className || defaults.className;
        this.style.width = opts.width || defaults.width;
        this.style.resize = opts.resize || defaults.resize;

        this.topBar = document.createElement("div");
        this.topBar.className = this.className + "-title-bar";
        this.appendChild(this.topBar);

        this.titleText = document.createElement("span");
        this.titleText.className = this.className + "-title";
        this.topBar.appendChild(this.titleText);

        this.closeButton = document.createElement("button");
        this.closeButton.className = this.className + "-closeButton";
        this.closeButton.addEventListener("click", this.close.bind(this));
        this.topBar.appendChild(this.closeButton);

        makeElementDraggable(this, this.topBar);
        this.setTitle(opts.title || defaults.title);

        this.clientArea = document.createElement("div");
        this.clientArea.className = this.className + "-client-area";
        this.appendChild(this.clientArea);

        this.openEvent = new Event("open");
        this.closedEvent = new Event("closed");
        this.closed = true;
        this.init();
    }

    init() {
        // override appendChild
        this.appendChild = function(element) {
            this.clientArea.appendChild(element);
            return element;
        }
    }

    setTitle(text) {
        this.titleText.textContent = text;
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
