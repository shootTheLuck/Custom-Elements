
import {Highlighter} from "./Highlighter.js";

// ignore these keys for undo/redo
const nonPrintable = [ "Alt", "OS", "Shift", "NumLock", "Insert", "CapsLock", "Escape",
        "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
        "ScrollLock", "Pause"
];

// based on tutorial by Oliver Geer:
// https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
// transparent textarea input element is on top of visible div display element

// line numbers uses technique from textarea-line-numbers by Matheus Avellar
// https://github.com/MatheusAvellar/textarea-line-numbers

// firefox about:config
// type name in, if not set already choose number,
// ui.caretWidth set to 1
// ui.caretBlinkTime set to 500

const template = document.createElement("template");

template.innerHTML =
`<style>
    :host {
        color: var(--code-editor-color, inherit);
        background-color: var(--code-editor-background-color, inherit);
        position: relative;
        display: block;
        line-height: 1.25;
        border-style: solid;
        border-color: var(--code-editor-border-color, grey);
        border-width: var(--code-editor-border-width, 1px);
        tab-size: 4;
        font-family: var(--code-editor-font-family, "Roboto Mono", monospace);
        font-size: var(--code-editor-font-size, inherit);
        caret-color: var(--code-editor-caret-color, black);
    }

    :host * {
        line-height: inherit;
        margin: 0;
        box-sizing: border-box;
    }

    .error {
        text-decoration-line: underline;
        text-decoration-style: wavy;
        text-decoration-color: red;
        text-decoration-skip: spaces;
    }

    .gutter {
        width: 2em;
        padding: 0.6em 0.25em 0.6em 0;
        border-right: 1px solid;
        border-color: inherit;
        height: 100%;
        overflow: hidden;
        display: inline-block;
        counter-reset: line;
    }

    .input, .display {
        position: absolute;
        height: 100%;
        overflow: auto;
        white-space: pre;
        display: inline-block;
        padding: 0.6em;
        width: calc(100% - 2em);
        font-family: inherit;
        font-size: inherit;
    }

    .input {
        z-index: 1;
        color: transparent;
        caret-color: inherit;
        background: transparent;
        border: 0;
        outline: 0;
        resize: none;
    }

    .line-number {
        width: 100%;
        text-align: right;
        color: var(--code-editor-line-number-color, #aeaeae);
    }

    .line-number::before {
        counter-increment: line;
        content: counter(line);
        user-select: none;
    }


</style>

<div class="gutter"></div>
<div spellcheck="false" class="display"></div>
<textarea spellcheck="false" class="input"></textarea>

`;

class CodeArea extends HTMLElement {

    constructor(opts = {}) {
        super();

        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.highlighter = new Highlighter();
        const highlighterStyle = this.highlighter.getStyleTemplate();
        this.shadowRoot.appendChild(highlighterStyle.content.cloneNode(true));

        this.gutter = this.shadowRoot.querySelector(".gutter");
        this.input = this.shadowRoot.querySelector(".input");
        this.display = this.shadowRoot.querySelector(".display");

        this.input.addEventListener("input", (evt) => {
            this.updateDisplay();
            this.syncScroll();
        });

        // listen for various key strokes
        this.input.addEventListener("keydown", (evt) => {
            this.handleKeydown(evt);
        });

        this.input.addEventListener("scroll", (evt) => {
            this.syncScroll();
        });

        this.tabCharacter = "\t";
        // this.tabCharacter = "    ";
        this.keyboardShortcuts = {
            paste: "v",
            undo: "z",
            duplicateSelection: "d",
            toggleComment: "e",
        };

        this.commentSymbol = "// ";
        this.states = [];
        this.currentScroll = {scrollLeft: 0, scrollTop: 0};
        this.errorLines = new Set();

    }

    connectedCallback() {
        // dubious method here to handle content written in the HTML
        // if (this.textContent !== "") {
            // this.value = this.textContent;
            // this.textContent = "";
        // }
    }

    get value() {
        return this.input.value;
    }

    set value(what) {
        this.input.value = what;
        this.updateDisplay();
        this.syncScroll();
    }

    clearErrorAtLine(number) {
        this.errorLines.delete(number);
    }

    markErrorAtLine(number) {
        /* convert number to zero index */
        this.errorLines.add(number - 1);
        this.updateDisplay();
    }

    clearAllErrors() {
        this.errorLines.clear();
        this.updateDisplay();
    }

    getSelection(start = this.input.selectionStart, end = this.input.selectionEnd) {
        return {
            value: this.input.value.substring(start, end),
            start: start,
            end: end,
        };
    }

