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
    background-color: white;
    border-color: rgb(132, 132, 132);
    border-radius: 0.2em;
    color: initial;

    font-family: sans-serif;
    font-size: 0.9em;
    padding: 0;
    margin: inherit;
    position: relative;
    display: inline-block;
    width: 10em;
}

input {
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

/* make arrows using same color as border */
.up-arrow,
.down-arrow {
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
`;


class SpinBox extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            step: 1,
            decimals: 0,
            max: Infinity,
            min: -Infinity,
            initialSpeed: 200,
            highSpeed: 20,
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
        this._value = opts.value ||
                parseFloat(this.getAttribute("value")) || defaults.value;

        this.currentSpeed = 0;
        this.numOfTimes = 0;
        this.timer = 0;
        this.animation = null;

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.input = this.shadowRoot.querySelector("input");
        this.input.value = this._value.toFixed(this.decimals);

        this.input.addEventListener("focus", this.input.select);
        this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.input.addEventListener("blur", this.handleFocusOut.bind(this));

        // /* don't let input element send its own event */
        this.input.addEventListener("change", (evt) => {
            evt.stopImmediatePropagation();
        });

        const resetDynamics = () => {
            this.numOfTimes = 0;
            this.currentSpeed = this.initialSpeed;
            this.timer = performance.now() - this.currentSpeed;
        };

        const upButton = this.shadowRoot.querySelector(".up-button");
        upButton.addEventListener("mousedown", (evt) => {
            if (evt.button === 0) {
                resetDynamics();
                this.stepValue(this.step);
            }
        });

        const downButton = this.shadowRoot.querySelector(".down-button");
        downButton.addEventListener("mousedown", (evt) => {
            if (evt.button === 0) {
                resetDynamics();
                this.stepValue(-this.step);
            }
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

    set value(amount) {
        amount = Math.max(this.min, amount);
        amount = Math.min(this.max, amount);

        this._value = amount;
        this.input.value = amount.toFixed(this.decimals);
    }

    get value() {
        return this._value;
    }

    handleFocusOut(evt) {
        if (!this.contains(evt.relatedTarget)) {
            this.value = this.validate(this.value);
        }
    }

    handleMouseWheel(evt) {
        if (document.activeElement === this) {
            let direction = (evt.deltaY < 0)? 1 : -1;
            this.value = this.validate(this._value + this.step * direction);
            this.dispatchEvent(this.changeEvent);
            this.input.select();
        }
    }

    handleKeyDown(evt) {
        if (evt.key === "Enter") {
            evt.preventDefault();
            this.value = this.validate(this.input.value);
            this.dispatchEvent(this.changeEvent);
        }
        if (evt.key === "ArrowUp") {
            evt.preventDefault();
            this.value = this.validate(this.value + this.step);
            this.dispatchEvent(this.changeEvent);
            this.input.select();
        }
        if (evt.key === "ArrowDown") {
            evt.preventDefault();
            this.value = this.validate(this.value - this.step);
            this.dispatchEvent(this.changeEvent);
            this.input.select();
        }
    }

    validate(value) {
        if (isNaN(value)) value = this._value;
        value = Math.max(this.min, value);
        value = Math.min(this.max, value);
        return value;
    }

    stepValue(stepAmount) {
        if (this.input.disabled) return;

        const now = performance.now();
        if (now - this.timer > this.currentSpeed) {
            this.value += stepAmount;
            this.dispatchEvent(this.changeEvent);
            this.input.select();
            this.numOfTimes += 1;
            this.timer = now;
        }

        if (this.numOfTimes > this.increaseSpeedAfter) {
            this.currentSpeed = Math.max(this.currentSpeed * 0.9, this.highSpeed);
        }

        this.animation = requestAnimationFrame(() => this.stepValue(stepAmount));
    }

    /* keeping for backwards compatibility */
    getValue() {
        return this.value;
    }

    setValue(amount) {
        this.value = amount;
    }
}

customElements.define("spin-box", SpinBox);

export {SpinBox};