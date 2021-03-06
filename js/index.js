"use strict";

// import { myError } from "../app_modules/error.js";
import { SubPub } from "../app_modules/subpub.js";
import { State } from "../app_modules/state.js";
import { View } from "../app_modules/views/views.js";
import { Waiter } from "../app_modules/waiter.js";
import { ApiBridge } from "../app_modules/apiBridge.js";
import "../app_modules/behaviour.js";



// TEST

// Login
// ApiBridge.login({
//     userName: "test",
//     password: "test",
// });

// Register
// ApiBridge.registerUser({
//     userName: auxiliarFunctions.random.string(5),
//     password: "erik",
//     email: auxiliarFunctions.random.string(5),
// });
// ApiBridge.registerUser({
//     userName: "erik",
//     password: "erik",
//     email: "erik",
// });
// setTimeout(() => {
//     ApiBridge.registerUser({
//         userName: "asdf",
//         password: "erik",
//         email: "erik"
//     });        
// }, 1000);

// Open Login
// setTimeout(() => {
//     SubPub.publish({
//         event: "event::user:login:openForm",
//     });
// }, 500);

// Update User Info
// setTimeout(() => {
//     View.UserInfo.showUserInfo({innerHTML: "gjht"});
// }, 500);

// Register Team
// ApiBridge.registerTeam({
//     userID: State.local.userID,
//     passwordForTeam: "pss",
//     token: State.local.token,
//     teamName: "Bobinas",
//     email: State.local.email,
// });

// Join Team



// Show all localStorage
function storage(){
    // console.log({...localStorage});
    console.log(State.local);
}
storage();


// RESET TONEIC SYNCH
// Otherwise it will think that there is already a synch going on
State.updateLocal({
    synchIntervalID: 0,
});


// INIT COVER
document.querySelector("#init").classList.add("on", "instant");
document.querySelector("#init").classList.remove("instant");
SubPub.subscribe({
    event: "event::leaveInit",
    listener: function (){
        View.hideCover({ cover: "init" });

        // SubPub.publish({
        //     event: "event::cover:hide",
        //     detail: { cover: "init" }
        // });
    }
});
new Waiter({
    event: "event::leaveInit",
    waitingForThings: ["thing::login:tried", "thing::home:view:inited", "thing::a:bit:of:logo"],
});
setTimeout(() => { Waiter.hasHappened("thing::a:bit:of:logo"); }, 1000);




// Prepare views. Done while INIT is on
View.Home.init(document.querySelector("#home"));
View.Header.init(document.querySelector("#header"));
View.Toneic.init(document.querySelector("#toneic"));
View.Menu.init(document.querySelector("#menu"));
View.LRJ.init(document.querySelector("#loginRegisterJoin"));
View.UserInfo.init(document.querySelector("#userInfo"));


// INITIAL SERVER PHASE
ApiBridge.serverPhase({
    callback: null
});


// INITIAL LOGIN
if (State.local.token) {

    ApiBridge.login({
        userName: State.local.userName,
        token: State.local.token,
        callback: (response) => {
            console.log(response);
            if (response.payload.data.joinedTeamID !== null) {
                ApiBridge.joinTeam({teamID: response.payload.data.joinedTeamID});
            }
            Waiter.hasHappened("thing::login:tried");
        }
    });

} else {
    console.log("No login credentials in the state");
    Waiter.hasHappened("thing::login:tried");
}

