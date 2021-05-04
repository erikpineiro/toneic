import { State } from "../state.js";
import { SubPub } from "../subpub.js";



export function init (menu) {

    menu.innerHTML = `
        <div class="curtain">
            <button id="menuLogin">Login</button>
            <button id="menuLogout">Logout</button>
            <button id="menuHome">Startsidan</button>
            <button id="menuToneic">Toneic</button>
            <button id="menuArchive">Arkiv</button>
            <button id="menuLeagues">Ligor</button>
        </div>
    `;

    if (State.local.loggedIn) {
        menu.querySelector("#menuLogin").style.display = "none";
    } else {
        menu.querySelector("#menuLogout").style.display = "none";
    }

    switch (State.local.serverPhase.phase) {

        case "phase::Relax":
            menu.querySelector("#menuToneic").style.display = "none";
            break;

    }

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


    // Button actions
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
    })


    menu.querySelector("#menuLogin").click({
        callback: () => {
            SubPub.publish({
                event: "event::login:openForm"
            });
        }
    })

}