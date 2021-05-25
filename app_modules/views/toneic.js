
import { ApiBridge } from "../apiBridge.js";
import { Components } from "../components/components.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";


export const Toneic = {

    init: function (toneic) {

        toneic.innerHTML = `
            <div id="playMode">
            </div>
            <div id="toneicContent">
                <div id="toneicMeta">
                    <div class="timeLeft">Tävlingen avslutas kl20:00 (tid kvar:&nbsp<span></span>)</div>
                </div>
                <div class="podcast">
                    <audio
                        controls
                        autoplay = "true"
                        muted = "true"
                        >
                        Neeej! Din webbläsare kan inte spela podden :-(.
                    </audio>
                </div>
                <div class="crosswords">Hämtar veckans Toneic...</div>
            </div>
        `;
    
        
        // Timer
        // setInterval(() => {
        //     let timeLeft = State.local.serverPhase.timeLeft - 1;
        //     State.updateTimeLeft(timeLeft);
        //     toneic.querySelector("#toneicMeta span").textContent = auxiliarFunctions.minSecs(timeLeft);
        // }, 1000);
    
        
    
        SubPub.subscribe({
            event: "event::serverPhase:success",
            listener: (response) => {
                if (response.success && response.payload.data.phase === "phase::Toneic") {
                    ApiBridge.loadToneic({
                        toneicID: State.local.currentToneicID,
                        archive: false,
                    });            
                }
            }
        })
    
        SubPub.subscribe({
            event: "event::toneic:load:success",
            listener: (response) => {

                let toneicID = response.payload.data.toneicID;
    
                toneic.querySelector(".podcast audio").setAttribute("src", `./db/toneics/${toneicID}/pod.mp3`);

                new Components.Crosswords({
                    element: toneic.querySelector(".crosswords"),
                    crosswords: response.payload.data.crosswords,
                    toneicID,
                });
    
                ApiBridge.crosswordsLatestActions({
                    toneicID,
                    init: true,
                });
    
            }
        });
            
    },

    startSynch: function () {

        if (!State.local.token || !State.local.userID) {
            console.log("user_not_loggedIn_nothing_to_synch");
            return;
        }
    
        if (State.joinedOwnTeam) {
            console.log("user_on_own_team_nothing_to_synch");
            return;
        }
    
        if (!State.local.synchIntervalID) {
            State.updateLocal({
                synchIntervalID:    setInterval(function () {
                                        ApiBridge.crosswordsSynch({
                                            toneicID: State.local.currentToneicID,
                                        });
                                    }, 4000)
            })
        }
    },

    stopSynch: function () {
        State.local.synchIntervalID && clearInterval(State.local.synchIntervalID);
    }
};



// export function init (toneic) {

//     toneic.innerHTML = `
//         <div id="playMode">
//         </div>
//         <div id="toneicContent">
//             <div id="toneicMeta">
//                 <div class="timeLeft">Tävlingen avslutas kl20:00 (tid kvar:&nbsp<span></span>)</div>
//             </div>
//             <div class="podcast">Podcast</div>
//             <div class="crosswords">Hämtar veckans Toneic...</div>
//         </div>
//     `;

    
//     // Timer
//     // setInterval(() => {
//     //     let timeLeft = State.local.serverPhase.timeLeft - 1;
//     //     State.updateTimeLeft(timeLeft);
//     //     toneic.querySelector("#toneicMeta span").textContent = auxiliarFunctions.minSecs(timeLeft);
//     // }, 1000);

    

//     SubPub.subscribe({
//         event: "event::serverPhase:success",
//         listener: (response) => {
//             if (response.success && response.payload.data.phase === "phase::Toneic") {
//                 ApiBridge.loadToneic({
//                     toneicID: State.local.currentToneicID,
//                     archive: false,
//                 });            
//             }
//         }
//     })

//     SubPub.subscribe({
//         event: "event::toneic:load:success",
//         listener: (response) => {

//             new Crosswords({
//                 element: toneic.querySelector(".crosswords"),
//                 crosswords: response.payload.data.crosswords,
//                 toneicID: response.payload.data.toneicID,
//             });

//             ApiBridge.crosswordsLatestActions({
//                 toneicID: response.payload.data.toneicID,
//                 init: true,
//             });

//         }
//     });
        
// }

// export function startSynch () {

//     if (!State.local.token || !State.local.userID) {
//         console.log("user_not_loggedIn_nothing_to_synch");
//         return;
//     }

//     if (State.joinedOwnTeam) {
//         console.log("user_on_own_team_nothing_to_synch");
//         return;
//     }

//     if (!State.local.synchIntervalID) {
//         State.updateLocal({
//             synchIntervalID:    setInterval(function () {
//                                     ApiBridge.crosswordsSynch({
//                                         toneicID: State.local.currentToneicID,
//                                     });
//                                 }, 4000)
//         })
//     }
// }
// export function stopSynch () {
//     State.local.synchIntervalID && clearInterval(State.local.synchIntervalID);
// }
