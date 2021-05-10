<?php

include_once("./fileIO.php");
include_once("../php/auxiliar.php");

define('USERS_DIRECTORY', './users/');
define('TEAMS_DIRECTORY', './teams/');
define('TONEICS_DIRECTORY', './toneics/');


// Bridge to API. All functions go through here
function bridge ($input) {

    if (!$input["payload"]) {
        return [
            "data" => null,
            "message" => "bridge_no_payload"
        ];
    }

    // check that files are in place
    if (isset($input["payload"]["userID"])) {
        $data = [
            "kind" => "user",
            "entityID" => $input["payload"]["userID"]
        ];
        if (!get_entityExist($data)) {
            return [
                "data" => null,
                "message" => "bridge_user_not_found"
            ];
        }
    }
    if (isset($input["payload"]["teamID"])) {
        $data = [
            "kind" => "team",
            "entityID" => $input["payload"]["teamID"]
        ];
        if (!get_entityExist($data)) {
            return [
                "data" => null,
                "message" => "bridge_team_not_found"
            ];
        }
    }
    
    // Call function
    return $input["action"]($input["payload"]);
}



function get_entityExist($payload) {

    if (!$payload) return false;

    $kind = $payload["kind"];
    $entityID = $payload["entityID"];
    $entityName = $payload["entityName"];

    if (!$kind || (!$entityID && !$entityName)) return false;

    if (!$entityID) {
        $function = $kind === "user" ? "aux_fileNameFromUserName" : "aux_fileNameFromTeamName";
        $entityID = $function($entityName);
    }

    $function = $kind === "user" ? "aux_filePathFromUserID" : "aux_filePathFromTeamID";
    $filePath = $function($entityID);

    return file_exists($filePath);
}
function get_serverPhase () {
    $start_hours = 19;
    $start_day = 5; // Friday
    $end_day = 7; // Sunday;
    $duration_ready = 30; // minutes
    
    $now_hours = intval(date("H"));
    $now_mins = intval(date("i"));
    $now_secs = intval(date("s"));

    $phase = "phase::Toneic";

    if (date("w") < $start_day) {
        
        $phase = "phase::Relax";

    } else if (date("w") === $start_day) {
        
        if ($now_hours < $start_hours ) {
            
            $phase = "phase::Relax";

            if ( $now_hours === $start_hours - 1 && $now_mins > 60 - $duration_ready ) {
                $phase = "phase::Ready";
                $timeLeft = (60 - $now_mins) * 60 - $now_secs;
            }

        }
        
    }

    if (date("w") === $end_day && $now_hours === 23 && $now_mins > 30) {
        $timeLeft = (60 - $now_mins) * 60 - $now_secs;
    }
   
    $data = [
        // "phase" => $phase,
        "phase" => "phase::Toneic",
        // "timeLeft" => $timeLeft,
        "timeLeft" => 345,
        "startDay" => $start_day,
        "startHour" => $start_hours,
        "endDay" => $end_day,
        "toneicID" => toneicID()
    ];
    return aux_response($data, "alles_gut");
}
function get_loadToneic ($payload) {

    $toneicID = $payload["toneicID"];

    $filePath = aux_filePathFromToneicID($toneicID);
    $responseData = getFileContents($filePath);

    $responseMessage = $responseData ? "alles_gut" : "no_file_contents";

    // Remove all solutions
    foreach ($responseData["crosswords"]["words"] as &$words) {
        $words["length"] = strlen($words["word"]);
        unset($words["word"]);
    }

    return aux_response($responseData, $responseMessage);

}
function toneic_latestActions ($payload) {

    $toneicID = $payload["toneicID"];
    $userID = $payload["userID"];

    $filePathUser = aux_filePathFromUserID($userID);
    $userData = getFileContents($filePathUser);
    $userToneics = $userData["toneics"];
    
    // Get the team with which this use if solving this Toneic. And the user's last update
    $indexUserToneic = array_search($toneicID, array_column($userToneics, 'toneicID'));
    if ($indexUserToneic !== false) {
        $teamID = $userToneics[$indexUserToneic]["teamID"];
        $lastAction = $userToneics[$indexUserToneic]["lastAction"];
    } else {
        // TODO: think more about this. Automatically create it?
        $responseData = null;
        $responseMessage = "user_has_no_such_toneic";
        return aux_response($responseData, $responseMessage);
    }

    $filePathTeam = aux_filePathFromTeamID($teamID);
    $teamData = getFileContents($filePathTeam);
    $teamToneics = $teamData["toneics"];
    $indexTeamToneic = array_search($toneicID, array_column($teamToneics, 'toneicID'));
    if ($indexTeamToneic !== false) {
        $actions = $teamToneics[$indexTeamToneic]["actions"];
        $nActions = count($actions);
    } else {
        // TODO: think more about this... team does not have this toneic?
        $responseData = null;
        $responseMessage = "team_has_no_such_toneic";
        return aux_response($responseData, $responseMessage);
    }

    // Get all actions since last update
    if ($lastAction >= $nActions - 1) {
        // Up to date
        $actions = [];
    } else {
        $actions = array_splice($actions, $lastAction);
        
        // Update user's lastAction
        $userToneics[$indexUserToneic]["lastAction"] = $nActions - 1;
        $update = [ "toneics" => $userToneics[$indexUserToneic] ];
        aux_update($filePathUser, $update);
    }

    $responseData = [
        "actions" => $actions
    ];
    $responseMessage = "alles_gut";

    return aux_response($responseData, $responseMessage);

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


function user_login ($payload) {

    $_SESSION["userData"] = ["loggedIn" => false];
    $_SESSION["loggedIn"] = false;
    $message = "";

    $userFileName = aux_fileNameFromUserName($payload["userName"]);
    if ($userFileName === null) {
        $message = "login_no_such_user_in_DB";
    } else {
        if (aux_isUserLegit($payload)) {
            $update = [
                "token" => randomToken(),
                "loggedIn" => true
            ];
    
            $_SESSION["userData"] = aux_update($userFileName, $update);
            if ($_SESSION["userData"]) {
                if (isset($_SESSION["userData"]["password"])) {
                    unset($_SESSION["userData"]["password"]);
                }
                $_SESSION["loggedIn"] = true;
            } else {
                $message = "login_updating_problems";
            }
        } else {
            $message = "login_invalid_credentials";
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
                "latestTeamName" => null,
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
function user_joinTeam($payload){

    $userID = $payload["userID"];
    $teamID = $payload["teamID"];
    $passwordForTeam = $payload["passwordForTeam"];

    if (!$teamID) {
        $teamID = aux_teamIDfromTeamName($payload["teamName"]);
        if (!$teamID) {
            return aux_response(null, "no_such_team_name");
        }
    }


    $responseData = [
        "ownTeam" => !!$payload["ownTeam"],
        "teamID" => $teamID
    ];


    // User allowed to join?
    $teamData = getFileContents(aux_filePathFromTeamID($teamID));
    if (!in_array($userID, $teamData["allowedUsers"], true)) {
        $credentials = [
            "fileName" => aux_filePathFromTeamID($teamID),
            "password" => $passwordForTeam
        ];
        if (!aux_checkCredentials($credentials)) {
            $responseData["joined"] = false;
            return aux_response($responseData, "team_credentials_invalid");
        }
    }


    // Get info about user's toneics (all history)
    $userData = getFileContents(aux_filePathFromUserID($userID));
    $userToneics = $userData["toneics"];


    // If necessary: Remove other teams for this toneic. User only be in one team at the time
    // new: true if user was not in a team before (not even own team)
    // change: true if user was in a team before
    $index = array_search(toneicID(), array_column($userToneics, 'toneicID'));
    $changeTeam = [
        "change" => false,
        "new" => false
    ];
    if ($index !== false) {
        if ($userToneics[$index]["teamID"] !== $teamID) {
            array_splice($userToneics, $index, 1);
            $changeTeam["change"] = true;
        }
    } else {
        $changeTeam["new"] = true;
    }
    $responseData["changeTeam"] = $changeTeam;


    // If necessary, update user information
    $responseMessage = "team_joined";
    if ($changeTeam["new"] || $changeTeam["change"]) {

        $userToneics[] = [
            "toneicID" => toneicID(),
            "teamID" => $teamID,
            "lastAction" => 0,
        ];
        $userUpdate = [
            "toneics" => $userToneics
        ];

        $userUpdate = aux_update(aux_filePathFromUserID($userID), $userUpdate);

        // Check result of update
        if ($userUpdate) {
            $responseData["joined"] = true;
        } else {
            $responseData["joined"] = false;
            $responseMessage = "team_join_network_problems";
        }

    } else {

        $responseData["joined"] = true;

    }


    // If all ok, get & save team data
    if ($responseData["joined"]) {

        $teamData = getFileContents(aux_filePathFromTeamID($teamID));

        // First make sure that team has info about this toneic.
        // Team could have info already if another user joined for this toneic earlier.
        $teamToneics = $teamData["toneics"];
        if (array_search(toneicID(), array_column($teamToneics, 'toneicID')) === false) {

            // Prepare
            $teamToneics[] = [
                "toneicID" => toneicID(),
                "actions" => []
            ];
            $teamUpdate = [
                "toneics" => $teamToneics
            ];

            // Update
            $teamUpdate = aux_update(aux_filePathFromTeamID($teamID), $teamUpdate);

            // Check update went well
            // ... TO DO... what if it didn't?
            $message .= $teamUpdate ? ", team_toneic_created_success" : ", team_toneic_created_failed";
        } else {
            $message .= ", team_toneic_already_in_place";
        }

        // Add data to response
        $responseData["teamName"] = $teamData["teamName"];
        $responseData["teamToneics"] = $teamData["toneics"];


        // Save teamName in user (if not own team)
        // Don't save teamID, that is only for the team for the current toneic
        if (!$payload["ownTeam"]) {
            $userUpdate = [
                "latestTeamName" => $responseData["teamName"],
            ];
            aux_update(aux_filePathFromUserID($userID), $userUpdate);
        }
    }


    // Response
    return aux_response($responseData, $responseMessage);
}
function user_joinOwnTeam ($payload) {
    $payload["ownTeam"] = true;
    $payload["teamID"] = aux_OwnTeamIDFromUserID($payload["userID"]);
    return user_joinTeam($payload);
}
function user_enlistTeam(){}
function user_doToneic(){}




// Check credentials
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

    // if ($credentials["userID"] === "anonymousUserID" && $credentials["token"] = "anonymousToken") {
    //     return true;
    // }

    $userName = $credentials["userName"];
    $userID = $credentials["userID"];
    if (isset($credentials["userID"])) {
        $fileName = aux_filePathFromUserID($credentials["userID"]);
    }
    if (isset($credentials["userName"])) {
        $fileName = aux_fileNameFromUserName($credentials["userName"]);
    }
    $credentials["fileName"] = $fileName;
    return aux_checkCredentials($credentials);
}


// Files and file names
function aux_teamIDfromTeamName ($teamName) {
    return pathinfo(aux_searchAmongTeams("teamName", $teamName), PATHINFO_FILENAME);
}
function aux_fileNameFromUserName ($userName) {
    return aux_searchAmongUsers("userName", $userName);
}
function aux_fileNameFromTeamName ($userName) {
    return aux_searchAmongTeams("teamName", $teamName);
}
function aux_filePathFromTeamID ($ID) {
    return TEAMS_DIRECTORY.$ID.".json";
}
function aux_filePathFromUserID ($ID) {
    return USERS_DIRECTORY.$ID.".json";
}
function aux_filePathFromToneicID ($ID) {
    return TONEICS_DIRECTORY."$ID/$ID.json";
}
function aux_OwnTeamIDFromUserID ($userID) {
    return "t_".$userID;
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
}


// Search
function aux_searchAmong($where, $key, $value, $onlyOne) {
    $found = [];
    $all = $where === "users" ? aux_userFileNamesAsArray() : aux_teamFileNamesAsArray();
    foreach ($all as $fileName) {
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
function aux_searchAmongTeams($key, $value, $onlyOne = true) {
    return aux_searchAmong("teams", $key, $value, $onlyOne);
}
function aux_searchAmongUsers($key, $value, $onlyOne = true) {
    return aux_searchAmong("users", $key, $value, $onlyOne);
}


// Update
function aux_update ($fileName, $update) {
    $data = getFileContents($fileName);

    foreach ($update as $key => $value) {
        $data[$key] = $value;
    }

    putFileContents($fileName, $data);

    if (isset($data["password"])) unset($data["password"]);

    return $data;
}


// Response
function aux_response($data, $message) {
    return [
        "data" => $data,
        "message" => $message
    ];
}


// Varied
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




?>