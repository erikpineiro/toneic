<?php

include_once("./fileIO.php");
include_once("../php/auxiliar.php");

define('USERS_DIRECTORY', './users/');
define('TEAMS_DIRECTORY', './teams/');


function bridge ($input) {

    // check that files are in place    
    if (isset($input["payload"]["userID"]) && !file_exists(aux_fileNameFromUserID($input["payload"]["userID"]))) {
        return [
            "data" => null,
            "message" => "Bridge: User not found"
        ];
    }
    if (isset($input["payload"]["teamID"]) && !file_exists(aux_fileNameFromTeamID($input["payload"]["teamID"]))) {
        return [
            "data" => null,
            "message" => "Bridge: Team not found"
        ];
    }

    // Check that the user is legit
    if ($input["legitCheck"]) {
        aux_response(null, "Bridge: User credentials invalid");
    }
    
    // Call function
    return $input["action"]($input["payload"]);
}


function team_register ($payload) {

    $teamName = $payload["teamName"];
    $passwordForTeam = $payload["passwordForTeam"];
    $email = $payload["email"];
    $teamID = $payload["teamID"]; // For own teams
    $userID = $payload["userID"]; // User that registers the team

    $responseData = [ "registered" => false ];
    $responseMessage = "";

    if (aux_searchAmongTeams("teamName", $teamName) === null) {

        if ($teamID === null) {
            $teamID = aux_newID("team");
        }
                
        $responseData = [
            "teamID" => $teamID,
            "teamName" => $teamName,
            "password" => $passwordForTeam,
            "email" => $email,
            "allowedUsers" => [$userID],
            "toneics" => [],
            "points" => 0        
        ];

        putFileContents(TEAMS_DIRECTORY."/".$responseData["teamID"].".json", $responseData);

        unset($responseData["password"]);
        $responseData["registered"] = true;
        $responseMessage = "Team registered";
            
    } else {

        $responseMessage = "teamName_in_use";
    }

    return aux_response($responseData, $responseMessage);
}
function team_editLetter(){}


function user_singup(){}
function user_login ($payload) {

    $_SESSION["userData"] = ["loggedIn" => false];
    $_SESSION["loggedIn"] = false;
    $message = "";

    $userFileName = aux_fileNameFromUserName($payload["userName"]);
    if ($userFileName === null) {
        $message = "Login: User not found in Database";
    } else {
        if (aux_isUserLegit($payload)) {
            $update = [
                "token" => randomToken(),
                "loggedIn" => true
            ];
    
            $_SESSION["userData"] = aux_update($userFileName, $update);
            $_SESSION["loggedIn"] = true;        
        } else {
            $message = "Login: Invalid credentials";
        }
    }
    
    return aux_response($_SESSION["userData"], $message);
    
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
                "userID" => aux_newID("user"),
                "userName" => $userName,
                "password" => $password,
                "token" => randomToken(13),
                "email" => $email,
                "latestTeam" => null,
                "currentTeam" => null,
                "toneics" => [],
                "points" => 0        
            ];

            putFileContents(USERS_DIRECTORY."/".$response["data"]["userID"].".json", $response["data"]);

            unset($response["data"]["password"]);
            $response["data"]["registered"] = true;


            // Register Own Team. All users have own team.
            // Throw away the return
            team_register([
                "userID" => $response["data"]["userID"],
                "teamName" => aux_OwnTeamIDFromUserID($response["data"]["userID"]),
                "teamID" => aux_OwnTeamIDFromUserID($response["data"]["userID"]),
                "password" => "xxoo",
                "email" => $email,
            ]);
                
        }

    } else {

        $response["message"] = "userName_in_use";

    }

    return $response;
}
function user_logout(){}
function user_joinTeam($payload){

    $notJoinedData = [["joined" => false]];

    $userID = $payload["userID"];
    $teamID = $payload["teamID"];
    $passwordForTeam = $payload["passwordForTeam"];
    
    $teamData = getFileContents(aux_fileNameFromTeamID($teamID));
    if (!in_array($userID, $teamData["allowedUsers"], true)) {
        $credentials = [
            "fileName" => aux_fileNameFromTeamID($teamID),
            "password" => $password
        ];
        if (!aux_checkCredentials($credentials)) {
            return aux_response($notJoinedData, "No credentials for this team");
        }
    }
    
    $userData = getFileContents(aux_fileNameFromUserID($userID));
    $toneics = $userData["toneics"];

    // Already joined a team for this toneic?
    $index = array_search(toneicID(), array_column($toneics, 'toneicID'));
    if ($index !== false) {
        array_splice($toneics, $index, 1);
    }
    
    // Prepare update
    $toneics[] = [
        "toneicID" => toneicID(),
        "teamID" => $teamID
    ];
    $update = [
        "toneics" => $toneics
    ];

    $update = aux_update(aux_fileNameFromUserID($userID), $update);
    $message = $update ? "User joined team" : "Network problems";
    if (!$update) $update = $notJoinedData;

    return aux_response($update, $message);
}
function user_joinOwnTeam ($payload) {
    $payload["teamID"] = aux_OwnTeamIDFromUserID($payload["userID"]);
    return user_joinTeam($payload);
}
function user_enlistTeam(){}
function user_doToneic(){}




