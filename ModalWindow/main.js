
import {ModalWindow} from "./ModalWindow.js";
//import SpinBox from "./SpinBox.js";
//import ColorPicker from "./ColorPicker.js";

// document.documentElement.setAttribute('window-theme', "plain");

var modal = new ModalWindow({title: "Modal Window"});
// or
// var modal = document.createElement("modal-window");

const markup = `
<label for="example-input">Example Input</label>
<input id="example-input" type="text">
<div id="transform-area" class="transform-area">
    <div id="gridSize"> </div>
    <div id="position-vector" class="vector-area">
        <label class="vector-area-label">Position</label>
        <spin-box id="positionXSpinner" label="positionSpinner" decimals="2" value="13" width="20"></spin-box>
    </div>
    <div id="scale-vector" class="vector-area">
        <label class="vector-area-label">Scale</label>
    </div>
</div>
`;

modal.addMarkup(markup);
modal.addEventListener("closed", (evt) => {
    console.log("modal closed");
});
modal.style.top = "20%";
document.body.appendChild(modal);
modal.open();

var showHideModalButton = document.getElementById("showHideModalBtn");
showHideModalButton.onclick = function() {
    if (modal.closed) {
        modal.open();
    } else {
        modal.close();
    }
};

var button = document.createElement("button");
button.innerHTML = "WOWOWO";
modal.appendChild(button);

var template = document.querySelector('#template');
let content = template.content;
document.body.appendChild(content);

var templateModal = document.getElementById("modalWindow-from-template");
templateModal.setAttribute('window-theme', "plain");
templateModal.style.top = "50%";
templateModal.addMarkup(markup);
templateModal.open();

var button = document.createElement("button");
button.innerHTML = "WOWOWO";
templateModal.appendChild(button);

var showHideTemplateModalButton = document.getElementById("showHideTemplateModalBtn");
showHideTemplateModalButton.onclick = function() {
    if (templateModal.closed) {
        templateModal.open();
    } else {
        templateModal.close();
    }
};

