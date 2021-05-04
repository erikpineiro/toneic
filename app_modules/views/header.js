import * as AuxiliarFunctions from "../auxiliarFunctions.js";
import * as Behaviour from "../behaviour.js";
import * as Button from "../components/button.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";

export function init(header) {
    
    let localState = State.local;

    header.innerHTML = `
        <div class="logo">
            <div class="image"></div>
            <div class="text">TONEIC ${State.currentToneicID}</div>
        </div>
        <div class="user"></div>
        <div class="hamburger">
            <div></div>
            <div></div>
            <div></div>
        </div>
    `;


    let userHtml = header.querySelector(".user");
    let hamburgerHtml = header.querySelector(".hamburger");

    // Player / Login
    if (localState.loggedIn) {
        userHtml.textContent = localState.userName;
    } else {
        userHtml.textContent = "Ej inloggad";
    }
    
    // Hamburger
    hamburgerHtml.click({
        callback: () => {
            
            console.log("Hamburger");
            let isOpen = hamburgerHtml.classList.contains("open");
            let event = isOpen ? "event::menu:close" : "event::menu:open";

            SubPub.publish({ event });
        }
    });
    hamburgerHtml.subscribe({
        event: "event::menu:open",
        callback: () => {
            hamburgerHtml.classList.add("open");
        }
    });
    hamburgerHtml.subscribe({
        event: "event::menu:close",
        callback: () => {
            hamburgerHtml.classList.remove("open");
        }
    });

}
