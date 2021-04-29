"use strict";

import { login } from "../app_modules/apiBridge.js";
import * as Events from "../app_modules/events.js";
import * as State from "../app_modules/state.js";
import * as View from "../app_modules/views/views.js"
import { Waiter } from "../app_modules/waiter.js";



document.querySelector("main").innerHTML = `
    <div id="content">
        <div id="header"></div>
        <div id="menu"></div>
        <div id="views">
            <div id="home" class="view disappearable"></div>
            <div id="toneic" class="view disappearable">TONEIC</div>
            <div id="archive" class="view disappearable">ARKIV</div>
            <div id="league" class="view disappearable">LIGA</div>
        </div>
    </div>
    <div id="init" class="disappearable">INIT PAGE</div>
`;



// Initial Event Listeners
Events.addListener({
    eventName: "event::leaveInit",
    payload: null,
    callback: leaveInit
});



// Create a waiter to leave the logo page
new Waiter({
    name: "leave_logo_page",
    waitingFor: ["login_tried", "home_view_inited", "at_least_a_bit_of_logo"],
    callback: () => { Events.dispatchEvent({ eventName: "event::leaveInit" }); }
});
setTimeout(() => { Waiter.hasHappened("at_least_a_bit_of_logo"); }, 1000);



// Init next view. This is done while the logo is on top
View.Home.init(document.querySelector("#home"));
View.Header.init(document.querySelector("#header"));





// Async Load rest of the stuff




// Try login
if (typeof initData !== "undefined" && initData.loggedIn) {

    State.set(initData);
    Waiter.hasHappened("login_tried");
    
} else {

    if (State.get().token) {

        login({
            userName: State.get().userName,
            token: State.get().token,
            callback: (response) => { 
                console.log(response);
                Waiter.hasHappened("login_tried");
            }
        });

    } else {

        console.log("No login credentials in the state");
        Waiter.hasHappened("login_tried");

    }

}




// Functions and callbacks
function leaveInit() {

    console.log("leave init");
    document.querySelector("#init").classList.add("disappear");

}

