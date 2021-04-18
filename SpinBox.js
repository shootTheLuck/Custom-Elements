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
        console.log("make sure", spinBox.getValue());
 *  }, false);
 *
 * Depends spinbox.css
 */

class SpinBox extends HTMLElement {

    constructor(opts = {}) {
        super();

        const defaults = {
            className: "spinBox",
            labelText: "Spin Box",
            step: 1,
            decimals: 0,
            max: Infinity,
            min: -Infinity,
            initialSpeed: 10,
            highSpeed: 2,
            increaseSpeedAfter: 4, //steps
            labelWidth: 150, //px
            inputWidth: 75, //px
            value: 0,
        };

        this.className = opts.className || this.getAttribute("class") || defaults.className;
        this.labelText = opts.label || this.getAttribute("label") || defaults.labelText;

        this.step = opts.step ||
                parseFloat(this.getAttribute("step")) || defaults.step;
        this.decimals = opts.decimals ||
                parseFloat(this.getAttribute("decimals")) || defaults.decimals;
        this.width = opts.width ||
                parseFloat(this.getAttribute("width")) || defaults.width;
        this.min = opts.min ||
                parseFloat(this.getAttribute("min")) || defaults.min;
        this.max = opts.max ||
                parseFloat(this.getAttribute("max")) || defaults.max;
        this.initialSpeed = opts.initialSpeed ||
                parseFloat(this.getAttribute("initialSpeed")) || defaults.initialSpeed;
        this.highSpeed = opts.highSpeed ||
                parseFloat(this.getAttribute("highSpeed")) || defaults.highSpeed;
        this.increaseSpeedAfter = opts.increaseSpeedAfter ||
                parseFloat(this.getAttribute("increaseSpeedAfter")) || defaults.increaseSpeedAfter;

        this._labelWidth = opts.labelWidth ||
                parseFloat(this.getAttribute("labelWidth")) || defaults.labelWidth;
        this._inputWidth = opts.inputWidth ||
                parseFloat(this.getAttribute("inputWidth")) || defaults.inputWidth;
        this.initialValue = opts.value ||
                parseFloat(this.getAttribute("value")) || defaults.value;

        this.currentSpeed = 0;
        this.numOfTimes = 0;
        this.timer = 0;
        this.animation = null;

        this.label = document.createElement("label");
        this.label.textContent = this.labelText;
        this.appendChild(this.label);

        this.input = document.createElement("input");
        this.input.addEventListener("focus", this.input.select);
        this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.input.addEventListener("focusout", this.handleFocusOut.bind(this));
        this.appendChild(this.input);

        const resetDynamics = function() {
            this.timer = 0;
            this.numOfTimes = 0;
            this.currentSpeed = this.initialSpeed;
        }.bind(this);

        const upButton = document.createElement("button");
        const downButton = document.createElement("button");

        upButton.addEventListener("mousedown", (evt) => {
            resetDynamics();
            this.animation = requestAnimationFrame(this.stepValue.bind(this, this.step));
        });

        downButton.addEventListener("mousedown", (evt) => {
            resetDynamics();
            this.animation = requestAnimationFrame(this.stepValue.bind(this, -this.step));
        });

        [upButton, downButton].forEach((item) => {
            item.addEventListener("mouseup", (evt) => {
                cancelAnimationFrame(this.animation);
            });
            item.addEventListener("mouseleave", (evt) => {
                cancelAnimationFrame(this.animation);
            });
        });

        this.appendChild(upButton);
        const upArrow = document.createElement("i");
        upButton.appendChild(upArrow);

        this.appendChild(downButton);
        const downArrow = document.createElement("i");
        downButton.appendChild(downArrow);

        upButton.className = this.className + "-up-button";
        upArrow.className = this.className + "-up-arrow";
        downButton.className = this.className + "-down-button";
        downArrow.className = this.className + "-down-arrow";

        this.style.setProperty("--label-width", this._labelWidth + "px");
        this.style.setProperty("--input-width", this._inputWidth + "px");
        document.addEventListener("wheel", this.handleMouseWheel.bind(this));

        this.setValue(this.initialValue);
        this.changeEvent = new Event("change");
        /* don't let input element send its own event */
        this.input.addEventListener("change", function(evt) {
            evt.stopImmediatePropagation();
        });
    }

    get labelWidth() {
        return this._labelWidth;
    }

    set labelWidth(num) {
        this._labelWidth = num;
        this.style.setProperty("--label-width", this._labelWidth + "px");
    }

    get inputWidth() {
        return this._inputWidth;
    }

    set inputWidth(num) {
        this._inputWidth = num;
        this.style.setProperty("--input-width", this._inputWidth + "px");
    }

    setEnabled(bool) {
        this.input.disabled = !bool;
    }

    handleFocusOut(evt) {
        if (!this.contains(evt.relatedTarget)) {
            let value = this.getValue();
            this.changeValue(value);
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
        if (document.activeElement === this.input) {
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

    changeValue(value) {
        if (isNaN(value)) value = this.value;
        let oldValue = this.value;
        this.setValue(value);
        this.input.select();

        this.dispatchEvent(this.changeEvent);
    }
}

customElements.define("spin-box", SpinBox);

export {SpinBox};