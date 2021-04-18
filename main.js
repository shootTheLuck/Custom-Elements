
import {SpinBox} from "./SpinBox.js";

var spinBox = new SpinBox({label: "scaleSpinner", decimals: 2, min: -1, value: -1});
document.body.appendChild(spinBox);

spinBox.setValue(0);

spinBox.addEventListener("change", function(evt) {
    console.log("spinBox value now", evt.target.value);
    console.log("make sure", spinBox.getValue());
}, false);

