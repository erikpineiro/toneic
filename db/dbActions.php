<?php

include_once("./fileIO.php");
include_once("../php/auxiliar.php");


function team_create(){}
function team_editLetter(){}


function player_singup(){}
function player_login($credentials){

    if ( aux_checkCredentials($credentials) ) {

        // New token
        $userData = getFileContents($fileName);
        $userData["token"] = randomString(13);
        $userData["loggedIn"] = true;
        $_SESSION["userData"] = $userData;

        return $userData;

    }
    
    return null;

}
function player_logout(){}
function player_joinTeam(){}
function player_enlistTeam(){}
function player_doToneic(){}





function aux_checkCredentials($credentials){


    $userName = $credentials["userName"];
    $password = $credentials["password"] ? $credentials["password"] : "";
    $token = $credentials["token"] ? $credentials["token"] : "";

    $fileName = aux_fileNamePlayer ($userName);

    if (file_exists($fileName)) {

        $fileContents = getFileContents($fileName);

        if ($password && $password === $fileContents["password"]) {
            return true;
        }

        if ($token && $token === $fileContents["token"]) {
            return true;
        }

    }

    return false;
}
function aux_fileNamePlayer ($userName) {
    // extension added in getFileContents()
    return "./dp/players/$userName";
}




?>