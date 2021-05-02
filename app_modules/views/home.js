
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
    Events.subscribe({
        event: "event::user:login:success",
        listener: (detail) => {
            let previousTeam = "Bobinas";
            // let previousTeam = State.local.previousTeam;
            if (previousTeam) {
                home.querySelector("#previousTeam span").textContent = previousTeam;
                home.querySelector("#previousTeam").style.display = "inline";
                home.querySelector("#existingTeam #aTeam").style.display = "none";
                home.querySelector("#existingTeam #anotherTeam").style.display = "inline";
            }
        }
    });



    // BUTTONS BEHAVIOUR
    // Main buttons tree
    home.querySelectorAll(".mainTreeButton").forEach( button => Behaviour.mainTreeButton({button}) );

    // Alone
    home.querySelector("#alone").click({
        callback: function(){
            Events.publish({
                event: "event::view",
                detail: { view: "toneic" }
            });
         }
    });

    // Previous Team
    home.querySelector("#previousTeam").click({
        callback: function(){ console.log("förra"); }
    });

    // Existing (A / Another) Team
    home.querySelector("#existingTeam").click({
        callback: function(){ console.log("befintligt"); }
    });

    // Register Team
    home.querySelector("#registerTeam").click({
        callback: function(){ console.log("registrera"); }
    });



    // TEST BUTTON
    home.querySelector("#testButtonHome").click({
        callback: function(){
            Events.publish({
                event: "event::user:login:success",
                detail: null
            });            
        }
    });
    home.querySelector("#previousTeam span").subscribe({
        event: "event::user:login:success",
        callback: function(){ console.log("yeah") }
    });



    Waiter.hasHappened("thing::home:view:inited");

    
}
