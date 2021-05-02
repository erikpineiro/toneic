"use strict";

import { login } from "../app_modules/apiBridge.js";
import * as Events from "../app_modules/events.js";
import State from "../app_modules/state.js";
import * as View from "../app_modules/views/views.js"
import { Waiter } from "../app_modules/waiter.js";



// Leaving INIT
// Listen to "event::leaveInit"
Events.subscribe({
    event: "event::leaveInit",
    listener: function (){
        document.querySelector("#init").classList.add("disappear");
    }
});
// Create a waiter to leave init
new Waiter({
    event: "event::leaveInit",
    waitingForThings: ["thing::login:tried", "thing::home:view:inited", "thing::a:bit:of:logo"],
});
setTimeout(() => { Waiter.hasHappened("thing::a:bit:of:logo"); }, 1000);



// Prepare some views. Done while INIT is on
View.Home.init(document.querySelector("#home"));
View.Header.init(document.querySelector("#header"));
View.Toneic.init(document.querySelector("#toneic"));


// TEST
document.querySelector("#home").style.display = "none";

// Async Load rest of the stuff




// Try login
if (typeof initData !== "undefined" && initData.loggedIn) {

    State.local = initData;
    Waiter.hasHappened("thing::login:tried");
    
} else {

    if (State.local.token) {

        login({
            userName: State.local.userName,
            token: State.local.token,
            callback: (response) => { 
                console.log(response);
                Waiter.hasHappened("thing::login:tried");
            }
        });

    } else {

        console.log("No login credentials in the state");
        Waiter.hasHappened("thing::login:tried");

    }

}




