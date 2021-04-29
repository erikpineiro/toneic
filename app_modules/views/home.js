
import * as Behaviour from "../behaviour.js";
import * as Error from "../error.js";
import * as Events from "../events.js";
import * as State from "../state.js"
import { Waiter } from "../waiter.js";

export function init (home) {

    home.style.zIndex = 2; // Because it's the first one to be seen

    home.innerHTML = `

        <div id="hero">
            <p>Detta är Toneic.</p>
            <p>Varje fredag kl19 släpper vi en utmaning.</p>
            <p>
                Fram till kl21 på fredagen kan du tävla,
                <br>
                på egen hand eller i lag
            </p>
            <p>
                ...eller så löser du utmaningen i din egen takt.
            </p>        
        </div>

        <div id="mainButtonsHome">

            <div id="veckansTree" class="buttonTree treeRoot">
                <button class="mainTreeButton">Till veckans Toneic</button>
                <div class="branches">
                    <button id="alone">På egen hand</button>
                    <div id="lagTree" class="buttonTree">
                        <button class="mainTreeButton">Tillsammans i ett lag</button>
                        <div class="branches">
                            <button id="previousTeam" style="display:none;">Med laget <span></span></button>
                            <button id="existingTeam">
                                <span id="aTeam">Med ett redan registrerat lag</span>
                                <span id="anotherTeam" style="display:none;">Med ett annat registrerat lag</span>
                            </button>
                            <button id="registerTeam">Registrera ett nytt lag</button>
                        </div>
                    </div>
                </div> 
            </div>

            <button id="testButtonHome" class="wideButton">TEST</button>

            <button id="archive" class="wideButton">Arkiv</button>
            <button id="league" class="wideButton">Ligan</button>

        </div>
    `;


    // BUTTONS CONTENT
    Events.addListener({
        eventName: "event::userloggedIn",
        payload: null,
        callback: (data) => {
            let { payload, dispatchData } = data;
            let previousTeam = State.get().previousTeam;
            if (previousTeam) {
                home.querySelector("#previousTeam span").textContent = previousTeam;
                home.querySelector("#existingTeam #aTeam").style.display = "none";
                home.querySelector("#existingTeam #anotherTeam").style.display = "inline";
            }
        }
    });



    // BUTTONS BEHAVIOUR

    // Alone
    Behaviour.clickable({
        element: home.querySelector("#testButtonHome"),
        callback: () => { console.log("testButtonHome"); }
    });

    // Main button tree
    home.querySelectorAll(".mainTreeButton").forEach( button => Behaviour.mainTreeButton({button}) );

    // Alone
    Behaviour.clickable({
        element: home.querySelector("#alone"),
        callback: () => { console.log("ensam"); }
    });

    // Previous Team
    Behaviour.clickable({
        element: home.querySelector("#previousTeam"),
        callback: () => { console.log("förra"); }
    });

    // Existing (A / Another) Team
    Behaviour.clickable({
        element: home.querySelector("#existingTeam"),
        callback: () => { console.log("befintligt"); }
    });

    // Register Team
    Behaviour.clickable({
        element: home.querySelector("#registerTeam"),
        callback: () => { console.log("registrera"); }
    });


    Waiter.hasHappened("home_view_inited");

    
}
