
import {ApplicationWindow} from "./ApplicationWindow.js";

var appWindow = new ApplicationWindow({title: "Application Window"});
// or
// var appWindow = document.createElement("application-window");

// set theme at any time for entire page
// document.body.setAttribute("window-theme", "plain");

const markup = `
<div id="container" style="margin: 15px">
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
</div>
`;

appWindow.addMarkup(markup);
appWindow.style.top = "15%";
appWindow.addEventListener("close", (evt) => {
    console.log("appWindow closed");
});
document.body.appendChild(appWindow);

var showHideAppWindowBtn = document.getElementById("showHideAppWindowBtn");
showHideAppWindowBtn.onclick = function() {
    if (appWindow.isOpen) {
        appWindow.close();
    } else {
        appWindow.open();
    }
};

var button = document.createElement("button");
button.innerHTML = "WOWOWO";
button.style = "margin: 15px";
appWindow.appendChild(button);


