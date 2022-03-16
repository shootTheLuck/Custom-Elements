
import {CodeEditor} from "./CodeEditor.js";
import {ApplicationWindow} from "../ApplicationWindow/ApplicationWindow.js";

// optionally set them for entire page
// document.documentElement.setAttribute("window-theme", "plain");

const applicationWindow = new ApplicationWindow({title: "Code Editor"});
document.body.appendChild(applicationWindow);
applicationWindow.open();
applicationWindow.maximize();

var codeEditor = new CodeEditor();
applicationWindow.appendChild(codeEditor);
// codeEditor.setValue(`var t = "test";`);

codeEditor.setValue(
`var position = {x: 0, y: 0, z: 0};

var test = "test";

function onEntry() {
    position.x = 3;
    print("onEntry", position);
}

function doIt(what) {
    position.x += 0.1;
    print("position now", position);
}`);
// codeEditor.markErrorAtLine(1);
// codeEditor.markErrorAtLine(2);

function test(iterations = 1) {
    console.log("testing...");
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        // codeEditor.toggleComment();
        codeEditor.input.value += "x\n";
        codeEditor.updateDisplay();
    }

    console.log("finish", performance.now() - start);
}

// test(501);