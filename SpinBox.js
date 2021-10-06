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
 * Depends spinbox.css
 */

class SpinBox extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            className: "spinBox",
            step: 1,
            decimals: 0,
            max: Infinity,
            min: -Infinity,
            initialSpeed: 10,
            highSpeed: 2,
            increaseSpeedAfter: 4, //steps
            value: 0,
        };

        this.className =
                opts.className || this.getAttribute("class") || defaults.className;
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

        const initialValue = opts.value ||
                parseFloat(this.getAttribute("value")) || defaults.value;

        this.currentSpeed = 0;
        this.numOfTimes = 0;
        this.timer = 0;
        this.animation = null;

        this.input = document.createElement("input");
        this.input.addEventListener("focus", this.input.select);
        this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.input.addEventListener("blur", this.handleFocusOut.bind(this));
        this.appendChild(this.input);

        const buttons = document.createElement("div");
        this.appendChild(buttons);

        const upButton = document.createElement("button");
        const downButton = document.createElement("button");

        const resetDynamics = () => {
            this.timer = 0;
            this.numOfTimes = 0;
            this.currentSpeed = this.initialSpeed;
        };

        upButton.addEventListener("mousedown", (evt) => {
            resetDynamics();
            this.animation = requestAnimationFrame(this.stepValue.bind(this, this.step));
        });

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
            button.tabIndex = -1;
            buttons.appendChild(button);
        });

        const upArrow = document.createElement("i");
        upButton.appendChild(upArrow);

        const downArrow = document.createElement("i");
        downButton.appendChild(downArrow);

        buttons.className = this.className + "-buttons";
        upButton.className = this.className + "-up-button";
        upArrow.className = this.className + "-up-arrow";
        downButton.className = this.className + "-down-button";
        downArrow.className = this.className + "-down-arrow";

        document.addEventListener("wheel", this.handleMouseWheel.bind(this));

        this.changeEvent = new Event("change");

        /* don't let input element send its own event */
        this.input.addEventListener("change", (evt) => {
            evt.stopImmediatePropagation();
        });

        if (opts.disabled ||
            this.getAttribute("disabled") === "" ||
            this.getAttribute("disabled") === true) {
            this.disabled = true;
        }
        this.setValue(initialValue);
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