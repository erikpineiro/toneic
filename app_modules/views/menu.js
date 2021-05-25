import { ApiBridge } from "../apiBridge.js";
// import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { LRJ } from "./loginRegisterJoin.js";


export const Menu = {
    init: function (menu) {
        menu.innerHTML = `
            <div class="curtain">
                <button id="menuLogin">Login</button>
                <button id="menuLogout">Logout</button>
                <button id="menuJoinTeam">Anslut till ditt lag</button>
                <button id="menuHome">Startsidan</button>
                <button id="menuToneic">Toneic</button>
                <button id="menuArchive">Arkiv</button>
                <button id="menuLeagues">Ligor</button>
            </div>
        `;

        menu.querySelector("#menuLogout").classList.add("invisible");
        menu.querySelector("#menuJoinTeam").classList.add("invisible");


        // SUBSCRIPTIONS
        menu.subscribe({
            event: "event::menu:open",
            callback: function (detail) {
                let hMenu = parseInt(getComputedStyle(menu.querySelector(".curtain")).getPropertyValue("height"));
                let hMenu2 = parseInt(getComputedStyle(menu.querySelector(".curtain")).getPropertyValue("padding-top"));
                
                menu.style.setProperty("--hOpen", (hMenu + hMenu2) + "px");
                menu.classList.add("open");
            }
        });
        menu.subscribe({
            event: "event::menu:close",
            callback: function (detail) {
                menu.classList.remove("open");
            }
        });

        SubPub.subscribe({
            event: "event::user:logout:success",
            listener: (response) => {
                menu.querySelector("#menuLogout").classList.add("invisible");
                menu.querySelector("#menuLogin").classList.remove("invisible");
            }
        });
        
        SubPub.subscribe({
            event: "event::user:login:success",
            listener: (response) => {
                menu.querySelector("#menuLogout").classList.remove("invisible");
                menu.querySelector("#menuLogin").classList.add("invisible");
                // menu.querySelector("#menuJoinTeam").classList.remove("invisible");
            }
        });


        // CLICKS
        menu.querySelectorAll("button").forEach( b => {
            b.click({
                callback: () => {
                    setTimeout(() => {
                        SubPub.publish({
                            event: "event::menu:close"
                        })
                    }, 100);
                }
            })
        });

        menu.querySelector("#menuLogin").click({
            callback: () => {
                LRJ.showLoginRegisterJoin({which: "login"});
            }
        });

        menu.querySelector("#menuLogout").click({
            callback: () => {
                ApiBridge.logout();
            }
        });
            
    },
};

// export function init (menu) {

//     menu.innerHTML = `
//         <div class="curtain">
//             <button id="menuLogin">Login</button>
//             <button id="menuLogout">Logout</button>
//             <button id="menuJoinTeam">Anslut till ditt lag</button>
//             <button id="menuHome">Startsidan</button>
//             <button id="menuToneic">Toneic</button>
//             <button id="menuArchive">Arkiv</button>
//             <button id="menuLeagues">Ligor</button>
//         </div>
//     `;

//     menu.querySelector("#menuLogout").classList.add("invisible");
//     menu.querySelector("#menuJoinTeam").classList.add("invisible");


//     // SUBSCRIPTIONS
//     menu.subscribe({
//         event: "event::menu:open",
//         callback: function (detail) {
//             let hMenu = parseInt(getComputedStyle(menu.querySelector(".curtain")).getPropertyValue("height"));
//             let hMenu2 = parseInt(getComputedStyle(menu.querySelector(".curtain")).getPropertyValue("padding-top"));
            
//             menu.style.setProperty("--hOpen", (hMenu + hMenu2) + "px");
//             menu.classList.add("open");
//         }
//     });
//     menu.subscribe({
//         event: "event::menu:close",
//         callback: function (detail) {
//             menu.classList.remove("open");
//         }
//     });

//     SubPub.subscribe({
//         event: "event::user:logout:success",
//         listener: (response) => {
//             menu.querySelector("#menuLogout").classList.add("invisible");
//             menu.querySelector("#menuLogin").classList.remove("invisible");
//         }
//     });
    
//     SubPub.subscribe({
//         event: "event::user:login:success",
//         listener: (response) => {
//             menu.querySelector("#menuLogout").classList.remove("invisible");
//             menu.querySelector("#menuLogin").classList.add("invisible");
//             // menu.querySelector("#menuJoinTeam").classList.remove("invisible");
//         }
//     });


//     // CLICKS
//     menu.querySelectorAll("button").forEach( b => {
//         b.click({
//             callback: () => {
//                 setTimeout(() => {
//                     SubPub.publish({
//                         event: "event::menu:close"
//                     })
//                 }, 100);
//             }
//         })
//     });

//     menu.querySelector("#menuLogin").click({
//         callback: () => {
//             showLoginRegisterJoin({which: "login"});
//         }
//     });

//     menu.querySelector("#menuLogout").click({
//         callback: () => {
//             ApiBridge.logout();
//         }
//     });


// }