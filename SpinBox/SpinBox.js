/*
 * Spinbox custom element.
 * Adapted from Kate Morley
 * http://code.iamkate.com/javascript/spin-box-widget/ CC0 1.0
 *
 * Set value with .setValue method
 * Get value with .getValue method
 * Listen for changes by adding event listener:
 *
 *  spinBox.addEventListener("change", function(evt) {
 *      console.log("spinBox value now", evt.target.value);
 *      //console.log("make sure", spinBox.getValue());
 *  }, false);
 *
 */


const template = document.createElement('template');

template.innerHTML =
`<style>
/*
    Adapted from Kate Morley
    http://code.iamkate.com/javascript/spin-box-widget/ CC0 1.0
*/

:host {
    border-color: rgb(132, 132, 132);
    border-radius: 0.2em;

    font-family: sans-serif;
    font-size: 0.9em;
    padding: 0;
    margin: inherit;
    position: relative;
    display: inline-block;
    width: 10em;
}

input {

    background-color: inherit;
    border-color: inherit;
    border-style: solid;
    border-width: 0.1em;
    border-right: none;
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
    color: inherit;

    font-family: inherit;
    font-size: inherit;
    padding: 0.1em 0.2em 0.1em 0;
    text-align: right;

    box-sizing: border-box;
    /* width of whole - button width + border width */
    width: calc(100% - 1.32em + 0.1em);
}

input:focus {
    outline: none;
}

input::selection {
/*
    background: #1A7FEB;
    background: #0074E8;
*/
    background: #2084E8;
    color: white;
}

input[disabled] {
    background: rgb(240, 240, 240);
    color: rgb(100, 100, 100);
}

.buttons {
    display: inline-block;
    border-color: inherit;
    border-radius: inherit;
}

button {
    background-color: inherit;
    border-style: solid;
    border-color: inherit;
    border-width: 0.11em;
    display: block;

    /* half of border + half of height */
    height: calc(0.05em + 100% / 2);
    width: 1.32em;
    position: absolute;
    box-sizing: border-box;
    left: calc(100% - 1.32em);
}

button:hover {
    background-color: rgb(220, 220, 220);
}

button:active {
    background-color: rgb(190, 190, 190);
}

.up-button {
    top: 0;
    border-top-right-radius: inherit;
}

.down-button {
    bottom: 0;
    border-bottom-right-radius: inherit;
}

.up-arrow, .down-arrow {

    /* "border" makes the arrow using same color as border color */
    border-color: inherit;
    border-style: solid;
    border-width: 0 0.125em 0.125em 0;
    display: inline-block;
    left: 50%;

    /* padding sets size of arrow */
    padding: 2px;
    position: absolute;
}

.up-arrow {
    top: 64%;
    transform: translate(-50%, -50%) rotate(-135deg);
}

.down-arrow {
    top: 40%;
    transform: translate(-50%, -50%) rotate(45deg);
}

</style>

<input>
<div class="buttons">
    <button tabindex="-1" class="up-button">
        <i class="up-arrow"></i>
    </button>
    <button tabindex="-1" class="down-button">
        <i class="down-arrow"></i>
    </button>
</div>
`


