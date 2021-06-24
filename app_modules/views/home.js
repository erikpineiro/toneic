
import { ApiBridge } from "../apiBridge.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { Waiter } from "../waiter.js";
import { LRJ } from "./loginRegisterJoin.js";
import { View } from "./views.js";



export const Home = {

    init: function (home) {

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
    
            <button class="wideButton toneic" id="homeButtonSolve">Till veckans Toneic</button>
            <button class="wideButton joinRegister toneic" id="homeButtonJoinTeam" disabled="true">Joina ett lag <span>(logga in först)</span></button>
            <button class="wideButton joinRegister toneic" id="homeButtonRegisterTeam" disabled="true">Registrera ett nytt lag <span>(logga in först)</span></button>
        `;
    
    
        // CLICKS
        home.querySelector("#homeButtonSolve").click({ callback: () => {
            goToToneic();
        } });
        home.querySelector("#homeButtonJoinTeam").click({ callback: () => LRJ.showLoginRegisterJoin({ which: "join" }) });
        home.querySelector("#homeButtonRegisterTeam").click({ callback: () => LRJ.showLoginRegisterJoin({ which: "registerTeam" }) });
        
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
                let { ownTeam } = response.payload.data;
                if (ownTeam) {
                    home.querySelector("#homeButtonJoinTeam").textContent = "Joina ett lag";
                } else {
                    home.querySelector("#homeButtonJoinTeam").textContent = "Byt lag";
                }
            }
        });
    
        SubPub.subscribe({
            event: "event::user:login:success",
            listener: (response) => {
                home.querySelector("#homeButtonJoinTeam").removeAttribute("disabled");
    
                home.querySelector("#homeButtonRegisterTeam span").style.display = "none";
                home.querySelector("#homeButtonRegisterTeam").removeAttribute("disabled");
            }
        });
    
        SubPub.subscribe({
            event: "event::user:logout:success",
            listener: (response) => {
                home.querySelector("#homeButtonJoinTeam span").style.display = "inline";
                home.querySelector("#homeButtonJoinTeam").setAttribute("disabled", "true");
    
                home.querySelector("#homeButtonRegisterTeam span").style.display = "inline";
                home.querySelector("#homeButtonRegisterTeam").setAttribute("disabled", "true");
            }
        });
    
    
        Waiter.hasHappened("thing::home:view:inited");
    
    }
};



// export function init (home) {

//     home.style.zIndex = 2; // Because it's the first one to be seen

//     home.innerHTML = `
//         <div id="homeHero" class="relax toneic ready">
//             <p>Detta är Toneic.</p>
//             <p>Varje fredag kl19 släpper vi en utmaning.</p>
//             <p>
//                 Fram till söndagen kl 21:00 kan du tävla,
//                 <br>
//                 på egen hand eller i lag
//             </p>
//         </div>

//         <button class="wideButton relax" id="homeButtonTidigare">Tidigare Toneics</button>
//         <button class="wideButton relax" id="homeButtonResults">Resultat</button>

//         <div class="ready" id="homeReady">Ready</div>

//         <button class="wideButton toneic" id="homeButtonSolve">Till veckans Toneic</button>
//         <button class="wideButton joinRegister toneic" id="homeButtonJoinTeam" disabled="true">Joina ett lag <span>(du måste vara inloggad)</span></button>
//         <button class="wideButton joinRegister toneic" id="homeButtonRegisterTeam" disabled="true">Registrera ett nytt lag <span>(du måste vara inloggad)</span></button>
//     `;


//     // CLICKS
//     home.querySelector("#homeButtonSolve").click({ callback: () => {
//         goToToneic();
//     } });
//     home.querySelector("#homeButtonJoinTeam").click({ callback: () => LoginRegisterJoin.showLoginRegisterJoin({ which: "join" }) });
//     home.querySelector("#homeButtonRegisterTeam").click({ callback: () => LoginRegisterJoin.showLoginRegisterJoin({ which: "registerTeam" }) });

    
//     // Event subscriptions
//     SubPub.subscribe({
//         event: "event::serverPhase:success",
//         listener: function(response) {
//             let { phase, timeLeft } = response.payload.data;
            
//             home.querySelectorAll(`#home >*:not(.phase)`).forEach( e => e.style.display = "auto");

//             phase = phase.substr(phase.indexOf("::") + 2).toLowerCase();
//             home.querySelectorAll(`#home >*:not(.${phase})`).forEach( e => e.style.display = "none");

//         }
//     });

//     SubPub.subscribe({
//         event: "event::team:join:success",
//         listener: (response) => {
//             let { ownTeam } = response.payload.data;
//             if (ownTeam) {
//                 home.querySelector("#homeButtonJoinTeam").textContent = "Joina ett lag";
//             } else {
//                 home.querySelector("#homeButtonJoinTeam").textContent = "Byt lag";
//             }
//         }
//     });

//     SubPub.subscribe({
//         event: "event::user:login:success",
//         listener: (response) => {
//             home.querySelector("#homeButtonJoinTeam").removeAttribute("disabled");

//             home.querySelector("#homeButtonRegisterTeam span").style.display = "none";
//             home.querySelector("#homeButtonRegisterTeam").removeAttribute("disabled");
//         }
//     });

//     SubPub.subscribe({
//         event: "event::user:logout:success",
//         listener: (response) => {
//             home.querySelector("#homeButtonJoinTeam").setAttribute("disabled", "true");

//             home.querySelector("#homeButtonRegisterTeam span").style.display = "inline";
//             home.querySelector("#homeButtonRegisterTeam").setAttribute("disabled", "true");
//         }
//     });


//     Waiter.hasHappened("thing::home:view:inited");

// }

function goToToneic () {

    ApiBridge.crosswordsLatestActions({
        toneicID: State.local.currentToneicID,
        init: true,
        callback: (response) => {}
    })

    View.showView({
        view: "toneic",
    });


}