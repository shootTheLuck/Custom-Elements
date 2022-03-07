## What is this?
MenuBar, DropdownMenu, ContextMenu and MenuItem classes made using vanilla Javascript and the Custom Elements API.

[Live Demo Here](https://shootTheLuck.github.io/Menus)

## How do I use it?

```javascript
// simple case:
// import
import {MenuBar} from "./MenuBar.js";

// create instance
var menuBar = new MenuBar();

// add menu(s)
let fileMenu = menuBar.addDropdownMenu("File", ["Open...", "Close", "Save", "Cancel All Subscriptions"]);

// or markup

// append to your page
document.body.appendChild(menuBar);

// listen for selection from entire menubar:
menuBar.addEventListener("selection", (evt) => {
    console.log("from menuBar event", evt.value);
});
```
