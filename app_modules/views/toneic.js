
import { ApiBridge } from "../apiBridge.js";
import { Components } from "../components/components.js";
import { State } from "../state.js";
import { Utils } from "../utils.js";
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
                    <audio>
                        Neeej! Din webbläsare kan inte spela podden :-(.
                    </audio>
                    <div id="podControls"></div>
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
    
        
        PodControls({
            controls: toneic.querySelector("#podControls"),
            audio: toneic.querySelector("audio")
        });

    
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

        console.log("STARTED SYNCH", State.local.synchIntervalID);

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
                                        console.log();
                                        console.log("SYNCH");
                                        console.log();
                                        ApiBridge.crosswordsSynch({
                                            toneicID: State.local.currentToneicID,
                                        });
                                    }, 4000)
            });
        }
    },

    stopSynch: function () {
        State.local.synchIntervalID && clearInterval(State.local.synchIntervalID);
    }
};

function PodControls(data) {
    let { controls, audio } = data;

    audio.volume = 1;

    controls.innerHTML = `
        <span class="fbSpan">
            <button class="back b60">-60s</button>
            <button class="back b15">-15s</button>
        </span>
        <span class="timeSpan">
            <button class="play">Play</button>
            <span>
                <span class="currentTime">00:00</span>
                <span class="totalTime">&nbsp&nbspav&nbsp&nbsp<span>--:--</span></span>
            </span>
        </span>
        <span class="fbSpan">
            <button class="front f15">+15s</button>
            <button class="front f60">+60s</button>
        </span>
    `;

    controls.querySelector(".b60").click({ callback: () => { audio.currentTime -= 60 } });
    controls.querySelector(".b15").click({ callback: () => { audio.currentTime -= 15 } });
    controls.querySelector(".f60").click({ callback: () => { audio.currentTime += 60 } });
    controls.querySelector(".f15").click({ callback: () => { audio.currentTime += 15 } });
    
    controls.querySelector(".play").click({ callback: function() { 
        audio.paused ? audio.play() : audio.pause();
        this.textContent = audio.paused ? "Play" : "Pause";
    } });

    audio.addEventListener("loadedmetadata", function(){
        controls.querySelector(".totalTime span").textContent = Utils.hoursMinsSecs(Math.floor(audio.duration));
    });

    audio.addEventListener("timeupdate", function(){
        controls.querySelector(".currentTime").textContent = Utils.hoursMinsSecs(Math.floor(audio.currentTime));
    });
}

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
