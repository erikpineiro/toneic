"use strict";

import ApiDB from "../app_modules/apiBridge.js";
import { myError } from "../app_modules/error.js";
import { SubPub } from "../app_modules/subpub.js";
import { State } from "../app_modules/state.js";
import * as View from "../app_modules/views/views.js"
import { Waiter } from "../app_modules/waiter.js";


// TEST

// Login
// ApiDB.login({
//     userName: "test",
//     password: "test",
// });

// Register
// ApiDB.register({
//     userName: "erik",
//     password: "erik",
//     email: "erik"
// });
// setTimeout(() => {
//     ApiDB.register({
//         userName: "asdf",
//         password: "erik",
//         email: "erik"
//     });        
// }, 1000);

// Open Login
// setTimeout(() => {
//     SubPub.publish({
//         event: "event::login:openForm",
//     });
// }, 500);

// Update User Info
// setTimeout(() => {
//     View.UserInfo.showUserInfo({innerHTML: "gjht"});
// }, 500);


// Access localStorage
function storage(){
    // console.log({...localStorage});
    console.log(State.local);
}
storage();






// INIT COVER
document.querySelector("#init").classList.add("on", "instant");
document.querySelector("#init").classList.remove("instant");
SubPub.subscribe({
    event: "event::leaveInit",
    listener: function (){
        SubPub.publish({
            event: "event::cover:hide",
            detail: { cover: "init" }
        });
    }
});
new Waiter({
    event: "event::leaveInit",
    waitingForThings: ["thing::login:tried", "thing::home:view:inited", "thing::a:bit:of:logo"],
});
setTimeout(() => { Waiter.hasHappened("thing::a:bit:of:logo"); }, 1000);



// INIT DATA
if (typeof initData === "undefined") {
    myError.throw();
}

// Update serverPhase, etc
State.updateLocal(initData);


// INITIAL LOGIN
if (initData.loggedIn) {
    
    SubPub.publish({
        event: "event::login:success",
        detail: initData.userData
    })
    Waiter.hasHappened("thing::login:tried");

} else {

    if (State.local.token) {

        ApiDB.login({
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



// Prepare views. Done while INIT is on
View.Home.init(document.querySelector("#home"));
View.Header.init(document.querySelector("#header"));
View.Toneic.init(document.querySelector("#toneic"));
View.Menu.init(document.querySelector("#menu"));
View.LoginRegister.init(document.querySelector("#loginRegister"));
View.UserInfo.init(document.querySelector("#userInfo"));


