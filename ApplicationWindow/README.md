## What is this?
An ApplicationWindow class made using vanilla Javascript and the Custom Elements API.

[Live Demo Here](https://shootTheLuck.github.io/CustomElements/ApplicationWindow)

## How do I use it?
```javascript
// import
import {ApplicationWindow} from "./ApplicationWindow.js";

// create instance
const appWindow = new ApplicationWindow({title: "Application Window", resize: "both"});

// add elements
appWindow.addElement("<HTML Element>");

// or markup
appWindow.addMarkup("<HTML markup>");

// append to your page
document.body.appendChild(appWindow);

// open
appWindow.open();
```
