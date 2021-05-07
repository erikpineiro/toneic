
import apiBridge from "../apiBridge.js";
import * as Behaviour from "../behaviour.js";
import * as Error from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { Waiter } from "../waiter.js";

function getResults () {
    let button = document.createElement("button");
    button.classList.add("wideButton");
    button.textContent = "Ligorna";
    
    button.click({
        callback: () => { console.log("ligorna"); }
    });

    return button;
}
function getArchive () {
    let button = document.createElement("button");
    button.classList.add("wideButton");
    button.textContent = "Tidigare Toneics";
    
    button.click({
        callback: () => { console.log("tidigare"); }
    });

    return button;
}
function getHero () {
    let div = document.createElement("div");
    div.id = "hero";

    div.innerHTML = `
        <p>Detta är Toneic.</p>
        <p>Varje fredag kl19 släpper vi en utmaning.</p>
        <p>
            Fram till söndagen kl 23:59 kan du tävla,
            <br>
            på egen hand eller i lag
        </p>
        <p>
            ...eller så löser du utmaningen i din egen takt.
        </p>          
    `;

    return div;
}
function getAlone () {
    let button = document.createElement("button");
    button.classList.add("wideButton");
    button.textContent = "På egen hand";
    
    button.click({
        callback: function(){

            // Automatically join own team. If logged in.
            if (State.local.loggedIn) {
                apiBridge.joinOwnTeam();
            }

            // Go to View
            SubPub.publish({
                event: "event::view",
                detail: { view: "toneic" }
            });
         }
    });

    return button;
}
function getTeams () {

    let div = document.createElement("div");
    div.id = "teamButtons";

    div.innerHTML = `
        <button class="wideButton" id="previousTeam" style="display:none;">Med <span>senaste laget</span></button>
        <button class="wideButton" id="existingTeam">Med ett befintligt lag</span></button>
        <button class="wideButton" id="newTeam">Registrera ett nytt lag</span></button>
    `;
    
    SubPub.subscribe({
        event: "event::user:login:success",
        listener: (detail) => {

            let { previousTeam } = detail;

            if (previousTeam) {
                home.querySelector("#previousTeam span").textContent = previousTeam;
                home.querySelector("#previousTeam").style.display = "block";
                home.querySelector("#existingTeam").textContent = "Med ett annat befintligt lag";
            }
        }
    });


    return div;
}

export function init (home) {

    home.style.zIndex = 2; // Because it's the first one to be seen

    let { phase } = State.local.serverPhase;

    home.append(getHero());

    switch (phase) {
        case "phase::Relax":
            home.append(getArchive());
            home.append(getResults());
            break;
        case "phase::Ready":
            // homeReady({home, timeLeft});
            break;
        case "phase::Toneic":
            home.append(getAlone());
            home.append(getTeams());
            break;
        default:
            console.log(State.local.serverPhase);
            Error.myError.throw();
            break;
    }     

    
    // Event subscriptions
    home.subscribe({
        event: "event::newServerPhase",
        callback: function(e) {
            let { phase, timeLeft } = e.detail;
            console.log("home - new Server Phase", phase);
        }
    });


    Waiter.hasHappened("thing::home:view:inited");

}
