
import {CodeEditor} from "./CodeEditor.js";

// document.documentElement.setAttribute("window-theme", "dark");

var codeEditor = new CodeEditor();
document.body.appendChild(codeEditor);

codeEditor.value =
`var position = {x: 0, y: 0, z: 0};

var test = "test";

function onEntry() {
    position.x = 3;
    print("onEntry", position);
}

function doIt(what) {
    position.x += 0.1;
    print("position now", position);
}`;
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