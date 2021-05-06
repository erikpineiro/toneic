<?php


// $r = [
//     "data" => "dataYO",
//     "message" => "messageYO"
// ];
// send(200, $r);

require_once ("dbActions.php");

switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":

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
    echo json_encode([
        "data" => $response["data"],
        "message" => $response["message"]
        ]);

    exit();
}
function getState(){

    global $stateFile;
    global $lockFile;

    if (file_exists($lockFile)) {
        usleep(500000); // 500 ms = .5s
        return getState();
    }

    file_put_contents($lockFile, "locked");

    if (file_exists($stateFile)) {
        $stateJSON = file_get_contents($stateFile);
        $state = json_decode($stateJSON, true);
    } else {
        $state = null;
    }

    return $state;
}

?>