
import {SpinBox} from "./SpinBox.js";


var label = document.createElement("label");
label.innerText = "Label:";
document.body.appendChild(label);

// create a spinBox and append programatically
var spinBox = new SpinBox({decimals: 2, min: 0});
document.body.appendChild(spinBox);
spinBox.value = 5;
// or...
// var spinBox = document.createElement("spin-box");
// document.body.appendChild(spinBox);

// listen for change event
spinBox.addEventListener("change", function(evt) {
    console.log("spinBox value now", evt.target.value);
    console.log("make sure", spinBox.getValue());
    console.log("make sure", spinBox.value);
}, false);

// spinBox can be added from html template
var template = document.querySelector("#template");
let content = template.content;
document.body.appendChild(content);

// listen for change event as before
var templateSpinBox = document.getElementById("spinBox-from-template");
templateSpinBox.addEventListener("change", function(evt) {
    let value = evt.target.value;
    console.log("spinBox from template value now", value);
    if (value < 0) {
        templateSpinBox.style.setProperty("--input-background-color", "rgb(256, 128, 128)");
    } else {
        templateSpinBox.style.setProperty("--input-background-color", "white");
    }
}, false);


var standard = document.querySelector("#standard");
document.addEventListener("keydown", (evt) => {
    if (evt.key === "i") {
        console.log(standard.value, typeof standard.value);
    }
});
// standard.value = 4;