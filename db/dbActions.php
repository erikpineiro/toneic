<?php

include_once("./fileIO.php");
include_once("../php/auxiliar.php");

define('PLAYERS_DIRECTORY', './players');


function team_create(){}
function team_editLetter(){}


function player_singup(){}
function player_login ($credentials){

    $_SESSION["userData"] = ["loggedIn" => false];
    $_SESSION["loggedIn"] = false;

    if (aux_checkCredentials($credentials)) {
        $update = [
            "token" => randomToken(),
            "loggedIn" => true
        ];

        $_SESSION["userData"] = aux_updateUser($credentials["userName"], $update);
        $_SESSION["loggedIn"] = true;        
    }
    
    return [
        "data" => $_SESSION["userData"],
        "message" => ""
    ];
    
}
function player_register ($payload) {

    $userName = $payload["userName"];
    $password = $payload["password"];
    $email = $payload["email"];

    $response = [
        "data" => [ "registered" => false ],
        "message" => null,
    ];

    $fileName = aux_fileNamePlayer($userName);
    if (!file_exists($fileName)) {
        
        // Email in use?
        if (aux_isEmailUsed($email)) {
         
            $response["message"] = "email_in_use";

        } else {

            $response["data"] = [
                "registered" => true,
                "userName" => $userName,
                "password" => $password,
                "token" => randomToken(13),
                "email" => $email,
                "latestTeam" => null,
                "currentTeam" => null,
                "points" => 0        
            ];
            file_put_contents($fileName, json_encode($response["data"], JSON_PRETTY_PRINT));
    
            unset($response["data"]["password"]);

            }

    } else {

        $response["message"] = "userName_in_use"; // Någon @#$%&! har redan tagit användarnamnet";

    }

    return $response;
}
function player_logout(){}
function player_joinTeam(){}
function player_enlistTeam(){}
function player_doToneic(){}




function aux_checkCredentials($credentials){
    $userName = $credentials["userName"];
    $password = $credentials["password"] ? $credentials["password"] : "";
    $token = $credentials["token"] ? $credentials["token"] : "";

    $fileName = aux_fileNamePlayer($userName);

    if (file_exists($fileName)) {

        $fileContents = getFileContents($fileName);
        freeFile($fileName);

        if ($password && $password === $fileContents["password"]) {
            return true;
        }

        if ($token && $token === $fileContents["token"]) {
            return true;
        }

    }

    return false;
}
function aux_fileNamePlayer ($userName, $extension = "json") {
    return PLAYERS_DIRECTORY."/".$userName.".".$extension;
}
function aux_isEmailUsed ($email) {
    $isUsed = false;
    foreach (aux_userFileNamesAsArray() as $fileName) {
        if (getFileContents($fileName)["email"] === $email) {
            freeFile($fileName);
            $isUsed = true;
            break;
        }
        freeFile($fileName);
    }
    return $isUsed;
}
function aux_updateUser ($userName, $update) {

    $fileName = aux_fileNamePlayer($userName);
    if (file_exists($fileName)) {
        $userData = getFileContents($fileName);
        foreach ($update as $key => $value) {
            $userData[$key] = $value;
        }
        file_put_contents($fileName, json_encode($userData, JSON_PRETTY_PRINT));
        freeFile($fileName);

        unset($userData["password"]);
        return $userData;
    }

    return null;
};
function aux_userFileNamesAsArray () {
    $array = [];
    foreach (new DirectoryIterator(PLAYERS_DIRECTORY) as $file) {
        
        if ($file->isDot()) continue;
        if ($file->getExtension() !== "json") continue;

        $array[] = PLAYERS_DIRECTORY."/".$file->getFilename();
    }
    return $array;
}


?>