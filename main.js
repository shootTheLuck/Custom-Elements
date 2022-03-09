

import {MenuBar} from "./Menus/MenuBar.js";
import {DropdownMenu} from "./Menus/DropdownMenu.js";
import {MenuItem} from "./Menus/MenuItem.js";
import {ContextMenu} from "./Menus/ContextMenu.js";


import {ModalWindow} from "./ModalWindow/ModalWindow.js";


document.body.setAttribute('theme', "plain");
var menuBar = new MenuBar();
document.body.prepend(menuBar);

var modal = new ModalWindow({title: "Modal Window"});
document.body.append(modal);

var modalMenuBar = new MenuBar();
modal.appendChild(modalMenuBar);


// add menu and multiple plain text menuItems
let menu1 = menuBar.addDropdownMenu("Menu1", ["Open...", "Close", "Save", "Cancel All Subscriptions"]);

// listen for selection from entire menubar:
menuBar.addEventListener("selection", (evt) => {
    console.log("from menuBar event", evt.value);
    if (evt.value === "Open...") {
        modal.open();
    }
});




menu1.addDividerAfter("Close");

// add menuItem to a menu at any point
let wowo = menu1.addMenuItem("wowo");

// listen for selection from single menu:
menu1.addEventListener("selection", (evt) => {
    console.log("from menu1 event", evt.value);
    if (evt.value === "wowo") {
        menu1.getMenuItem("wowo").classList.add("red");
        menu1.disableMenuItem("Save");
        // menu1.name = "what?";
        // menu1.getMenuItem("save").name = "nope";
    }
    if (evt.value === "Close") {
        menu1.getMenuItem("wowo").classList.remove("red");
        menu1.enableMenuItem("Save");
        // menu1.getMenuItem("nope").name = "save";
        // menu1.name = "WHATT";
        // menu1.disabled = true;
    }
});

wowo.addEventListener("selection", (evt) => {
    console.log("from menuItem event", evt.value);
});


function handleShowButton() {
    console.log("showing something");
}

function changeItemName(selectedItem) {
    selectedItem.innerText = "wowo you did it";
}


let editMenu = menuBar.addDropdownMenu("Edit", ["Copy", "Paste"]);
let anotherMenu = document.createElement("dropdown-menu");
anotherMenu.name = "Another";


let test = new MenuItem("Test");

anotherMenu.addMenuItem(test);
menuBar.addDropdownMenu(anotherMenu);


var rectangleElement = document.getElementById("rectangle");
var squareElement = document.getElementById("square");

let contextMenu = new ContextMenu("Edit", ["Copy", "Paste"]);
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
});