    getSelectionLines(start = this.input.selectionStart, end = this.input.selectionEnd) {

        const existing = this.input.value;

        if (start !== end) {

            while (start > 0 &&
                    // existing.substr(start - 1, 1) !== "\n" &&
                    // existing.substr(start, 1) !== "\n") {
                    existing.slice(start - 1, start) !== "\n" &&
                    existing.slice(start, start + 1) !== "\n") {
                start -= 1;
            }

        } else {

            while (start > 0 &&
                    // existing.substr(start - 1, 1) !== "\n") {
                    existing.slice(start - 1, start) !== "\n") {
                start -= 1;
            }

        }

        while (end < existing.length &&
                // existing.substr(end, 1) !== "\n") {
                existing.slice(end, end + 1) !== "\n") {
            end += 1;
        }

        let selectionLines = this.input.value.substring(start, end).split("\n");

        return {
            value: selectionLines,
            start: start,
            end: end,
        };
    }

    updateLineNumbers() {

        //https://stackoverflow.com/a/30411260
        const linesOfText = this.input.value.match(/\n/g).length + 1;

        const lineNumbers = this.gutter.children.length;
        let difference = linesOfText - lineNumbers;

        if (difference > 0) {
            const fragment = document.createDocumentFragment();
            while (difference > 0) {
                const lineNumber = document.createElement("div");
                lineNumber.className = "line-number";
                fragment.appendChild(lineNumber);
                difference -= 1;
            }
            this.gutter.appendChild(fragment);
        }

        while (difference < 0) {
            this.gutter.lastChild.remove();
            difference += 1;
        }

        const newCount = this.gutter.children.length;

        if (newCount !== lineNumbers) {
            if (linesOfText < 100) {
                this.gutter.style.width = "2em";
                this.input.style.width = "calc(100% - 2em)";
                this.display.style.width = "calc(100% - 2em)";
            } else if (linesOfText < 1000) {
                this.gutter.style.width = "3em";
                this.input.style.width = "calc(100% - 3em)";
                this.display.style.width = "calc(100% - 3em)";
            } else {
                this.gutter.style.width = "4em";
                this.input.style.width = "calc(100% - 4em)";
                this.display.style.width = "calc(100% - 4em)";
            }
        }
    }

    showLineNumbers() {
        this.gutter.style.display = "inline-block";
    }

    hideLineNumbers() {
        this.gutter.style.display = "none";
    }

    updateDisplay() {

        var value = this.input.value;

        if (value[value.length - 1] === "\n") {

            // fix scroll behavior firefox and chrome
            value += " ";

            // scroll to last line as it's entered in chrome
            this.input.blur();
            this.input.focus();
        }

        const formattedHTML = this.highlightCode(value);

        if (this.errorLines.size === 0) {
            this.display.innerHTML = formattedHTML;
        } else {
            const displayLines = formattedHTML.split("\n");
            this.errorLines.forEach((number) => {
                if (displayLines[number]) {
                    displayLines[number] = `<span class="error">${displayLines[number]}</span>`;
                } else {
                    this.clearErrorAtLine(number);
                }
            });
            this.display.innerHTML = displayLines.join("\n");
        }

        this.updateLineNumbers();
    }

    syncScroll(scrollTop = this.input.scrollTop, scrollLeft = this.input.scrollLeft) {
        this.scrollTop = scrollTop;
        this.display.scrollTop = scrollTop;
        this.gutter.scrollTop = scrollTop;
        this.display.scrollLeft = scrollLeft;
    }

    saveState() {
        this.states.push({
            value: this.input.value,
            selectionStart: this.input.selectionStart,
            selectionEnd: this.input.selectionEnd
        });
    }

    restoreState() {
        const previous = this.states.pop();
        if (previous) {
            this.input.value = previous.value;
            this.setSelection(previous.selectionStart, previous.selectionEnd);
            this.updateDisplay();
        }
    }

    highlightCode(text) {
        return this.highlighter.highlight(text);
    }

    getLineNumberAt(offset) {
        // return this.input.value.substr(0, offset).split("\n").length - 1;
        return this.input.value.slice(0, offset).split("\n").length - 1;
    }

    getLineAt(offset) {
        var lines = this.input.value.split("\n");
        var lineNumber = this.getLineNumberAt(offset);
        return lines[lineNumber];
    }

    addNewLine() {
        const existing = this.input.value;
        const {selectionStart, selectionEnd} = this.input;
        var line = this.getSelectionLines().value[0];

        var indentAmount = "";
        while(line[0] === " " || line[0] === "\t") {
            indentAmount += line[0];
            line = line.slice(1);
        }

        this.input.value = existing.substring(0, selectionStart) +
                "\n" + indentAmount +
                existing.substring(selectionEnd, existing.length);

        this.setSelection(selectionStart + 1 + indentAmount.length);
        this.updateDisplay();
    }

