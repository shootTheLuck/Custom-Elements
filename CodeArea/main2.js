
import {CodeArea} from "./CodeArea.js";
import {ApplicationWindow} from "../ApplicationWindow/ApplicationWindow.js";

// optionally set them for entire page
// document.documentElement.setAttribute("window-theme", "plain");

const applicationWindow = new ApplicationWindow({title: "Code Editor"});
document.body.appendChild(applicationWindow);
applicationWindow.open();

var codeArea = new CodeArea();
applicationWindow.appendChild(codeArea);

codeArea.value =
`
var position = {x: 0, y: 0, z: 0};

var test = "test";

function onEntry() {
    position.x = 3;
    print("onEntry", position);
}

function doIt(what) {
    position.x += 0.1;
    print("position now", position);
}

function onUpdate() {
    cycles += 0.1;
    setRotation(0, cycles, 0);
    // colorTimer = setTimer(setRandomColor, 500, true);
    // setRotation(0, 0, Math.sin(cycles) / 2);
    // translate(0.05, 0, 0);
    // position = getPosition();
    // setPosition(position.x + 0.05, position.y, position.z);
    // position.x += 0.05;
    // setPosition(position.x, position.y, position.z);
}

function onTouch() {
    // cancelTimer(colorTimer);
    colorTimer = setTimer(setRandomColor, 500, false);
    position.x -= 3.02;
    //setPosition(position.x, position.y, position.z);
    //setRotation(0, 0, 0);
    //setAngularVelocity(0, 0, 0);
}
`;

// codeEditor.markErrorAtLine(1);
// codeEditor.markErrorAtLine(2);

function test(iterations = 1) {
    console.log("testing...");
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        // codeEditor.toggleComment();
        codeArea.input.value += "x\n";
        codeArea.updateDisplay();
    }

    console.log("finish", performance.now() - start);
}

// test(501);