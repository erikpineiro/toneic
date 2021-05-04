import apiBridge from "../apiBridge.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";



export function init (loginReg) {

    loginReg.innerHTML = `
        <div id="loginForm">
            <form>
                <input id="inputLoginUserName" type="text" placeholder="Användarnamn">
                <input id="inputLoginPassword" type="password" placeholder="Lösenord">
                <p class="feedback">feedback</p>
                <input type="submit" value="Logga in">
                <p id="linkForgor" class="link">Glömt lösenordet eller användarnamnet?</p>
                <p id="linkToRegister" class="link">Registrera dig i Toneic</p>
            </form>
        </div>
        <div id="registerForm">
            <form>
                <p id="linkToLogin" class="link">Redan registrerat? Logga in istället :-)</p>
                <input id="inputRegisterUserName" type="text" placeholder="Välj ett användarnamn">
                <p class="feedback">feedback</p>
                <input id="inputRegisterPassword" type="text" placeholder="Välj ett lösenord (min 5 bokstäver)">
                <p class="feedback">feedback</p>
                <input id="inputRegisterEmail" type="email" placeholder="Ditt email, om du skulle glömma något">
                <p class="feedback">feedback</p>
                <input type="submit" value="Registrera dig">
            </form>
        </div>
        <button class="wideButton cancel">Inte just nu</button>
    `;


    // CLICKS
    loginReg.querySelector(".cancel").click({
        callback: () => {
            SubPub.publish({
                event: "event::cover:hide",
                detail: { cover: "loginRegister" }
            });
        }
    });

    loginReg.querySelector("#loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        apiBridge.login({
            userName: loginReg.querySelector("#inputLoginUserName").value,
            password: loginReg.querySelector("#inputLoginPassword").value,
            callback: (response) => {}
        })        
    });

    loginReg.querySelector("#linkToRegister").click({
        callback: () => {
            SubPub.publish({
                event: "event::loginRegister",
                detail: { which: "register" }
            });
        }
    });    

    loginReg.querySelector("#linkToLogin").click({
        callback: () => {
            SubPub.publish({
                event: "event::loginRegister",
                detail: { which: "login" }
            });
        }
    });    


    // EVENT SUBSCRIPTIONS
    loginReg.subscribe({
        event: "event::loginRegister",
        callback: (event) => {

            let { which } = event.detail;
            
            let actionLogin = which === "login" ? "add" : "remove";
            let actionRegister = which === "login" ? "remove" : "add";

            loginReg.querySelector("#loginForm").classList[actionLogin]("open");            
            loginReg.querySelector("#registerForm").classList[actionRegister]("open");            
        }
    });
    
    loginReg.subscribe({
        event: "event::login:failed",
        callback: () => {

            let feedback = loginReg.querySelector("#loginForm .feedback");
            feedback.textContent = "OBS: Vi kunde inte logga in dig";
            feedback.classList.add("visible");

        }
    });

    loginReg.subscribe({
        event: "event::login:success",
        callback: (response) => {
            console.log("yeah!");
        }
    });

    loginReg.subscribe({
        event: "event::login:openForm",
        callback: (detail) => {

            SubPub.publish({
                event: "event::cover:show",
                detail: { cover: "loginRegister" }
            })

            loginReg.querySelector("#loginForm").classList.add("open");
            loginReg.querySelector("#registerForm").classList.remove("open");

            let userName = (detail && detail.userName) || (State.local.userData && State.local.userData.userName);
            if (userName) {
                loginReg.querySelector("#inputLoginUserName").value = userName;
            }

        }
    });

    
}

