import { myError } from "./error.js";
import { State } from "./state.js";
import { SubPub } from "./subpub.js";

const API_URL = "./db/api.php";
const HEADERS = { "Content-Type": "application/json" };
const SHOW_RAW_RESPONSE = true;
const SHOW_OBJECT_RESPONSE = !SHOW_RAW_RESPONSE;





export default {

    loadToneic: function (data) {
        
        let { toneicID, callback } = data;
        
        _dbFetch({
            requestKind: "request::toneic:load",
            method: "GET",
            url: API_URL,
            input: {
                action: "get_loadToneic",
                payload: { toneicID }
            },
            callback: (response) => {
                let event = (response.success) ? "event::toneic:load:success" : "event::toneic:load:failed";
                SubPub.publish({
                    event,
                    detail: response
                });
                callback && callback(response);
            }
        });         
    },

    crosswordsLatestActions: function (data) {

        console.log("Started: Crosswords Latest Actions", data);

        let { toneicID, callback, init = false } = data;

        if (!State.local.token || !State.local.userID) {
            console.log("user_not_loggedIn_nothing_to_get");
            callback && callback({
                success: true,
                payload: {data: {noUpdates: true}}
            })
            return;
        }

        let userID = State.local.userID;
        let token = State.local.token;

        _dbFetch({
            requestKind: "request::crosswords:latestActions",
            method: "POST",
            url: API_URL,
            body: JSON.stringify({ action: "crosswords_latestActions", payload: {userID, token, toneicID, init} }),
            callback: (response) => {
                console.log(response);
                if (response.success && response.payload.data) {
                    SubPub.publish({
                        event: "event::crosswords:latestActions:success",
                        detail: response
                    });
                }
                callback && callback(response);
            }
        });        
               
    },
    crosswordsNewAction: function (data) {
        
        console.log("Started: Crosswords New Action", data);
        
        let { toneicID, origin, value, callback } = data;
        let action = {
            kind: "letterUpdate",
            origin,
            value
        };


        if (!State.local.token || !State.local.userID) {
            console.log("no_updates_possible_for_user_not_loggedIn");
            callback && callback({
                success: true,
                payload: {data: {updated: true}}
            })
            return;
        }

        let userID = State.local.userID;
        let token = State.local.token;

        _dbFetch({
            requestKind: "request::crosswords:newAction",
            method: "POST",
            url: API_URL,
            body: JSON.stringify({ action: "crosswords_newAction", payload: {userID, token, toneicID, action} }),
            callback: (response) => {
                callback && callback(response);
            }
        });        
        
    },


    entityExists: function (data) {
        let { entity, key, value } = data;

        if ( entity === undefined || key === undefined || value === undefined ) { myError.throw(); }

        _dbFetch({
            requestKind: "request::entityExists",
            method: "GET",
            url: API_URL,
            parameters: [["entity", entity], [key, value]],
            callback: (response) => {
                callback && callback(response);
            }
        });        

    },

    joinTeam: function (data) {
        let { teamID, teamName, passwordForTeam, callback } = data;
        let userID = State.local.userID;
        let token = State.local.token;

        console.log("Join Team Started", userID, token);

        _dbFetch({
            requestKind: "request::joinTeam",
            method: "POST",
            url: API_URL,
            body: JSON.stringify({ action: "user_joinTeam", payload: {userID, token, teamID, teamName, passwordForTeam} }),
            callback: (response) => {
                let event = (response.success && response.payload.data && response.payload.data.joined) ? "event::team:join:success" : "event::team:join:failed";
                SubPub.publish({
                    event,
                    detail: response
                });
                callback && callback(response);
            }
        });
    },
    joinOwnTeam: function (data = {}) {

        let { callback } = data;
        console.log("Join Own Team Started");
        this.joinTeam({ teamID: null, teamName: null, callback });

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
                event: "event::user:login:failed",
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
                    let event = (response.success && response.payload.data && response.payload.data.loggedIn) ? "event::user:login:success" : "event::user:login:failed";
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
                event: "event::user:logout:success"
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

    serverPhase: function (data = {}) {
        let { callback } = data;
        _dbFetch({
            requestKind: "request::serverPhase",
            method: "GET",
            url: API_URL,
            input: {
                action: "get_serverPhase"
            },
            callback: (response) => {

                if (!response.success) {
                    console.log("ERROR!!!! WHAT TO DO?");
                    myError.throw();
                } else {
                    SubPub.publish({
                        event: "event::serverPhase:success",
                        detail: response
                    });
                }

                callback && callback(response);

            },
        });     

    },

}



function _get (data) {

    let { url, input, callback } = data;
    let headers = { ...HEADERS };

    if (!input) {
        myError.throw();
    }

    input.payload = input.payload || "none";

    let inputString = "?input=" + JSON.stringify(input);
    // let paramString = parameters.length ?
    //                                 "?" + parameters.reduce((acc, pair, index) => acc + `${(index > 0) ? "&" : ""}${pair[0]}=${pair[1]}`, "")
    //                                 : "";

    let request = new Request(url + inputString, {
        method: "GET",
        headers
    });

    _fetch({ ...data, request, headers });

}
function _post (data) {

    let {body, url, callback} = data;
    let headers = HEADERS;
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
        case "request::toneic:load":
        case "request::crosswords:newAction":
        case "request::crosswords:latestActions":
        case "request::register:team":
        case "request::joinTeam":
        case "request::entityExists":
        case "request::serverPhase":
        case "request::login":
        case "request::register:user":
            break;

        default:
            let rq = response.requestKind || "no requestKind"
            response = { ...response, success: false, message: `Unknown requestKind (${rq})` };
            break;

    }

    if (!response.success) {
        console.log("Unsuccessful respone", response);
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
