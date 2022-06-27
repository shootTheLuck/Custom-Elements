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
