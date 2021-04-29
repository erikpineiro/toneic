import * as AuxiliarFunctions from "../auxiliarFunctions.js";
import * as Behaviour from "../behaviour.js";
import * as Button from "../components/button.js";
import * as State from "../state.js";

export function init(header) {
    
    let localState = State.get();

    header.innerHTML = `
        <div class="logo">
            <div class="image"></div>
            <div class="text">TONEIC ${AuxiliarFunctions.toneicWeek()}</div>
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
    Behaviour.clickable({
        element: hamburgerHtml,
        callback: () => { console.log("Hamburger"); }
    });

}
