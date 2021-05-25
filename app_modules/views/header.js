import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { LRJ } from "./loginRegisterJoin.js";


export const Header = {
    init: function (header) {
    
        let localState = State.local;
    
        header.innerHTML = `
            <div class="logo">
                <div class="image"></div>
                <div class="text">TONEIC&nbsp<span></span></div>
            </div>
            <div class="userLine">
                <button class="invisible">Joina ett lag</button>
                <span class="team invisible"> - <span></span> - </span>
                <span class="user">Ej inloggad</span>
            </div>
            <div class="hamburger">
                <div></div>
                <div></div>
                <div></div>
            </div>
        `;
    
    
        let userHtml = header.querySelector(".userLine .user");
        let teamHtml = header.querySelector(".userLine .team");
        let hamburgerHtml = header.querySelector(".hamburger");
        let buttonHtml = header.querySelector(".userLine button");
    
    
        
        // Hamburger
        hamburgerHtml.click({
            callback: () => {
                
                let isOpen = hamburgerHtml.classList.contains("open");
                let event = isOpen ? "event::menu:close" : "event::menu:open";
    
                SubPub.publish({ event });
            }
        });
    
    
        // CLICK
        header.querySelector(".userLine button").click({
            callback: () => {
                LRJ.showLoginRegisterJoin({ which: "join" });
            }
        });
    
    
        // SUBCRIPTIONS
        SubPub.subscribe({
            event: "event::user:login:success",
            listener: (response) => {
                let userName = response.payload.data.userName;
                userHtml.textContent = userName;
    
                buttonHtml.classList.remove("invisible");
            }
        });
    
        SubPub.subscribe({
            event: "event::user:logout:success",
            listener: (response) => {
                userHtml.textContent = "Ej inloggad";
                buttonHtml.classList.add("invisible");
            }
        });
    
        SubPub.subscribe({
            event: "event::menu:open",
            listener: () => {
                hamburgerHtml.classList.add("open");
            }
        });
    
        SubPub.subscribe({
            event: "event::menu:close",
            listener: () => {
                hamburgerHtml.classList.remove("open");
            }
        });
    
        SubPub.subscribe({
            event: "event::serverPhase:success",
            listener: (response) => {
                let { toneicID } = response.payload.data;
                header.querySelector(".logo .text span").textContent = toneicID;
            }
        });
        
        SubPub.subscribe({
            event: "event::team:join:success",
            listener: (response) => {
                let { ownTeam, teamName } = response.payload.data;
    
                let buttonText = ownTeam ? "Joina ett lag" : "Byt lag";
                buttonHtml.textContent = buttonText;
    
                if (!ownTeam) {
                    teamHtml.classList.remove("invisible");
                    teamHtml.querySelector("span span").textContent = `${teamName}`;
                } else {
                    teamHtml.classList.add("invisible");
                    teamHtml.querySelector("span span").textContent = ``;
                }
            }
        });    
    }
    
};

// export function init(header) {
    
//     let localState = State.local;

//     header.innerHTML = `
//         <div class="logo">
//             <div class="image"></div>
//             <div class="text">TONEIC&nbsp<span></span></div>
//         </div>
//         <div class="userLine">
//             <button class="invisible">Joina ett lag</button>
//             <span class="team invisible"> - <span></span> - </span>
//             <span class="user">Ej inloggad</span>
//         </div>
//         <div class="hamburger">
//             <div></div>
//             <div></div>
//             <div></div>
//         </div>
//     `;


//     let userHtml = header.querySelector(".userLine .user");
//     let teamHtml = header.querySelector(".userLine .team");
//     let hamburgerHtml = header.querySelector(".hamburger");
//     let buttonHtml = header.querySelector(".userLine button");


    
//     // Hamburger
//     hamburgerHtml.click({
//         callback: () => {
            
//             let isOpen = hamburgerHtml.classList.contains("open");
//             let event = isOpen ? "event::menu:close" : "event::menu:open";

//             SubPub.publish({ event });
//         }
//     });


//     // CLICK
//     header.querySelector(".userLine button").click({
//         callback: () => {
//             showLoginRegisterJoin({ which: "join" });
//         }
//     });


//     // SUBCRIPTIONS
//     SubPub.subscribe({
//         event: "event::user:login:success",
//         listener: (response) => {
//             let userName = response.payload.data.userName;
//             userHtml.textContent = userName;

//             buttonHtml.classList.remove("invisible");
//         }
//     });

//     SubPub.subscribe({
//         event: "event::user:logout:success",
//         listener: (response) => {
//             userHtml.textContent = "Ej inloggad";
//             buttonHtml.classList.add("invisible");
//         }
//     });

//     SubPub.subscribe({
//         event: "event::menu:open",
//         listener: () => {
//             hamburgerHtml.classList.add("open");
//         }
//     });

//     SubPub.subscribe({
//         event: "event::menu:close",
//         listener: () => {
//             hamburgerHtml.classList.remove("open");
//         }
//     });

//     SubPub.subscribe({
//         event: "event::serverPhase:success",
//         listener: (response) => {
//             let { toneicID } = response.payload.data;
//             header.querySelector(".logo .text span").textContent = toneicID;
//         }
//     });
    
//     SubPub.subscribe({
//         event: "event::team:join:success",
//         listener: (response) => {
//             let { ownTeam, teamName } = response.payload.data;

//             let buttonText = ownTeam ? "Joina ett lag" : "Byt lag";
//             buttonHtml.textContent = buttonText;

//             if (!ownTeam) {
//                 teamHtml.classList.remove("invisible");
//                 teamHtml.querySelector("span span").textContent = `${teamName}`;
//             } else {
//                 teamHtml.classList.add("invisible");
//                 teamHtml.querySelector("span span").textContent = ``;
//             }
//         }
//     });    
// }
