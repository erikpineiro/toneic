import apiBridge from "../apiBridge.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { showLoginRegisterJoin } from "./loginRegisterJoin.js";



export function init (menu) {

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

    // if (State.local.loggedIn) {
    //     menu.querySelector("#menuLogin").classList.add("invisible");
    // } else {
    //     menu.querySelector("#menuLogout").classList.add("invisible");
    // }    


    // switch (State.local.serverPhase.phase) {

    //     case "phase::Relax":
    //         menu.querySelector("#menuToneic").style.display = "none";
    //         break;

    // }


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
        event: "event::logout:success",
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

    // // Team Join Success
    // SubPub.subscribe({
    //     event: "event::team:join:success",
    //     listener: (response) => {
    //         let { teamName, changeTeam, ownTeam, teamToneics } = response.payload.data;
            
    //         console.log(teamName, changeTeam, ownTeam, teamToneics);

    //         if (!changeTeam.new && !changeTeam.change) {
    //             console.log("no userInfo");
    //         } else {
    //             console.log("yes userInfo");
    //         }

    //         let innerHTML = "";
    //         if (ownTeam) {
    //             innerHTML = `
    //                 <p>Du löser det själv för tillfället.</p>
    //                 <button>Joina ett team</button>
    //                 `;
    //         } else {
    //             innerHTML = `
    //                 <p>Du är med i ${teamName}</p>
    //                 <button>Byt team</button>
    //                 `;
    //         }
    //         toneic.querySelector("#toneicTeamInfo").innerHTML = innerHTML;

    //     }
    // });
    



    // BUTTON ACTIONS
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
            showLoginRegisterJoin({which: "login"});
        }
    });

    menu.querySelector("#menuLogout").click({
        callback: () => {
            apiBridge.logout();
        }
    });


}