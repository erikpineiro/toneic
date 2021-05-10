<?php

require_once ("dbActions.php");

switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":
        if (!isset($_GET["input"])) {
            send(200, aux_response(null, "api_no_input"));
        }
        $input = json_decode($_GET["input"], true);
        break;

    case "POST":
        $contentType = $_SERVER["CONTENT_TYPE"];
        if ($contentType !== "application/json") {
            send(400, "Bad request (invalid content type)");
        }
        
        $input = json_decode(file_get_contents("php://input"), true);
        break;
    
    default:
        send(405, "Method not allowed");
        break;
}


switch ($input["action"]) {
    case "user_login":
    case "user_register":
    case "get_serverPhase":
    case "get_loadToneic":
        $legitCheck = false;
        break;
    case "any other":
    default:
        $legitCheck = true;
        break;
}



if ($legitCheck) {
    $credentials = [
        "userID" => $input["payload"]["userID"],
        "token" => $input["payload"]["token"],
    ];
    if (!aux_isUserLegit($credentials)) {
        send(200, aux_response(null, "api_invalid_user_credentials"));
    }
}


// All actions in dbActions.php
// All actions return a response with the form: 
//  [
//      data => ...
//      message => ... (can be "")
//  ]
$response = bridge($input);
send(200, $response);




function send($code, $response, $header = "Content-Type: text/plain"){
    http_response_code($code);
    header($header);
    echo json_encode($response);
    exit();
}

?>