
const API_URL = "./db/api.php";
const HEADERS = { "Content-Type": "text/plain" };   // I use text in development to see errors in PHP
                                                    // For production change headers to JSON.
const SHOW_RAW_RESPONSE = true;
const SHOW_OBJECT_RESPONSE = !SHOW_RAW_RESPONSE;


export default {

    login: function (data) {

        let {userName = null, token = null, password = null, callback = null}  = data;
        let requestKind = "request::invalid";
    
        if (!userName) {
            return _newResponse({
                requestKind,
                message: "No username"
            });
        }
        if (!password && !token) {
            return _newResponse({
                requestKind,
                message: "No password credentials"
            });
        }
    
        requestKind = "request::login";
        _dbFetch({
            requestKind,
            method: "POST",
            body: JSON.stringify({ userName, token, password }),
            url: API_URL,
            callback,
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

    let { url, vars = "", callback } = data;
    let headers = { ...HEADERS };
    let request = new Request(url + vars, {
        method: "GET",
        headers
    });

    _fetch({ ...data, request, headers });

}

function _post (data) {

    let {body, url, callback} = data;
    let headers = { ...HEADERS };
    let request = new Request(url, {
        method: "POST",
        headers,
        body
    });

    _fetch({ request, callback, headers });

}



function _fetch (data) {

    let { request, callback, headers, requestKind } = data;

    let middle = headers["Content-Type"] === "text/plain" ? "text" : "json";

    fetch(request)
    .then( r => r[middle]() )
    .then( payload => {

        if (SHOW_RAW_RESPONSE) {
            console.log(payload);
        }

        if (middle === "text") {
            payload = JSON.parse(payload);
        }

        if (SHOW_OBJECT_RESPONSE) {
            console.log(payload);
        }

        callback(_newResponse({ requestKind, payload }));

    } )
    .catch(e => {
        console.log(e);
        callback(_newResponse({ success: false, message: "DB Error", requestKind }));
    });


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



function _newResponse(response){

    response = { 
                success: true,
                message: "Request sent, Response received",
                payload: null,
                ...response,
            };
        

    switch (response.requestKind) {

        case "request::invalid":
            response = { ...response, success: false };
            break;

        case "request::serverPhase":
        case "request::login":
        case "request::register":
            break;

        default:
            let rq = response.requestKind || "no requestKind"
            response = { ...response, success: false, message: `Unknown requestKind (${rq})` };
            break;

    }

    return response;

}