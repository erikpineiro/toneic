import { myError } from "./error.js";
import { State } from "./state.js";
import { SubPub } from "./subpub.js";

const API_URL = "./db/api.php";
const HEADERS = { "Content-Type": "application/json" };   // I use text in development to see errors in PHP
// const HEADERS = { "Content-Type": "text/plain" };   // I use text in development to see errors in PHP
                                                    // For production change headers to JSON.
const SHOW_RAW_RESPONSE = true;
const SHOW_OBJECT_RESPONSE = !SHOW_RAW_RESPONSE;





export default {

    // getCrosswords: function (data) {
    //     let { week = -1, year = -1 } = data;
    //     let toneicID = `t${year}v${week}`;

    //     // Pre-Chekcs
    //     let message = "";
    //     if (week ===  -1 || year === -1) { message = "Bad format"; }

    //     if (message) {
    //         SubPub.publish({
    //             event: "event::toneic:get:failed",
    //             detail: _newResponse({
    //                 requestKind:"request::invalid",
    //                 message
    //             })
    //         });
    //     } else {
    //         _dbFetch({
    //             requestKind: "request::toneic:get",
    //             method: "GET",
    //             url: API_URL,
    //             body: JSON.stringify({ action: "player_login", payload: {userName, token, password} }),
    //             callback: (response) => {
    //                 let event = (response.success && response.payload.data.loggedIn) ? "event::login:success" : "event::login:failed";
    //                 SubPub.publish({
    //                     event,
    //                     detail: response
    //                 });
    //                 callback && callback(response);
    //             }
    //         }); 
    //     }    

    // },

    doesEntityExist: function (data) {
        let { entity, key, value } = data;

        if ( entity === undefined || key === undefined || value === undefined ) { myError.throw(); }

        _dbFetch({
            requestKind: "request::doesEntityExist",
            method: "GET",
            url: API_URL,
            parameters: [["entity", entity], [key, value]],
            callback: (response) => {
                callback && callback(response);
            }
        });        

    },

    joinTeam: function (data) {
        let { teamID } = data;
        let userID = State.local.userID;
        let token = State.local.token;

        console.log("Join Team Started", userID, token);

        _dbFetch({
            requestKind: "request::joinTeam",
            method: "POST",
            url: API_URL,
            body: JSON.stringify({ action: "user_joinTeam", payload: {userID, token, teamID} }),
            callback: (response) => {}
        });
    },

    joinOwnTeam: function () {
        let userID = State.local.userID;
        let token = State.local.token;
        console.log("Join Own Team Started", userID, token);

        _dbFetch({
            requestKind: "request::joinTeam",
            method: "POST",
            url: API_URL,
            body: JSON.stringify({ action: "user_joinOwnTeam", payload: {userID, token} }),
            callback: (response) => {}
        });
    },

    login: function (data = {}) {
        let {userName = null, token = null, password = null, callback = null}  = data;
        userName = userName || State.local.userName;
        token = token || State.local.token;

        console.log("Login Started", userName, token, password);

        // Pre-Chekcs
        let message = "";
        if (!userName) { message = "No username"; }
        if (!password && !token) { message = "No password credentials"; }

        if (message) {
            SubPub.publish({
                event: "event::login:failed",
                detail: _newResponse({
                    requestKind:"request::invalid",
                    message
                })
            });
        } else {
            _dbFetch({
                requestKind: "request::login",
                method: "POST",
                url: API_URL,
                body: JSON.stringify({ action: "user_login", payload: {userName, token, password} }),
                callback: (response) => {
                    let event = (response.success && response.payload.data.loggedIn) ? "event::login:success" : "event::login:failed";
                    SubPub.publish({
                        event,
                        detail: response
                    });
                    callback && callback(response);
                }
            });
        }
    },

    logout: function () {
        let userName = State.local.userName;
        if (userName) {
            State.updateLocal({ token: "" });
            console.log(State.local);
            SubPub.publish({
                event: "event::logout:success"
            })
        }
    },

    registerUser: function (data) {

        console.log("Register User Started", data); 
        let {userName = null, email = null, password = null, callback = null}  = data;
       
        // Pre-Chekcs
        let message = "";
        if (!userName) { message = "no_username"; }
        if (!password) { message = "no_password"; }
        if (!email) { message = "no_email"; }

        if (message) {
            SubPub.publish({
                event: "event::register:user:failed",
                detail: _newResponse({
                    requestKind:"request::invalid",
                    message
                })
            });
        } else {
            _dbFetch({
                requestKind: "request::register:user",
                method: "POST",
                url: API_URL,
                body: JSON.stringify({ action: "user_register", payload: {userName, email, password} }),
                callback: (response) => {

                    if (!response.success) {

                        SubPub.publish({
                            event: "event::register:user:failed",
                            detail: response
                        });

                    } else {
        
                        let event = response.payload.data.registered ? "event::register:user:success" : "event::register:user:failed";
                        SubPub.publish({
                            event,
                            detail: response
                        });
                    }
                
                    callback && callback(response);
                }
            });
        }        
    },

    registerTeam: function (data) {

        console.log("Register Team Started", data);
        let {teamName = null, email = null, passwordForTeam = null, callback = null}  = data;
        let userID = State.local.userID;
        let token = State.local.token;
       
        _dbFetch({
            requestKind: "request::register:team",
            method: "POST",
            url: API_URL,
            body: JSON.stringify({ action: "team_register", payload: {teamName, email, passwordForTeam, userID, token} }),
            callback: (response) => {

                if (!response.success) {

                    SubPub.publish({
                        event: "event::register:team:failed",
                        detail: response
                    });

                } else {
    
                    let event = response.payload.data.registered ? "event::register:team:success" : "event::register:team:failed";
                    SubPub.publish({
                        event,
                        detail: response
                    });
                }
            
                callback && callback(response);
            }
        });
    },

    serverPhase: function (data) {
        let { callback } = data;
        _dbFetch({
            requestKind: "request::serverPhase",
            method: "GET",
            vars: "?serverPhase=true",
            url: API_URL,
            callback,
        });     

    }
}



