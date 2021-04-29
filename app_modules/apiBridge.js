
const API_URL = "./db/api.php";
const HEADERS = { "Content-Type": "text/plain" };   // I use text in development to see errors in PHP
                                                    // For production change headers to JSON.
const SHOW_RESPONSE = true;


export function login(data){

    let {userName = null, token = null, password = null, callback = null}  = data;
    let requestKind = "request::invalid";

    if (!userName) {
        return newResponse({
            requestKind,
            message: "No username"
        });
    }
    if (!password && !token) {
        return newResponse({
            requestKind,
            message: "No password credentials"
        });
    }

    prepareFetch({
        method: "POST",
        body: JSON.stringify({ userName, token, password }),
        url: API_URL,
        callback,
    });

}


function post(data){

    let {body, url, callback} = data;
    let headers = { ...HEADERS };
    let request = new Request(url, {
        method: "POST",
        headers,
        body
    });

    doFetch({ request, callback, headers });

}



function doFetch (data) {

    let { request, callback, headers } = data;

    let middle = headers["Content-Type"] === "text/plain" ? "text" : "json";

    fetch(request)
    .then( r => r[middle]() )
    .then( payload => {

        if (middle === "text") {
            payload = JSON.parse(payload);
        }

        if (SHOW_RESPONSE) {
            console.log(payload);
        }

        callback(newResponse({ payload }));

    } )
    .catch(e => {
        console.log(e);
    });


}
function prepareFetch (data) {

    let {method, body, url, callback} = data;

    switch (method) {

        case "POST":
            post(data);
            break;
        case "GET":
            break;
        case "PUT":
            break;
        case "PATCH":
            break;
        default:

            callback(newResponse({
                requestKind: "request::invalid",
                message: `Invalid HTTP method (${method})`
            }));

            break;

    }
}



function newResponse(response){

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

        case "request::login":
        case "request::register":
            break;

        default:
            response = { ...response, success: false, message: `Unknown requestKind (${requestKind})` };
            break;

    }

    return response;

}