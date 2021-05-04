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
                <p id="linkRegister" class="link">Registrera dig i Toneic</p>
            </form>
        </div>
        <div id="registerForm">
            <form>
                <p class="link">Redan registrerat? Logga in :-) istället</p>
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


    loginReg.querySelector(".cancel").click({
        callback: () => {
            SubPub.publish({
                event: "event::cover:hide",
                detail: { cover: "loginRegister" }
            });
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