class SpinBox extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            step: 1,
            decimals: 0,
            max: Infinity,
            min: -Infinity,
            initialSpeed: 10,
            highSpeed: 2,
            increaseSpeedAfter: 4, //steps
            value: 0,
        };

        this.step = opts.step ||
                parseFloat(this.getAttribute("step")) || defaults.step;
        this.decimals = opts.decimals ||
                parseFloat(this.getAttribute("decimals")) || defaults.decimals;
        this.min = (!isNaN(opts.min))? opts.min :
                parseFloat(this.getAttribute("min")) || defaults.min;
        this.max = (!isNaN(opts.max))? opts.max :
                parseFloat(this.getAttribute("max")) || defaults.max;
        this.initialSpeed = opts.initialSpeed ||
                parseFloat(this.getAttribute("initialSpeed")) || defaults.initialSpeed;
        this.highSpeed = opts.highSpeed ||
                parseFloat(this.getAttribute("highSpeed")) || defaults.highSpeed;
        this.increaseSpeedAfter = opts.increaseSpeedAfter ||
                parseFloat(this.getAttribute("increaseSpeedAfter")) || defaults.increaseSpeedAfter;
        this.value = opts.value ||
                parseFloat(this.getAttribute("value")) || defaults.value;

        this.currentSpeed = 0;
        this.numOfTimes = 0;
        this.timer = 0;
        this.animation = null;

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.input = this.shadowRoot.querySelector("input");
        this.input.value = this.value.toFixed(this.decimals);

        this.input.addEventListener("focus", this.input.select);
        this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.input.addEventListener("blur", this.handleFocusOut.bind(this));

        // /* don't let input element send its own event */
        this.input.addEventListener("change", (evt) => {
            evt.stopImmediatePropagation();
        });

        const resetDynamics = () => {
            this.timer = 0;
            this.numOfTimes = 0;
            this.currentSpeed = this.initialSpeed;
        };

        const upButton = this.shadowRoot.querySelector(".up-button");
        upButton.addEventListener("mousedown", (evt) => {
            resetDynamics();
            this.animation = requestAnimationFrame(this.stepValue.bind(this, this.step));
        });

        const downButton = this.shadowRoot.querySelector(".down-button");
        downButton.addEventListener("mousedown", (evt) => {
            resetDynamics();
            this.animation = requestAnimationFrame(this.stepValue.bind(this, -this.step));
        });

        [upButton, downButton].forEach((button) => {
            button.addEventListener("mouseup", (evt) => {
                cancelAnimationFrame(this.animation);
            });
            button.addEventListener("mouseleave", (evt) => {
                cancelAnimationFrame(this.animation);
            });
        });

        document.addEventListener("wheel", this.handleMouseWheel.bind(this));

        this.changeEvent = new Event("change");

        if (opts.disabled ||
            this.getAttribute("disabled") === "" ||
            this.getAttribute("disabled") === true) {
            this.disabled = true;
        }

    }

    set disabled(bool) {
        this.input.disabled = bool;
    }

    get disabled() {
        return this.input.disabled;
    }

    handleFocusOut(evt) {
        if (!this.contains(evt.relatedTarget)) {
            let value = this.getValue();
            this.changeValue(value, false);
        }
    }

    handleMouseWheel(evt) {
        if (document.activeElement === this.input) {
            let direction = (evt.deltaY < 0)? 1 : -1;
            let value = this.getValue();
            this.changeValue(value + this.step * direction);
        }
    }

    handleKeyDown(evt) {
        if (evt.key === "Enter") {
            evt.preventDefault();
            let value = this.getValue();
            this.changeValue(value);
        }
        if (evt.key === "ArrowUp") {
            evt.preventDefault();
            let value = this.getValue();
            this.changeValue(value + this.step);
        }
        if (evt.key === "ArrowDown") {
            evt.preventDefault();
            let value = this.getValue();
            this.changeValue(value - this.step);
        }
    }

    stepValue(stepAmount) {
        if (this.input.disabled) return;

        if (this.timer > this.currentSpeed) {
            this.timer = 0;
        }

        if (this.timer === 0) {
            let value = this.getValue();
            value += stepAmount;
            this.changeValue(value);
            this.numOfTimes += 1;
        }

        if (this.numOfTimes > this.increaseSpeedAfter) {
            this.currentSpeed = Math.max(this.currentSpeed * 0.9, this.highSpeed);
        }

        this.timer += 1;
        this.animation = requestAnimationFrame(() => this.stepValue(stepAmount));
    }

    getValue() {
        console.log(typeof this.input.value);
        let value = parseFloat(this.input.value);
        return value;
    }

    setValue(value) {
        value = Math.max(this.min, value);
        value = Math.min(this.max, value);

        this.value = value;
        this.input.value = value.toFixed(this.decimals);
    }

    changeValue(value, isFocused = true) {
        if (isNaN(value)) value = this.value;
        this.setValue(value);
        if (isFocused) {
            this.input.select();
            this.dispatchEvent(this.changeEvent);
        }
    }
}

customElements.define("spin-box", SpinBox);

export {SpinBox};