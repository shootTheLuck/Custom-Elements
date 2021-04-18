
import {SpinBox} from "../SpinBox.js";

// QUnit.test( "testing QUnit", function( assert ) {
  // assert.ok( 1 == "1", "Passed!" );
// });

QUnit.module("SpinBox", function(hooks) {
    hooks.beforeEach(function() {
        this.spinBox = new SpinBox();
        document.body.appendChild(this.spinBox);
    });

    QUnit.test("instantiates and appends to DOM", function(assert) {
        this.spinBox.id = "spinBoxTest";
        let test = document.getElementById("spinBoxTest");
        assert.ok(test);
    });

    QUnit.test("accepts numeric values with setValue() and changeValue()", function(assert) {
        this.spinBox.setValue(-1);
        assert.equal(this.spinBox.getValue(), -1, "expect set and get -1");
        this.spinBox.setValue(0);
        assert.equal(this.spinBox.getValue(), 0, "expect set and get 0");
        this.spinBox.setValue(1);
        assert.equal(this.spinBox.getValue(), 1, "expect set and get 1");
        this.spinBox.changeValue(-1);
        assert.equal(this.spinBox.getValue(), -1, "expect change and get -1");
        this.spinBox.changeValue(0);
        assert.equal(this.spinBox.getValue(), 0, "expect change and get 0");
        this.spinBox.changeValue(1);
        assert.equal(this.spinBox.getValue(), 1, "expect change and get 1");
    });

    QUnit.test("accepts non-numeric value with setValue() and displays as NaN", function(assert) {
        this.spinBox.setValue("d");
        let value = this.spinBox.getValue();
        assert.equal(isNaN(value), true, "expect to result in NaN");
        assert.equal(this.spinBox.input.value, "NaN", "expect to display 'NaN'");
    });

    QUnit.test("does not accept non-numeric value with changeValue()", function(assert) {
        this.spinBox.changeValue(11);
        this.spinBox.changeValue("d");
        let value = this.spinBox.getValue();
        assert.equal(this.spinBox.getValue(), 11, "expect value to remain 11");
    });

    QUnit.test("handles min and max allowable values", function(assert) {
        this.spinBox.min = -1;
        this.spinBox.setValue(-100);
        assert.equal(this.spinBox.getValue(), -1, "expect value to be -1");
        this.spinBox.max = 1;
        this.spinBox.setValue(100);
        assert.equal(this.spinBox.getValue(), 1, "expect value to be 1");
    });

    QUnit.test("dispatches change event on changeValue()", function(assert) {
        let valueReceived = null;
        let deltaReceived = null;
        this.spinBox.addEventListener("change", function(evt) {
            valueReceived = evt.target.value;
        });

        this.spinBox.setValue(10);
        let newValue = 10 + 100000;

        this.spinBox.changeValue(newValue);

        assert.equal(valueReceived, 10 + 100000, "expect set and get -1");
    });

});


