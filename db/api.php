<?php


require_once ("dbActions.php");


switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":

        if (isset($_GET["serverPhase"])) {
            send(200, serverPhase());
        }
    
        break;


    case "POST":
        break;
        $contentType = $_SERVER["CONTENT_TYPE"];
        if ($contentType !== "application/json") {
            send(400, "Bad request (invalid content type)");
        }
        
        // GET SENT INFO
        $input = json_decode(file_get_contents("php://input"), true);
        
        // All actions in dbActions.php
        // All actions end with send and exit
        $input["action"]($input["data"], $state);
    

    default:
        send(405, "Method not allowed");
        break;
}





function send($code, $data, $message = "", $header = "Content-Type: text/plain"){
    http_response_code($code);
    header($header);
    echo json_encode([
        "data" => $data,
        "message" => $message
        ]);

    global $lockFile;
    if (file_exists($lockFile)) {
        unlink($lockFile);
    }

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