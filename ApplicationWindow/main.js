
import {ApplicationWindow} from "./ApplicationWindow.js";

var appWindow = new ApplicationWindow({title: "Application Window"});
// or
// var appWindow = document.createElement("application-window");

// set theme at any time for entire page
// document.body.setAttribute("window-theme", "plain");

const markup = `
<div id="container" style="margin: 15px">
    <p id="text">
        Lorem ipsum dolor sit amet, consectetur<br>
        adipiscing elit, sed do eiusmod tempor <br>
        incididunt ut labore et dolore magna aliqua.
    </p>
    <label for="example-input">Example Input</label>
    <input id="example-input" type="text">
</div>
`;

appWindow.addMarkup(markup);

const button = document.createElement("button");
button.innerHTML = "Example Button";
button.style = "margin: 15px";
appWindow.appendChild(button);

appWindow.addEventListener("close", (evt) => {
    console.log("appWindow closed");
});

appWindow.style.top = "15%";
document.body.appendChild(appWindow);

const showHideBtn = document.getElementById("showHideBtn");
showHideBtn.onclick = function() {
    if (appWindow.isOpen) {
        appWindow.close();
    } else {
        appWindow.open();
    }
};

const createNewBtn = document.getElementById("createNewBtn");
createNewBtn.onclick = function() {
    const newButton = new ApplicationWindow();
    newButton.addMarkup(markup);
    newButton.style.left = Math.random() * 70 + "%";
    newButton.style.top = Math.random() * 70 + "%";
    document.body.appendChild(newButton);
};



