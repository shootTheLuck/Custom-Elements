
import {SpinBox} from "./SpinBox.js";


// create and append programatically
var spinBox = new SpinBox({label: "scaleSpinner", decimals: 2, min: -1, value: -1});
document.body.appendChild(spinBox);

spinBox.setValue(0);

spinBox.addEventListener("change", function(evt) {
    console.log("spinBox value now", evt.target.value);
    console.log("make sure", spinBox.getValue());
}, false);


// or use html template and append
var template = document.querySelector('#template');
let content = template.content;
document.body.appendChild(content);

var templateSpinBox = document.getElementById("spinBox-from-template");
templateSpinBox.addEventListener("change", function(evt) {
    console.log("spinBox from template value now", evt.target.value);
}, false);



