<?php


// Requires
require_once ("dbActions.php");
require ("spells.php");

// Files
$stateFile = "state.json";
$lockFile = "state.lock";


// state.json exists?
if (!file_exists($stateFile)) {
    $state = [];
    file_put_contents($stateFile, json_encode($state));
}

// Go ahead or wait?
$state = getState();
if ($state === null) {
    send(200, null, "NO STATE FILE");
}


$method = $_SERVER["REQUEST_METHOD"];
if ($method === "GET") {

    if (isset($_GET["initPlayer"])) {
        send(200, $SPELLS);
    }


    $team = [];
    if (isset($GET_["team"])) {
        $team = $state["teams"][$GET_["team"]];
    }

    send(200, [
        "toniec" => $state["toneic"],
        "team" => $team,
    ]);

} else if ($method === "POST") {
    $contentType = $_SERVER["CONTENT_TYPE"];
    // if ($contentType !== "application/json") {
    //     send(400, "Bad request (invalid content type)");
    // }
    
    // GET SENT INFO
    $input = json_decode(file_get_contents("php://input"), true);
    
    // All actions in dbActions.php
    // All actions end with send and exit
    $input["action"]($input["data"], $state);
}

send(405, "Method not allowed");




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