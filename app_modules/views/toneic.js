
import ApiBridge from "../apiBridge.js";
import * as Components from "../components/components.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { showUserInfo } from "./userInfo.js";


export function init (toneic) {

    toneic.innerHTML = `
        <div id="playMode">
        </div>
        <div id="toneicContent">
            <div id="toneicMeta">
                <div class="timeLeft">Tävlingen avslutas kl20:00 (tid kvar:&nbsp<span></span>)</div>
            </div>
            <div class="podcast">Podcast</div>
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

            new Components.Crosswords({
                element: toneic.querySelector(".crosswords"),
                crosswords: response.payload.data.crosswords,
                toneicID: response.payload.data.toneicID,
            });

            ApiBridge.crosswordsLatestActions({
                toneicID: response.payload.data.toneicID,
                init: true,
            });

        }
    });
        
}

export function startSynch () {

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
}
export function stopSynch () {
    State.local.synchIntervalID && clearInterval(State.local.synchIntervalID);
}
