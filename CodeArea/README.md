## What is this?
A CodeArea class made using vanilla Javascript and the Custom Elements API. Display and edit code with line numbers, simple highlighting, naive undo/redo, and some other useful editor functions.

[Live Demo Here](https://shootTheLuck.github.io/CustomElements/CodeArea)

## How do I use it?
```javascript
// import
import {CodeArea} from "./CodeArea.js";

// create instance
const codeArea = new CodeArea();

// append to your page
document.body.appendChild(codeArea);

// set or get value
codeArea.value = `var t = "test";`;

```

## Built-in Functions

CodeArea has a few built-in functions for editing code that can be called with the following keyboard shortcuts:

1. DuplicateSelection. Selections of code or entire selected lines can be duplicated by pressing  <kbd>CTRL</kbd> <kbd>d</kbd>.
2. ToggleComment. Selected lines can be commented or uncommented by pressing <kbd>CTRL</kbd> <kbd>e</kbd>.

Keyboard shortcuts are exposed in the `keyboardShortcuts` property and can be reassigned at any time ie:

```
codeArea.keyboardShortcuts.duplicateSelection = "y";
```

## Contribute

Contributions, issues, comments would be awesome!  Hit the issues button to get started. Thanks!



