
import ApiBridge from "../apiBridge.js";
import * as Behaviour from "../behaviour.js";
import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { Waiter } from "../waiter.js";
import { LoginRegisterJoin } from "./views.js";

// function getResults () {
//     let button = document.createElement("button");
//     button.classList.add("wideButton");
//     button.textContent = "Ligorna";
    
//     button.click({
//         callback: () => { console.log("ligorna"); }
//     });

//     return button;
// }
// function getArchive () {
//     let button = document.createElement("button");
//     button.classList.add("wideButton");
//     button.textContent = "Tidigare Toneics";
    
//     button.click({
//         callback: () => { console.log("tidigare"); }
//     });

//     return button;
// }
// function getHero () {
//     let div = document.createElement("div");
//     div.id = "hero";

//     div.innerHTML = `
//         <p>Detta är Toneic.</p>
//         <p>Varje fredag kl19 släpper vi en utmaning.</p>
//         <p>
//             Fram till söndagen kl 23:59 kan du tävla,
//             <br>
//             på egen hand eller i lag
//         </p>
//         <p>
//             ...eller så löser du utmaningen i din egen takt.
//         </p>      
//     `;

//     div.subscribe({
//         event: "event::serverPhase:success",
//         callback: (e) => {
//             let { phase, timeLeft } = e.detail.payload.data;
//             console.log(phase);
//             switch (phase) {
//                 case "phase::Relax":
//                     break;
//                 case "phase::Ready":
//                     break;
//                 case "phase::Toneic":
//                     div.innerHTML += `
//                         <h3>Veckans Toneic pågår just nu!</h3>
//                     `;
//                     break;
//                 default:
//                     myError.throw();
//             }
//         }
//     });

//     return div;
// }
// function getAlone () {
//     let button = document.createElement("button");
//     button.classList.add("wideButton");
//     button.textContent = "Lös den på egen hand";
    
//     button.click({
//         callback: function(){

//             // Automatically join own team. If logged in.
//             if (State.local.token) {
//                 ApiBridge.joinOwnTeam({
//                     callback: joinTeamResponse
//                 });
//             } else {
//                 goToToneic();
//             }

//          }
//     });

//     return button;
// }
// function getTeams () {

//     let div = document.createElement("div");
//     div.id = "teamButtons";

//     div.innerHTML = `
//         <button class="wideButton" id="latestTeam" style="display:none;">Lös den med <span>senaste laget</span></button>
//         <button class="wideButton joinRegister" id="enrolInTeam">Joina ett lag</button>
//         <button class="wideButton joinRegister" id="newTeam">Registrera ett nytt lag</span></button>
//     `;
    

//     div.querySelector("#latestTeam").click({
//         callback: () => {
//             ApiBridge.joinTeam({
//                 teamName: div.querySelector("#latestTeam span").textContent,
//                 callback: joinTeamResponse
//             })
//         }
//     });
//     div.querySelector("#enrolInTeam").click({
//         callback: () => {
//             LoginRegisterJoin.showLoginRegisterJoin({ 
//                 which: "join",
//                 callback: joinTeamResponse
//             });
//         }
//     });


//     SubPub.subscribe({
//         event: "event::user:login:success",
//         listener: (response) => {
//             let { latestTeamName } = response.payload.data;

//             if (latestTeamName) {
//                 div.querySelector("#latestTeam span").textContent = latestTeamName;
//                 div.querySelector("#latestTeam").style.display = "block";
//                 div.querySelector("#enrolInTeam").textContent = "Joina ett annat lag";
//             }
//         }
//     });

//     SubPub.subscribe({
//         event: "event::team:join:success",
//         listener: (response) => {
//             let { teamName } = response.payload.data;
//             console.log(response);
//             div.querySelector("#latestTeam span").textContent = teamName;
//             div.querySelector("#latestTeam").style.display = "block";
//             div.querySelector("#enrolInTeam").textContent = "Joina ett annat lag";
//         }
//     });

//     return div;
// }

