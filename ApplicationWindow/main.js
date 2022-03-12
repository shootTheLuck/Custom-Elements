
import {ApplicationWindow} from "./ApplicationWindow.js";

var appWindow = new ApplicationWindow({title: "Application Window"});
// or
// var appWindow = document.createElement("application-window");

// set theme at any time for entire page
// document.body.setAttribute("window-theme", "plain");

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

appWindow.addMarkup(markup);
appWindow.addEventListener("closed", (evt) => {
    console.log("app closed");
});
appWindow.style.top = "20%";
document.body.appendChild(appWindow);
appWindow.open();

var showHideAppWindowBtn = document.getElementById("showHideAppWindowBtn");
showHideAppWindowBtn.onclick = function() {
    if (appWindow.closed) {
        appWindow.open();
    } else {
        appWindow.close();
    }
};

var button = document.createElement("button");
button.innerHTML = "WOWOWO";
appWindow.appendChild(button);

var template = document.querySelector("#template");
let content = template.content;
document.body.appendChild(content);

var templateModal = document.getElementById("appWindow-from-template");
templateModal.style.top = "50%";
templateModal.addMarkup(markup);
templateModal.open();

var button = document.createElement("button");
button.innerHTML = "WOWOWO";
templateModal.appendChild(button);

var showHideTemplateAppWindowButton = document.getElementById("showHideTemplateAppWindowButton");
showHideTemplateAppWindowButton.onclick = function() {
    if (templateModal.closed) {
        templateModal.open();
    } else {
        templateModal.close();
    }
};