function _get (data) {

    let { url, parameters = [], callback } = data;
    let headers = { ...HEADERS };

    let paramString = parameters.length ?
                                    "?" + parameters.reduce((acc, pair, index) => acc + `${(index > 0) ? "&" : ""}${pair[0]}=${pair[1]}`, "")
                                    : "";

    let request = new Request(url + paramString, {
        method: "GET",
        headers
    });

    _fetch({ ...data, request, headers });

}
function _post (data) {

    let {body, url, callback} = data;
    let headers = HEADERS;
    console.log(headers);
    let request = new Request(url, {
        method: "POST",
        headers,
        body
    });

    _fetch({ request, headers, ...data });

}
function _dbFetch (data) {

    let {method, callback} = data;

    switch (method) {

        case "POST":
            _post(data);
            break;
        case "GET":
            _get(data);
            break;
        case "PUT":
            break;
        case "PATCH":
            break;
        default:

            callback(_newResponse({
                requestKind: "request::invalid",
                message: `Invalid HTTP method (${method})`
            }));

            break;

    }
}
function _fetch (data) {

    let { request, callback, headers, requestKind } = data;
    let middle;

    fetch(request)
    .then( r => {
        middle = r.headers.get("Content-Type").includes("text") ? "text" : "json";
        return r[middle]();
    })
    .then( (payload)=>{
        
        if (SHOW_RAW_RESPONSE) {
            console.log(payload);
        }

        if (middle === "text") {
            payload = JSON.parse(payload);
        }

        console.log(payload);
        if (SHOW_OBJECT_RESPONSE) {
            console.log(payload);
        }

        callback && callback(_newResponse({ requestKind, payload }));

    } )
    .catch(e => {
        console.log(e);
        callback && callback(_newResponse({ success: false, message: "network_error", requestKind }));
    });
}
function _newResponse(response){

    response = { 
                success: true,
                message: "sent_received",
                payload: null,
                ...response,
            };
        

    switch (response.requestKind) {

        case "request::invalid":
            response = { ...response, success: false };
            break;

        case "request::doesEntityExist":
        case "request::serverPhase":
        case "request::login":
        case "request::register:user":
            break;

        default:
            let rq = response.requestKind || "no requestKind"
            response = { ...response, success: false, message: `Unknown requestKind (${rq})` };
            break;

    }

    return response;

}


















































// function _post (data) {

//     let {body, url, callback} = data;
//     let headers = HEADERS;
//     console.log(headers);
//     let request = new Request(url, {
//         method: "POST",
//         headers,
//         body
//     });

//     _fetch({ request, callback, headers });

// }



// function _fetch (data) {

//     let { request, callback, headers, requestKind } = data;

//     let middle = headers["Content-Type"] === "text/plain" ? "text" : "json";

//     fetch(request)
//     .then( r => {
//         console.log(r);
//         r.text()}
//          )
//     .then( rsp => {

//         if (SHOW_RAW_RESPONSE) {
//             console.log(rsp);
//         }

//         if (middle === "text") {
//             payload = JSON.parse(payload);
//         }

//         if (SHOW_OBJECT_RESPONSE) {
//             console.log(payload);
//         }

//         callback(_newResponse({ requestKind, payload }));

//     } )
//     .catch(e => {
//         console.log(e);
//         callback(_newResponse({ success: false, message: "DB Error", requestKind }));
//     });


//     // fetch(request)
//     // .then( r => r[middle]() )
//     // .then( payload => {

//     //     if (SHOW_RAW_RESPONSE) {
//     //         console.log(payload);
//     //     }

//     //     if (middle === "text") {
//     //         payload = JSON.parse(payload);
//     //     }

//     //     if (SHOW_OBJECT_RESPONSE) {
//     //         console.log(payload);
//     //     }

//     //     callback(_newResponse({ requestKind, payload }));

//     // } )
//     // .catch(e => {
//     //     console.log(e);
//     //     callback(_newResponse({ success: false, message: "DB Error", requestKind }));
//     // });


// }
// function _dbFetch (data) {

//     let {method, callback} = data;

//     switch (method) {

//         case "POST":
//             _post(data);
//             break;
//         case "GET":
//             _get(data);
//             break;
//         case "PUT":
//             break;
//         case "PATCH":
//             break;
//         default:

//             callback(_newResponse({
//                 requestKind: "request::invalid",
//                 message: `Invalid HTTP method (${method})`
//             }));

//             break;

//     }
// }
