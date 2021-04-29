"use strict";

import * as Components from "../app_modules/components/components.js";
import * as Events from "../app_modules/events.js";


console.log(userInfo);
console.log(localStorage.getItem("localState"));

let e_vent1 = new Event("test");
console.log(Event);;

let listeners = [];
function addListener(event, main, callback) {
    main.addEventListener(event.type, callback);
    listeners.push({
        type: event.type,
        main
    });
}
function dispatchEvent(e) {
    listeners.filter(lst => lst.type === e.type).forEach(lst => lst.main.dispatchEvent(e));
}
addListener(e_vent1, document.querySelector("body"), () => {console.log("testEvent");});
dispatchEvent(e_vent1);



let localState = mergeWithLocalState(userInfo);

// const Control = {
//     eventHandler,
//     localState: mergeWithLocalState(userInfo)
// };



// *************
// VIEWS
let main = document.querySelector("main");

// Header
main.append(Components.Header.create(localState));


// Main
switch (localState.view) {
    
    case "HOME":
        let vSeparator = "2vh";

        main.append(Components.Hero.create());
        main.append(Components.Separator.create({ dir: "v", size: vSeparator}));

        main.append(Components.MainButtonsHome.create({ localState }));

    break;
    case "TONEIC": 

    break;
    default:

    break;

}


// function eventHandler (data) {

//     let { event, localStateUpdate = {} } = data;
//     Control.localState = { ...Control.localState, localStateUpdate };

//     switch (event) {

//         case "event:login"
//     }

// }




function mergeWithLocalState(data){

    let localState = localStorage.getItem("localState");
    if (localState) {
        localState = JSON.parse(localState);
    } else {
        localState = {
            view: "HOME",
            lastPlayedWith: null,
        };
    }
    localState = {...localState, data};
    localStorage.setItem("localState", JSON.stringify(localState));
    
    return localState;
}

