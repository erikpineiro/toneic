
import ApiBridge from "../apiBridge.js";
import * as Behaviour from "../behaviour.js";
import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { Waiter } from "../waiter.js";
import { LoginRegisterJoin } from "./views.js";

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

    div.subscribe({
        event: "event::serverPhase:success",
        callback: (e) => {
            let { phase, timeLeft } = e.detail.payload.data;
            console.log(phase);
            switch (phase) {
                case "phase::Relax":
                    break;
                case "phase::Ready":
                    break;
                case "phase::Toneic":
                    div.innerHTML += `
                        <h3>Veckans Toneic pågår just nu!</h3>
                    `;
                    break;
                default:
                    myError.throw();
            }
        }
    });

    return div;
}
function getAlone () {
    let button = document.createElement("button");
    button.classList.add("wideButton");
    button.textContent = "Lös den på egen hand";
    
    button.click({
        callback: function(){

            // Automatically join own team. If logged in.
            if (State.local.token) {
                ApiBridge.joinOwnTeam({
                    callback: joinTeamResponse
                });
            } else {
                goToToneic();
            }

         }
    });

    return button;
}
function getTeams () {

    let div = document.createElement("div");
    div.id = "teamButtons";

    div.innerHTML = `
        <button class="wideButton" id="latestTeam" style="display:none;">Lös den med <span>senaste laget</span></button>
        <button class="wideButton joinRegister" id="enrolInTeam">Joina ett lag</button>
        <button class="wideButton joinRegister" id="newTeam">Registrera ett nytt lag</span></button>
    `;
    

    div.querySelector("#latestTeam").click({
        callback: () => {
            ApiBridge.joinTeam({
                teamName: div.querySelector("#latestTeam span").textContent,
                callback: joinTeamResponse
            })
        }
    });

    div.querySelector("#enrolInTeam").click({
        callback: () => {
            LoginRegisterJoin.showLoginRegisterJoin({ 
                which: "join",
                callback: joinTeamResponse
            });
        }
    });


    SubPub.subscribe({
        event: "event::user:login:success",
        listener: (response) => {
            let { latestTeamName } = response.payload.data;

            if (latestTeamName) {
                div.querySelector("#latestTeam span").textContent = latestTeamName;
                div.querySelector("#latestTeam").style.display = "block";
                div.querySelector("#enrolInTeam").textContent = "Joina ett annat lag";
            }
        }
    });

    SubPub.subscribe({
        event: "event::team:join:success",
        listener: (response) => {
            let { teamName } = response.payload.data;
            div.querySelector("#latestTeam span").textContent = teamName;
            div.querySelector("#latestTeam").style.display = "block";
            div.querySelector("#enrolInTeam").textContent = "Joina ett annat lag";
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

    // SubPub.subscribe({
    //     event: "event::user:login:success",
    //     listener: (response) => {
    //         goToToneic();
    //     }
    // });

    Waiter.hasHappened("thing::home:view:inited");

}

function joinTeamResponse (response) {
    if (response.success && response.payload.data.joined) {
        goToToneic();
    } else {
        // TODO
        console.log(response.message, response.payload.data.message);
    }    
}
function goToToneic () {
    SubPub.publish({
        event: "event::view",
        detail: { view: "toneic" }
    });


}