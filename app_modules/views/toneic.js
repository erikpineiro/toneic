
import ApiBridge from "../apiBridge.js";
import auxiliarFunctions from "../auxiliarFunctions.js";
import * as Components from "../components/components.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { showUserInfo } from "./userInfo.js";

const crosswords = JSON.parse(`{"words": [{"origin": [0,0],"direction": "h","word": "mädrid","description": {"image": null,"podcastTime": 0,"text": "Spaniens huvudstad"}},{"origin": [3, 0],"direction": "v","word": "roma","description": {"image": null,"podcastTime": 0,"text": "huvudstad i regionen Lazio och huvudort och en kommun i storstadsregionen Rom, innan 2015 provinsen Rom."}},{"origin": [2,3],"direction": "h","word": "pariser","description": {"image": null,"podcastTime": 0,"text": "Tête de veaux"}},{"origin": [5,2],"direction": "v","word": "lima","description": {"image": "image_21v17_5_2v.jpg","podcastTime": 0,"text": ""}}],"multipliers": [{"origin": [0,0],"factor": 2}]}`);

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

            ApiBridge.latestCorsswordActions({
                toneicID: response.payload.data.toneicID,
            });

        }
    });
        
}