function aux_checkCredentials($credentials) {
    // Both for team and user

    $fileName = $credentials["fileName"];
    if (!$fileName) return false;

    $fileContents = getFileContents($fileName);
    if (!$fileContents) return false;

    if (isset($credentials["password"]) && $credentials["password"] === $fileContents["password"]) {
        return true;
    }

    if (isset($credentials["token"]) && $credentials["token"] === $fileContents["token"]) {
        return true;
    }

    return false;
}
function aux_isUserLegit($credentials) {
    $userName = $credentials["userName"];
    $userID = $credentials["userID"];
    if (isset($credentials["userID"])) {
        $fileName = aux_fileNameFromUserID($credentials["userID"]);
    }
    if (isset($credentials["userName"])) {
        $fileName = aux_fileNameFromUserName($credentials["userName"]);
    }
    $credentials["fileName"] = $fileName;
    return aux_checkCredentials($credentials);
}

function aux_fileNameFromUserName ($userName) {
    return aux_searchAmongUsers("userName", $userName);
}
function aux_fileNameFromTeamID ($ID) {
    return TEAMS_DIRECTORY.$ID.".json";
}
function aux_fileNameFromUserID ($ID) {
    return USERS_DIRECTORY.$ID.".json";
}
function aux_OwnTeamIDFromUserID ($userID) {
    return "t_".$userID;
}

function aux_searchAmong($where, $key, $value, $onlyOne) {
    $found = [];
    $all = $where = "users" ? aux_userFileNamesAsArray() : aux_teamFileNamesAsArray();
    foreach ($all as $fileName) {
        if (getFileContents($fileName)[$key] === $value) {

            if ($where === "teams") {
                echo getFileContents($fileName);
            }

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
function aux_searchAmongTeams($key, $value, $onlyOne = true) {
    return aux_searchAmong("teams", $key, $value, $onlyOne);
}
function aux_searchAmongUsers($key, $value, $onlyOne = true) {
    return aux_searchAmong("users", $key, $value, $onlyOne);
    // $found = [];
    // foreach (aux_userFileNamesAsArray() as $fileName) {
    //     if (getFileContents($fileName)[$key] === $value) {

    //         $found[] = $fileName;
    //         if ($onlyOne) {
    //             freeFile($fileName);
    //             break;
    //         }

    //     }
    //     freeFile($fileName);
    // }
    // return $onlyOne ? $found[0] : $found;
}

function aux_update ($fileName, $update) {
    $data = getFileContents($fileName);

    foreach ($update as $key => $value) {
        $data[$key] = $value;
    }

    putFileContents($fileName, $data);

    if (isset($data["password"])) unset($data["password"]);

    return $data;
}

function aux_fileNamesAsArray($path) {
    $array = [];
    foreach (new DirectoryIterator($path) as $file) {
        
        if ($file->isDot()) continue;
        if ($file->getExtension() !== "json") continue;
        if (substr($file->getFilename(), 0, 1) !== "u" && substr($file->getFilename(), 0, 1) !== "t") continue;

        $array[] = $path.$file->getFilename();
    }
    return $array;
}
function aux_teamFileNamesAsArray ($path = TEAMS_DIRECTORY) {
    return aux_fileNamesAsArray($path);
}
function aux_userFileNamesAsArray ($path = USERS_DIRECTORY) {
    return aux_fileNamesAsArray($path);

    // $array = [];
    // foreach (new DirectoryIterator(USERS_DIRECTORY) as $file) {
        
    //     if ($file->isDot()) continue;
    //     if ($file->getExtension() !== "json") continue;
    //     if (substr($file->getFilename(), 0, 1) !== "p") continue;

    //     $array[] = $path.$file->getFilename();
    // }
    // return $array;
}

function aux_newID($which) {

    $allIDs = $which === "user" ? aux_userFileNamesAsArray() : aux_teamFileNamesAsArray();
    $numbers = array_map(
        function($fileName) {
            return intval(substr(pathinfo($fileName, PATHINFO_FILENAME), 1));
        }, $allIDs);

    sort($numbers);

    $prefix = $which === "user" ? "u" : "t";
    return $prefix.substr("0000000000".($numbers[count($numbers) - 1] + 1), -7);
}

function aux_response($data, $message) {
    return [
        "data" => $data,
        "message" => $message
    ];
}


?>