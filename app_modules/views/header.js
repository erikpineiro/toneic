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
            
            let isOpen = hamburgerHtml.classList.contains("open");
            let event = isOpen ? "event::menu:close" : "event::menu:open";

            SubPub.publish({ event });
        }
    });



    // SUBCRIPTIONS
    SubPub.subscribe({
        event: "event::login:success",
        listener: (response) => {
            let userName = response.payload.data.userName;
            userHtml.textContent = userName;
        }
    });

    SubPub.subscribe({
        event: "event::logout:success",
        listener: (response) => {
            userHtml.textContent = "Ej inloggad";
        }
    });

    SubPub.subscribe({
        event: "event::menu:open",
        listener: () => {
            hamburgerHtml.classList.add("open");
        }
    });

    SubPub.subscribe({
        event: "event::menu:close",
        listener: () => {
            hamburgerHtml.classList.remove("open");
        }
    });

}
