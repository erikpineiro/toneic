import ApiBridge from "../apiBridge.js";
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
                <p class="feedback">feedback</p>
                <input id="inputJoinPassword" type="password" placeholder="Lagets Lösenord (inte ditt!)" required>
                <p class="feedback">feedback</p>
                <input type="submit" value="Joina">
                <p class="feedback">feedback</p>
                <p id="linkForgotTeam" class="link">Glömt teamets lösenord?</p>
                <p id="linkToRegisterTeam" class="link">Registrera ett nytt lag</p>
                </form>
                <button id="buttonLeaveTeam" class="wideButton" style="display:none;">Lämna <span></span></button>
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
            <div id="registerTeamSuccess" class="registerSuccess">
                <p>Grattis!</p>
                <p>Laget är nu registrerat</p>
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
            <div id="registerUserSuccess" class="registerSuccess">
                <p>Grattis!</p>
                <p>Du är nu registrerad</p>
                <button class="wideButton" id="loginAfterRegister">Logga in som&nbsp<span></span></button>
            </div>
        </div>
        <button class="wideButton cancel">Inte just nu</button>
    `;


    // CLICKS
    loginReg.querySelector("#buttonLeaveTeam").click({
        callback: () => {
            ApiBridge.joinOwnTeam();
        }
    });

    loginReg.querySelector(".cancel").click({
        callback: () => {
            SubPub.publish({
                event: "event::cover:hide",
                detail: { cover: "loginRegisterJoin" }
            });
        }
    });

    loginReg.querySelector("#linkToRegisterTeam").click({
        callback: () => {
            showLoginRegisterJoin({ which: "registerTeam" });
        }
    });    

    loginReg.querySelector("#linkToRegisterUser").click({
        callback: () => {
            showLoginRegisterJoin({ which: "registerUser" })
        }
    });    

    loginReg.querySelector("#linkToLoginUser").click({
        callback: () => {
            showLoginRegisterJoin({ which: "login" })
        }
    });    

    loginReg.querySelector("#linkToJoinTeam").click({
        callback: () => {
            showLoginRegisterJoin({ which: "join" })
        }
    });    

    loginReg.querySelector("#loginAfterRegister").click({
        callback: () => {
            ApiBridge.login({
                callback: (response) => {
                    resetUserRegister();
                    if (response.success) {
                        SubPub.publish({
                            event: "event::cover:hide",
                            detail: { cover: "loginRegisterJoin" }
                        });            
                    } else {
                        // TODO
                        myError.throw();
                    }
                }
            });
        }
    });    

    loginReg.querySelector("#JoinAfterRegister").click({
        callback: () => {
            ApiBridge.joinTeam({
                teamName: loginReg.querySelector("#JoinAfterRegister span").textContent,
                callback: (response) => {
                    if (response.success) {
                        SubPub.publish({
                            event: "event::cover:hide",
                            detail: { cover: "loginRegisterJoin" }
                        });            
                    } else {
                        // TODO
                        myError.throw();
                    }
                }
            });
        }
    });  

    // SUBMITS
    loginReg.querySelector("#joinForm").addEventListener("submit", function(e) {
        e.preventDefault();
        console.log("Done: Join Form Submit");
        ApiBridge.joinTeam({
            teamName: loginReg.querySelector("#inputJoinTeamName").value,
            passwordForTeam: loginReg.querySelector("#inputJoinPassword").value,
            callback: (response) => {}
        })        
    });

    loginReg.querySelector("#loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        ApiBridge.login({
            userName: loginReg.querySelector("#inputLoginUserName").value,
            password: loginReg.querySelector("#inputLoginPassword").value,
            callback: (response) => {}
        })        
    });

    loginReg.querySelector("#registerTeamForm").addEventListener("submit", function(e) {
        e.preventDefault();
        ApiBridge.registerTeam({
            teamName: loginReg.querySelector("#inputRegisterTeamName").value,
            passwordForTeam: loginReg.querySelector("#inputRegisterTeamPassword").value,
            email: loginReg.querySelector("#inputRegisterTeamEmail").value,
            callback: (response) => {}
        })        
    });

    loginReg.querySelector("#registerUserForm").addEventListener("submit", function(e) {
        e.preventDefault();
        ApiBridge.registerUser({
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
    // event::register:team:success
    SubPub.subscribe({
        event: "event::register:team:success",
        listener: (response) => {
            let { teamName } = response.payload.data;

            loginReg.querySelector("#registerTeamForm form").classList.remove("visible");
            
            loginReg.querySelector("#JoinAfterRegister span").textContent = teamName;

            loginReg.querySelector("#registerTeamSuccess span").textContent = teamName;
            loginReg.querySelector("#registerTeamSuccess").classList.add("visible");
        }
    });

    // event::register:user:success
    SubPub.subscribe({
        event: "event::register:user:success",
        listener: (response) => {
            loginReg.querySelector("#registerUserForm form").classList.remove("visible");

            loginReg.querySelector("#registerUserSuccess span").textContent = response.payload.data.userName;
            loginReg.querySelector("#registerUserSuccess").classList.add("visible");
        }
    });

    // event::register:user:failed
    SubPub.subscribe({
        event: "event::register:user:failed",
        listener: (response) => {

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
    
    // event::user:login:failed
    SubPub.subscribe({
        event: "event::user:login:failed",
        listener: (response) => {
            let feedback = loginReg.querySelector("#loginForm .feedback");
            feedback.textContent = "OBS: Vi kunde inte logga in dig";
            feedback.classList.add("visible");
        }
    });

    // event::user:login:success
    SubPub.subscribe({
        event: "event::user:login:success",
        listener: (response) => {
            showUserInfo({
                innerHTML: `Hej ${response.payload.data.userName}!<br> Kör hårt!`
            });
            hideCover({cover: "loginRegisterJoin"});
        }
    });
    
    // event::team:join:success
    SubPub.subscribe({
        event: "event::team:join:success",
        listener: (response) => {
            let { ownTeam, teamName, changeTeam } = response.payload.data;
            
            if ((!ownTeam)) {
                let userName = State.local.userName;
                showUserInfo({
                    innerHTML: `Hej ${userName}!
                                <br>
                                Du är med i ${teamName}.
                                <br><br>
                                Bästa laget någonsin!
                                `
                });    
            }

            let value = ownTeam ? "none" : "inline";
            loginReg.querySelector("#buttonLeaveTeam").style.display = value;
            loginReg.querySelector("#buttonLeaveTeam span").textContent = teamName;

            hideCover({cover: "loginRegisterJoin"});
        }
    });

    // event::team:join:failed
    SubPub.subscribe({
        event: "event::team:join:failed",
        listener: (response) => {
            let message = response.success ? response.payload.message : response.message;
            console.log(message);
            let feedback = loginReg.querySelector("#joinForm input[type=submit]+.feedback");
            switch (message) {
                case "no_such_team_name":
                    feedback = loginReg.querySelector("#inputJoinTeamName+.feedback");
                    message = "Det verkar inte finnas något lag med det namnet";
                    break;
                case "team_credentials_invalid":
                    feedback = loginReg.querySelector("#inputJoinPassword+.feedback");
                    message = "Detta är inte lagets lösenord";
                    break;
                case "invalid_request":
                default:
                    message = "Något strular... kan du försöka igen?"
                    break;
            }

            feedback.textContent = message;
            feedback.classList.add("visible");
        }
    });
}

export function showLoginRegisterJoin (data) {

    let { which } = data;

    document.querySelectorAll("#loginRegisterJoin > div").forEach( div => div.classList.remove("open"));
    document.querySelector(`#${which}Form`).classList.add("open");

    let titles = {
        login: "Login",
        registerUser: "Registera dig i Toneic",
        join: "Joina eller byt lag",
        registerTeam: "Registrera ett nytt lag"
    };

    document.querySelector("#loginRegisterJoin h1").textContent = titles[which];

    showCover({cover: "loginRegisterJoin"});
}

function resetUserRegister () {

    document.querySelector("#registerUserForm form").classList.add("visible");
    document.querySelector("#registerUserSuccess").classList.remove("visible");

    document.querySelectorAll(`#registerUserForm input:not([type="submit"])`).forEach( input => input.value = "");
    document.querySelectorAll(`#registerUserForm input +.feedback`).forEach( feedback => {
        feedback.textContent = "feedback";
        feedback.classList.remove("visible");
    });
}
function resetTeamRegister () {

    document.querySelector("#registerTeamForm form").classList.add("visible");
    document.querySelector("#registerTeamSuccess").classList.remove("visible");

    document.querySelectorAll(`#registerTeamForm input:not([type="submit"])`).forEach( input => input.value = "");
    document.querySelectorAll(`#registerUserForm input +.feedback`).forEach( feedback => {
        feedback.textContent = "feedback";
        feedback.classList.remove("visible");
    });
}
function resetAll () {
    resetUserRegister();
    resetTeamRegister();
}
