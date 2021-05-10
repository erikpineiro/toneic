import apiBridge from "../apiBridge.js";
import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { showCover, hideCover } from "./views.js";
import { showUserInfo } from "./userInfo.js";



export function init (loginReg) {

    loginReg.innerHTML = `
        <h1></h1>
        <div id="joinForm">
            <form class="visible">
                <input id="inputJoinTeamName" type="text" placeholder="Lagets Namn" required>
                <input id="inputJoinPassword" type="password" placeholder="Lagets Lösenord (inte ditt!)" required>
                <p class="feedback">feedback</p>
                <input type="submit" value="Joina">
                <p id="linkForgotTeam" class="link">Glömt teamets lösenord?</p>
                <p id="linkToRegisterTeam" class="link">Registrera ett nytt lag</p>
            </form>
        </div>
        <div id="registerTeamForm">
            <form class="visible">
                <p id="linkToJoinTeam" class="link">Finns laget redan? Joina istället :-)</p>
                <input id="inputRegisterTeamName" type="text" placeholder="Lagets namn" required>
                <p class="feedback">feedback</p>
                <input id="inputRegisterTeamPassword" type="text" placeholder="Välj ett lösenord (min 5 bokstäver)" minlength=5 required>
                <p class="feedback">feedback</p>
                <input id="inputRegisterTeamEmail" type="email" placeholder="Ditt email, om du skulle glömma något" required>
                <p class="feedback">feedback</p>
                <input type="submit" value="Registrera laget">
                <p class="feedback">feedback</p>
                </form>
            <div id="registerSuccess">
                <p>Grattis!</p>
                <p>LAget är nu registrerat</p>
                <button class="wideButton" id="JoinAfterRegister">Joina laget&nbsp<span></span></button>
            </div>
        </div>
        <div id="loginForm">
            <form class="visible">
                <input id="inputLoginUserName" type="text" placeholder="Användarnamn" value="${State.local.userName || ''}">
                <input id="inputLoginPassword" type="password" placeholder="Lösenord">
                <p class="feedback">feedback</p>
                <input type="submit" value="Logga in">
                <p id="linkForgotUser" class="link">Glömt lösenordet eller användarnamnet?</p>
                <p id="linkToRegisterUser" class="link">Registrera dig i Toneic</p>
            </form>
        </div>
        <div id="registerUserForm">
            <form class="visible">
                <p id="linkToLoginUser" class="link">Redan registrerat? Logga in istället :-)</p>
                <input id="inputRegisterUserName" type="text" placeholder="Välj ett användarnamn" required>
                <p class="feedback">feedback</p>
                <input id="inputRegisterUserPassword" type="text" placeholder="Välj ett lösenord (min 5 bokstäver)" minlength=5 required>
                <p class="feedback">feedback</p>
                <input id="inputRegisterUserEmail" type="email" placeholder="Ditt email, om du skulle glömma något" required>
                <p class="feedback">feedback</p>
                <input type="submit" value="Registrera dig">
                <p class="feedback">feedback</p>
                </form>
            <div id="registerSuccess">
                <p>Grattis!</p>
                <p>Du är nu registrerad</p>
                <button class="wideButton" id="loginAfterRegister">Logga in som&nbsp<span></span></button>
            </div>
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

    loginReg.querySelector("#linkToRegisterTeam").click({
        callback: () => {
            showLoginRegisterJoin({})
            SubPub.publish({
                event: "event::user:loginRegister",
                detail: { which: "registerTeam" }
            });
        }
    });    

    loginReg.querySelector("#linkToRegisterUser").click({
        callback: () => {
            showLoginRegisterJoin({})
            SubPub.publish({
                event: "event::user:loginRegister",
                detail: { which: "register" }
            });
        }
    });    

    loginReg.querySelector("#linkToLoginUser").click({
        callback: () => {
            SubPub.publish({
                event: "event::user:loginRegister",
                detail: { which: "login" }
            });
        }
    });    

    loginReg.querySelector("#loginAfterRegister").click({
        callback: () => {
            apiBridge.login();

            setTimeout(() => {
                resetRegister();
                SubPub.publish({
                    event: "event::user:loginRegister",
                    detail: { which: "login" }
                });
            }, 50);
        }
    });    


    // SUBMITS
    loginReg.querySelector("#loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        apiBridge.login({
            userName: loginReg.querySelector("#inputLoginUserName").value,
            password: loginReg.querySelector("#inputLoginPassword").value,
            callback: (response) => {}
        })        
    });

    loginReg.querySelector("#registerUserForm").addEventListener("submit", function(e) {
        e.preventDefault();
        apiBridge.registerUser({
            userName: loginReg.querySelector("#inputRegisterUserName").value,
            password: loginReg.querySelector("#inputRegisterUserPassword").value,
            email: loginReg.querySelector("#inputRegisterUserEmail").value,
            callback: (response) => {}
        })        
    });


    // FOCUS
    loginReg.querySelectorAll("input").forEach(element => {
        let next = element.nextElementSibling;
        if (next && next.classList.contains("feedback")) {
            element.addEventListener("focus", () => {
                next.textContent = "feedback";
                next.classList.remove("visible");
            });
        }
    });


    // EVENT SUBSCRIPTIONS
    loginReg.subscribe({
        event: "event::register:user:success",
        callback: (e) => {
            let response = e.detail;
            let userName = response.payload.data.userName;
            let token = response.payload.data.token;

            loginReg.querySelector("#registerUserForm form").classList.remove("visible");

            loginReg.querySelector("#registerSuccess span").textContent = userName;
            loginReg.querySelector("#registerSuccess").classList.add("visible");
        }
    });

    loginReg.subscribe({
        event: "event::register:user:failed",
        callback: (e) => {

            let response = e.detail;
            let { message } = response;
            
            let feedback;
            let _message;
            switch (message) {
                case "network_error":
                    feedback = loginReg.querySelector("#registerUserForm .feedback:last-of-type");
                    _message = "Något strular med närverket. Försök gärna litet senare."
                    break;
                case "no_username":
                    feedback = loginReg.querySelector("#inputRegisterUserName ~ .feedback");
                    _message = "Glöm inte att ange ett användarnamn."
                    break;
                case "no_password":
                    feedback = loginReg.querySelector("#inputRegisterUserPassword ~ .feedback");
                    _message = "Glöm inte att ange ett lösenord."
                    break;
                case "no_email":
                    feedback = loginReg.querySelector("#inputRegisterUserEmail ~ .feedback");
                    _message = "Glöm inte att ange en email-adress."
                    break;
                case "sent_received":
                    let { payload } = response;
                    
                    switch (payload.message) {
                        case "email_in_use":
                            feedback = loginReg.querySelector("#inputRegisterUserEmail ~ .feedback");
                            _message = "Någon hemsk männiksa har redan använt denna emailadress... oj, vänta, det var nog du. Det finns hjälp att få om du går tillbaka till Logga in";        
                            break;
                        case "userName_in_use":
                            feedback = loginReg.querySelector("#inputRegisterUserName ~ .feedback");
                            _message = "Någon jävel därute har tagit detta användarnamn!";
                            break;
                        default:
                            myError.throw();
                            break;

                    }
                    break;
                default:
                    myError.throw();
                    break;
                }

            feedback.textContent = _message;
            feedback.classList.add("visible");

        }
    });

    loginReg.subscribe({
        event: "event::user:loginRegister",
        callback: (event) => {

            let { which } = event.detail;
            
            let actionLogin = which === "login" ? "add" : "remove";
            let actionRegister = which === "login" ? "remove" : "add";

            loginReg.querySelector("#loginForm").classList[actionLogin]("open");            
            loginReg.querySelector("#registerUserForm").classList[actionRegister]("open");            
        }
    });
    
    loginReg.subscribe({
        event: "event::user:login:failed",
        callback: () => {
            let feedback = loginReg.querySelector("#loginForm .feedback");
            feedback.textContent = "OBS: Vi kunde inte logga in dig";
            feedback.classList.add("visible");
        }
    });

    loginReg.subscribe({
        event: "event::user:login:success",
        callback: (e) => {
            let userName = e.detail.payload.data.userName;
            showUserInfo({
                innerHTML: `Hej ${userName}!<br> Kör hårt!`
            });
            hideCover({cover: "loginRegister"});
        }
    });
    
}

export function showLoginRegisterJoin (data) {

    let userName = (data && data.userName) || (State.local.userData && State.local.userData.userName);
    let loginReg = document.querySelector("#loginRegister");
    
    loginReg.querySelector("#loginForm").classList.add("open");
    loginReg.querySelector("#registerUserForm").classList.remove("open");

    if (userName) {
        loginReg.querySelector("#inputLoginUserName").value = userName;
    }

    // show
    showCover({cover: "loginRegister"});

}

function resetRegister () {
    document.querySelectorAll(`#registerUserForm input:not([type="submit"])`).forEach( input => input.value = "");
}
