## What is this?
A ModalWindow class made using vanilla Javascript and the Custom Elements API.

[Live Demo Here](https://shootTheLuck.github.io/CustomElements/ModalWindow)

## How do I use it?
```javascript
// import
import {ModalWindow} from "./ModalWindow.js";

// create instance
var modal = new ModalWindow({title: "Modal Window", resize: "both"});

// add elements
modal.addElement("<HTML Element>");

// or markup
modal.addMarkup("<HTML markup>");

// append to your page
document.body.appendChild(modal);

// open
modal.open();
```