    toggleComment() {
        const selection = this.getSelection();
        const lines = this.getSelectionLines();

        var selectionLength = selection.end - selection.start;
        var selectionEnd = selectionLength > 0 ? lines.end : selection.end;
        const commentSymbol = this.commentSymbol;

        for (let i = 0; i < lines.value.length; i++) {
            var line = lines.value[i];
            if (line === "") continue;

            var indentAmount = "";
            while(line[0] === " " || line[0] === "\t") {
                indentAmount += line[0];
                line = line.slice(1);
            }

            if (line.startsWith(commentSymbol)) {
                lines.value[i] = indentAmount + line.replace(commentSymbol, "");
                selectionEnd -= commentSymbol.length;
            } else {
                lines.value[i] = indentAmount + commentSymbol + line;
                selectionEnd += commentSymbol.length;
            }
        }

        var adjusted = lines.value.join("\n");
        this.input.value = this.input.value.substring(0, lines.start) +
                adjusted + this.input.value.substring(lines.end);

        if (selectionLength > 0) {
            this.setSelection(lines.start, selectionEnd);
        } else {
            this.setSelection(selectionEnd);
        }
        this.updateDisplay();
    }

    setSelection(start, end = start) {
        this.input.selectionStart = start;
        this.input.selectionEnd = end;
    }

    duplicateSelection() {
        var needNewLine = false;
        var selection = this.getSelection();
        const selectionStart = selection.start;
        const selectionEnd = selection.end;
        const lines = this.getSelectionLines();

        if (selection.value === "" || lines.value.length > 1) {
            needNewLine = true;
            selection = lines;
        }

        const existing = this.input.value;
        const preceeding = existing.substring(0, selection.end);
        const remaining = existing.substring(selection.end);

        this.input.value = preceeding;
        if (needNewLine) {
            this.input.value += "\n";
            this.input.value += selection.value.join("\n");
        } else {
            this.input.value += selection.value;
        }
        this.input.value += remaining;

        this.updateDisplay();
        this.setSelection(selectionStart, selectionEnd);
    }

    indent() {
        var selection = this.getSelection();

        var start = selection.start;
        var end = selection.end;
        var selectionEnd = end;

        const existing = this.input.value;
        const preceeding = existing.substring(0, start);
        const remaining = existing.substring(end);
        const tab = this.tabCharacter;

        let arr = existing.substring(start, end).split("\n");

        if (arr.length > 1) {
            for (let i = 0; i < arr.length; i++) {
                const line = arr[i];
                if (line === "") continue;
                arr[i] = tab + line;
                selectionEnd += tab.length;
            }
            const indented = arr.join("\n");
            this.input.value = preceeding + indented + remaining;
            this.setSelection(start, selectionEnd);
        } else {
            this.input.value = preceeding + tab + remaining;
            this.setSelection(start + tab.length);
        }
        this.updateDisplay();
    }

    unIndent() {
        var selection = this.getSelection();

        var start = selection.start;
        var end = selection.end;
        var selectionEnd = end;

        const existing = this.input.value;
        const preceeding = existing.substring(0, start);
        const remaining = existing.substring(end);
        const tab = this.tabCharacter;

        let arr = existing.substring(start, end).split("\n");
        if (arr.length > 1) {
            for (let i = 0; i < arr.length; i++) {
                const line = arr[i];
                if (line === "") continue;
                if (line.trimStart().length < line.length) {
                    arr[i] = line.slice(tab.length);
                    selectionEnd -= tab.length;
                }
            }
            const unIndented = arr.join("\n");
            this.input.value = preceeding + unIndented + remaining;
            this.setSelection(start, selectionEnd);
        } else {
            const linesPreceeding = preceeding.split("\n");
            const charsToLeft = linesPreceeding[linesPreceeding.length - 1];
            if (charsToLeft.length > 0) {
                if (charsToLeft.trimStart() === "") {
                    this.input.value =
                            existing.substring(0, start - tab.length) + remaining;
                }
                start -= tab.length;
            }
            this.setSelection(start);
        }
        this.updateDisplay();
    }

    // handle various key press functions.
    // main input functionality comes
    // from textarea's "input" listener

    handleKeydown(evt) {
        const key = evt.key;

        if (evt.ctrlKey) {
            switch(key) {
                case "s":
                    evt.preventDefault();
                    break;
                case this.keyboardShortcuts.toggleComment:
                    evt.preventDefault();
                    this.saveState();
                    this.toggleComment();
                    break;
                case this.keyboardShortcuts.duplicateSelection:
                    evt.preventDefault();
                    this.saveState();
                    this.duplicateSelection();
                    break;
                case "v":
                    this.saveState();
                    break;
                case "x":
                    this.saveState();
                    break;
                case this.keyboardShortcuts.undo:
                    evt.preventDefault();
                    this.restoreState();
                    break;
            }
            return;
        }

        if (!nonPrintable.includes(key)) {
            this.saveState();
        }

        if (evt.key === "Tab") {
            evt.preventDefault();
            if (evt.shiftKey) {
                this.unIndent();
            } else {
                this.indent();
            }
        }

        if (evt.key === "Enter") {
            evt.preventDefault();
            this.addNewLine();
        }

        return;
    }

}

customElements.define("code-area", CodeArea);

export {CodeArea};
