<?php


// $r = [
//     "data" => "dataYO",
//     "message" => "messageYO"
// ];
// send(200, $r);

require_once ("dbActions.php");

switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":


        switch ($_GET["action"]) {
            case "serverPhase":
                $legitCheck = false;
                break;
            case "other":
            default:
                $legitCheck = true;
                break;
        }

        if ($legitCheck) {
            $credentials = [
                "userID" => $_GET["userID"],
                "token" => $_GET["token"]
            ];
            if (!isUserLegit($credentials)) {
                send(200, aux_response(null, "User credentials invalid"));
            }
        }

        if (isset($_GET["serverPhase"])) {
            send(200, serverPhase());
        }
    
        break;


    case "POST":
        $contentType = $_SERVER["CONTENT_TYPE"];
        if ($contentType !== "application/json") {
            send(400, "Bad request (invalid content type)");
        }
        
        // GET SENT INFO
        $input = json_decode(file_get_contents("php://input"), true);
        
        // All actions in dbActions.php
        // All actions return [
            // data => ...
            // message => ... (can be "")
            // ]
        

        // all POST-functions require legitCheck 
        $input["legitCheck"] = true;

        $response = bridge($input);
        send(200, $response);
        break;
    

    default:
        send(405, "Method not allowed");
        break;
}





function send($code, $response, $header = "Content-Type: text/plain"){
    http_response_code($code);
    header($header);
    echo json_encode($response);
    exit();
}

?>