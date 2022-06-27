## What is this?
A CodeEditor class made using vanilla Javascript and the Custom Elements API. Display and edit code with line numbers, simple highlighting, naive undo/redo, and some other useful editor functions.

[Live Demo Here](https://shootTheLuck.github.io/CustomElements/CodeEditor)

## How do I use it?
```javascript
// import
import {CodeEditor} from "./CodeEditor.js";

// create instance
const codeEditor = new CodeEditor();

// append to your page
document.body.appendChild(codeEditor);

// set or get value
codeEditor.setValue(`var t = "test";`);

```