export function init (home) {

    home.style.zIndex = 2; // Because it's the first one to be seen

    home.innerHTML = `
        <div id="homeHero" class="relax toneic ready">
            <p>Detta är Toneic.</p>
            <p>Varje fredag kl19 släpper vi en utmaning.</p>
            <p>
                Fram till söndagen kl 21:00 kan du tävla,
                <br>
                på egen hand eller i lag
            </p>
        </div>

        <button class="wideButton relax" id="homeButtonTidigare">Tidigare Toneics</button>
        <button class="wideButton relax" id="homeButtonResults">Resultat</button>

        <div class="ready" id="homeReady">Ready</div>

        <button class="wideButton toneic" id="homeButtonSolveAlone">Lös den på egen hand</button>
        <button class="wideButton toneic" id="homeButtonSolveTeam" style="display:none;">Lös den med <span>ditt lag</span></button>
        <button class="wideButton joinRegister toneic" id="homeButtonJoinTeam" disabled="true">Joina ett lag <span>(du måste vara inloggad)</span></button>
        <button class="wideButton joinRegister toneic" id="homeButtonRegisterTeam" disabled="true">Registrera ett nytt lag <span>(du måste vara inloggad)</span></button>
    `;


    // CLICKS
    home.querySelector("#homeButtonSolveAlone").click({ callback: () => {
        ApiBridge.joinOwnTeam({
            callback: (response) => {
                if (response.success && response.payload.data.joined) {
                    goToToneic();
                }
            }
        });

    } });
    home.querySelector("#homeButtonSolveTeam").click({ callback: goToToneic });
    home.querySelector("#homeButtonJoinTeam").click({ callback: () => LoginRegisterJoin.showLoginRegisterJoin({ which: "join" }) });
    home.querySelector("#homeButtonRegisterTeam").click({ callback: () => LoginRegisterJoin.showLoginRegisterJoin({ which: "registerTeam" }) });

    
    // Event subscriptions
    SubPub.subscribe({
        event: "event::serverPhase:success",
        listener: function(response) {
            let { phase, timeLeft } = response.payload.data;
            
            home.querySelectorAll(`#home >*:not(.phase)`).forEach( e => e.style.display = "auto");

            phase = phase.substr(phase.indexOf("::") + 2).toLowerCase();
            home.querySelectorAll(`#home >*:not(.${phase})`).forEach( e => e.style.display = "none");

        }
    });

    SubPub.subscribe({
        event: "event::team:join:success",
        listener: (response) => {
            let { teamName } = response.payload.data;
            if (teamName) {
                home.querySelector("#homeButtonSolveTeam span").textContent = teamName;
                home.querySelector("#homeButtonSolveTeam").style.display = "block";
                home.querySelector("#homeButtonJoinTeam").textContent = "Byt lag";
            } else {
                // Joined own team
                home.querySelector("#homeButtonSolveTeam span").textContent = "ditt lag";
                home.querySelector("#homeButtonSolveTeam").style.display = "none";
                home.querySelector("#homeButtonJoinTeam").textContent = "Joina ett lag";
            }
        }
    });

    SubPub.subscribe({
        event: "event::user:login:success",
        listener: (response) => {
            // home.querySelector("#homeButtonJoinTeam").style.display = "none";
            home.querySelector("#homeButtonJoinTeam").removeAttribute("disabled");

            home.querySelector("#homeButtonRegisterTeam span").style.display = "none";
            home.querySelector("#homeButtonRegisterTeam").removeAttribute("disabled");
        }
    });

    SubPub.subscribe({
        event: "event::user:logout:success",
        listener: (response) => {
            // home.querySelector("#homeButtonJoinTeam").style.display = "inline";
            home.querySelector("#homeButtonJoinTeam").setAttribute("disabled", "true");

            home.querySelector("#homeButtonRegisterTeam span").style.display = "inline";
            home.querySelector("#homeButtonRegisterTeam").setAttribute("disabled", "true");
        }
    });


    Waiter.hasHappened("thing::home:view:inited");

}

// function joinTeamResponse (response) {
//     if (response.success && response.payload.data.joined) {
//         goToToneic();
//     } else {
//         // TODO
//         console.log(response.message, response.payload.data.message);
//     }    
// }
function goToToneic () {

    ApiBridge.crosswordsLatestActions({
        toneicID: State.local.currentToneicID,
        init: true,
        callback: (response) => {}
    })

    SubPub.publish({
        event: "event::view",
        detail: { view: "toneic" }
    });


}