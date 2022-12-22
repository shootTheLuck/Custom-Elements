
import {MenuBar} from "./MenuBar.js";
import {DropdownMenu} from "./DropdownMenu.js";
import {MenuItem} from "./MenuItem.js";
import {ContextMenu} from "./ContextMenu.js";


var menuBar = new MenuBar();
document.body.prepend(menuBar);

// listen for selection from entire menubar:
menuBar.addEventListener("selection", (evt) => {
    console.log("you selected '" + evt.value + "' from the menu bar");
    if (evt.value === "Repo on Github") {
        window.location = "https://github.com/shootTheLuck/CustomElements";
    }
});

// add menu and multiple plain text menuItems
let fileMenu = menuBar.addDropdownMenu("File", ["Open...", "Close", "Save", "Cancel All Subscriptions"]);

fileMenu.addDividerAfter("Close");

// add menuItem to a menu at any point
let wowo = fileMenu.addMenuItem("wowo");

// listen for selection from single menu:
fileMenu.addEventListener("selection", (evt) => {
    console.log("from fileMenu event", evt.value);
    if (evt.value === "wowo") {
        fileMenu.disableMenuItem("Save");
        // fileMenu.name = "what?";
        // fileMenu.getMenuItem("save").name = "nope";
        // fileMenu.getMenuItem("wowo").classList.add("red");
    }
    if (evt.value === "Close") {
        fileMenu.enableMenuItem("Save");
        // fileMenu.getMenuItem("nope").name = "save";
        // fileMenu.getMenuItem("wowo").classList.remove("red");
        // fileMenu.name = "WHATT";
    }
});

wowo.addEventListener("selection", (evt) => {
    console.log("from menuItem event", evt.value);
});

let editMenu = menuBar.addDropdownMenu("Edit", ["Copy", "Paste"]);
let aboutMenu = document.createElement("dropdown-menu");
aboutMenu.name = "About";

let repoLocation = new MenuItem("Repo on Github");
aboutMenu.addMenuItem(repoLocation);
menuBar.addDropdownMenu(aboutMenu);


//********************** context menu ********************************

var rectangleElement = document.getElementById("rectangle");
var squareElement = document.getElementById("square");

let contextMenu = new ContextMenu(["Copy", "Paste"]);
contextMenu.autoDisplay = false;
rectangleElement.appendChild(contextMenu);

// Listen for contextmenu event from its parent element.
// Make decisions on what to show in the menu before displaying:
rectangleElement.addEventListener("contextmenu", (evt) => {
    let targetElement = evt.target;
    if (targetElement === squareElement) {
        contextMenu.disableMenuItem("Edit");
        contextMenu.open(evt, "Change Color");
    } else {
        contextMenu.open(evt);
    }
});

contextMenu.addEventListener("selection", (evt) => {
    console.log("you selected:", evt.value);

    let targetElement = contextMenu.targetElement;
    if (evt.value === "Change Color") {
        let color = targetElement.style.backgroundColor;
        if (color === "red") {
            targetElement.style.backgroundColor = "blue";
        } else {
            targetElement.style.backgroundColor = "red";
        }
    }
});



