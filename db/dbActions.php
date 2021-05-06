<?php

include_once("./fileIO.php");
include_once("../php/auxiliar.php");

define('USERS_DIRECTORY', './users');


function bridge ($input) {

    // ADD fileName for User, if required
    if ($input["payload"]["userName"]) {
        $input["payload"]["userFileName"] = aux_fileNameFromUserName($input["payload"]["userName"]);
        if (!$input["payload"]["userFileName"]) {

            if ($input["action"] !== "user_register") {
                return [
                    "data" => null,
                    "message" => "UserID not found"
                ];
            }

        }
    }
    
    // Call function
    return $input["action"]($input["payload"]);
}


function team_register ($payload) {

    $teamName = $payload["teamName"];
    $password = $payload["password"];
    $email = $payload["email"];

    $response = [
        "data" => [ "registered" => false ],
        "message" => null,
    ];

    if (aux_searchAmongTeams("teamName", $teamName) === null) {
    
        $response["data"] = [
            "id" => aux_newID("team"),
            "teamName" => $teamName,
            "password" => $password,
            "code" => randomToken(4),
            "email" => $email,
            "allowedUsers" => [],
            "toneics" => [],
            "points" => 0        
        ];

        putFileContents(USERS_DIRECTORY."/t".$response["data"]["id"].".json", $response["data"]);

        unset($response["data"]["password"]);
        $response["data"]["registered"] = true;
            
    }

    return $response;
}
function team_editLetter(){}


function user_singup(){}
function user_login ($payload){

    $_SESSION["userData"] = ["loggedIn" => false];
    $_SESSION["loggedIn"] = false;

    if (aux_checkCredentials($payload)) {
        $update = [
            "token" => randomToken(),
            "loggedIn" => true
        ];

        $_SESSION["userData"] = aux_updateUser($payload["userFileName"], $update);
        $_SESSION["loggedIn"] = true;        
    }
    
    return [
        "data" => $_SESSION["userData"],
        "message" => ""
    ];
    
}
function user_register ($payload) {

    $userName = $payload["userName"];
    $password = $payload["password"];
    $email = $payload["email"];

    $response = [
        "data" => [ "registered" => false ],
        "message" => null,
    ];

    if (aux_searchAmongUsers("userName", $userName) === null) {
        
        // Email in use?
        if (aux_searchAmongUsers("email", $email) !== null) {
         
            $response["message"] = "email_in_use";

        } else {

            $response["data"] = [
                "id" => aux_newID("user"),
                "userName" => $userName,
                "password" => $password,
                "token" => randomToken(13),
                "email" => $email,
                "latestTeam" => null,
                "currentTeam" => null,
                "points" => 0        
            ];

            putFileContents(USERS_DIRECTORY."/u".$response["data"]["id"].".json", $response["data"]);

            unset($response["data"]["password"]);
            $response["data"]["registered"] = true;
                
            }

    } else {

        $response["message"] = "userName_in_use";

    }

    return $response;
}
function user_logout(){}
function user_joinTeam(){}
function user_enlistTeam(){}
function user_doToneic(){}




function aux_checkCredentials($credentials){
    $userFileName = $credentials["userFileName"];
    $password = $credentials["password"];
    $token = $credentials["token"];

    $fileContents = getFileContents($userFileName);

    if ($password && $password === $fileContents["password"]) {
        return true;
    }

    if ($token && $token === $fileContents["token"]) {
        return true;
    }

    return false;
}
function aux_fileNameFromUserName ($userName) {
    return aux_searchAmongUsers("userName", $userName);
}
function aux_searchAmongUsers($key, $value, $onlyOne = true) {
    $found = [];
    foreach (aux_userFileNamesAsArray() as $fileName) {
        if (getFileContents($fileName)[$key] === $value) {

            $found[] = $fileName;
            if ($onlyOne) {
                freeFile($fileName);
                break;
            }

        }
        freeFile($fileName);
    }
    return $onlyOne ? $found[0] : $found;
}
function aux_updateUser ($userFileName, $update) {
    $userData = getFileContents($userFileName);
    foreach ($update as $key => $value) {
        $userData[$key] = $value;
    }

    putFileContents($userFileName, $userData);
    
    unset($userData["password"]);

    return $userData;
};
function aux_userFileNamesAsArray ($path = USERS_DIRECTORY."/") {
    $array = [];
    foreach (new DirectoryIterator(USERS_DIRECTORY) as $file) {
        
        if ($file->isDot()) continue;
        if ($file->getExtension() !== "json") continue;
        if (substr($file->getFilename(), 0, 1) !== "p") continue;

        $array[] = $path.$file->getFilename();
    }
    return $array;
}
function aux_newID($which) {

    $allIDs = $which === "user" ? aux_userFileNamesAsArray() : aux_teamFileNamesAsArray();
    $numbers = array_map(
        function($fileName) {
            return intval(substr(pathinfo($fileName, PATHINFO_FILENAME), 1));
        }, $allIDs);

    sort($numbers);
    return substr("0000000000".($numbers[count($numbers) - 1] + 1), -7);
}



?>