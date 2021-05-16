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

        if ($input["payload"]["teamID"] === "own:team") {
            $input["payload"]["teamID"] = aux_OwnTeamIDFromUserID($input["payload"]["userID"]);
        }
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

    $responseData["toneicID"] = $toneicID;
    return aux_response($responseData, $responseMessage);
}
function crosswords_latestActions ($payload) {

    $toneicID = $payload["toneicID"];
    $userID = $payload["userID"];
    $init = $payload["init"];

    $filePathUser = aux_filePathFromUserID($userID);
    $userData = getFileContents($filePathUser);
    $userToneics = $userData["toneics"];
    
    // Get the team with which this use if solving this Toneic. And the user's last update
    $indexUserToneic = array_search($toneicID, array_column($userToneics, 'toneicID'));
    if ($indexUserToneic !== false) {
        $teamID = $userToneics[$indexUserToneic]["teamID"];
        $lastActionNumber = $init ? 0 : $userToneics[$indexUserToneic]["lastAction"];
    } else {
        // TODO: think more about this. Automatically create it?
        $responseData = null;
        $responseMessage = "user_has_no_such_toneic";
        return aux_response($responseData, $responseMessage);
    }

    $filePathTeam = aux_filePathFromTeamID($teamID);
    $teamToneics = aux_ensureToneicForTeam($toneicID, $filePathTeam);

    $indexTeamToneic = array_search($toneicID, array_column($teamToneics, 'toneicID'));
    if ($indexTeamToneic !== false) {
        $actions = $teamToneics[$indexTeamToneic]["actions"];
    } else {
        // This should not happen since we just created the toneic with aux_ensureToneicForTeam
        $responseData = null;
        $responseMessage = "team_has_no_such_toneic";
        return aux_response($responseData, $responseMessage);
    }

    // Number of latest action
    $numbers = array_map( function($action) { return $action["number"]; }, $actions);
    $topNumber = count($numbers) ? max($numbers) : 0;


    // Get all actions since last update
    $responseActions = [];
    foreach ($actions as $action) {
        if ($action["number"] > $lastActionNumber) {
            $responseActions[] = $action;
        }
    }

    // Update user's lastAction
    if (count($responseActions) > 0) {

        $replacement = array( $indexUserToneic => [
            "toneicID" => $userToneics[$indexUserToneic]["toneicID"],
            "teamID" => $userToneics[$indexUserToneic]["teamID"],
            "lastAction" => $topNumber,
        ]);
        $userToneics = array_replace($userToneics, $replacement);

        // $userToneics[$indexUserToneic]["lastAction"] = $topNumber; // This creates an associative array with a new key. Two elements
        $update = [ "toneics" => $userToneics ];
        aux_update($filePathUser, $update);
    }


    $responseData = [
        "actions" => $responseActions,
        "init" => $init
    ];
    $responseMessage = "alles_gut";

    return aux_response($responseData, $responseMessage);

}
function crosswords_newAction ($payload) {

    $toneicID = $payload["toneicID"];
    $userID = $payload["userID"];
    $action = $payload["action"];


    // Find the team that this user has joined for that toneic
    $toneic = aux_getUserToneic($userID, $toneicID);
    if ($toneic === null) {
        return aux_response(["updated" => false], "problems_with_users_toneic");
    }
    $teamID = $toneic["teamID"];


    // Make sure that team has an object for this toneic.
    // Team could have toneic already if another user joined for this toneic earlier.
    $filePathTeam = aux_filePathFromTeamID($teamID);
    $teamToneics = aux_ensureToneicForTeam($toneicID, $filePathTeam);


    // Update the action
    $indexToneic = array_search($toneicID, array_column($teamToneics, 'toneicID'));
    if ($indexToneic === false) {
        return aux_response(["updated" => false], "update_no_such_toneic");
    } else {
        $toneic = $teamToneics[$indexToneic];
        $actions = $toneic["actions"];

        $numbers = array_map( function($action) { return $action["number"]; }, $actions);
        $nextNumber = count($numbers) ? max($numbers) + 1 : 1;
        $action["number"] = $nextNumber;

        // If action is update letter, remove previous updates of this cell (origin)
        // Only the last update is interesting.
        foreach ($actions as $indexAction => $existingAction) {
            if ($action["origin"][0] === $existingAction["origin"][0] && $action["origin"][1] === $existingAction["origin"][1]) {
                array_splice($actions, $indexAction, 1);
                break;
            }
        }

        $actions[] = $action;
        $toneic["actions"] = $actions;

        // Remove the toneic with the old actions in ordet to place new one
        array_splice($teamToneics, $indexToneic, 1);
        $teamToneics[] = $toneic;
        $update = [ "toneics" => $teamToneics ];
        aux_update($filePathTeam, $update);

        return aux_response(["updated" => true], "alles_gut");
    }    
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

    $responseData = ["loggedIn" => false];
    $responseMessage = "";

    $userFileName = aux_fileNameFromUserName($payload["userName"]);
    if ($userFileName === null) {
        $responseMessage = "login_no_such_user_in_DB";
    } else {
        if (aux_isUserLegit($payload)) {

            $update = [ "token" => randomToken() ];
            $responseData = aux_update($userFileName, $update);

            if ($responseData) {
                unset($responseData["password"]);
                $responseData["loggedIn"] = true;
            } else {
                $message = "login_updating_problems";
            }

        } else {
            $message = "login_invalid_credentials";
        }
    }
    
    return aux_response($responseData, $message);
    
}
function user_register ($payload) {

    $userName = $payload["userName"];
    $password = $payload["password"];
    $email = $payload["email"];

    $responseData = [ "registered" => false ];
    $responseMessage = "";

    if (aux_searchAmongUsers("userName", $userName) === null) {
        
        // Email in use?
        if (aux_searchAmongUsers("email", $email) !== null) {
         
            $responseMessage = "email_in_use";

        } else {

            $userID = aux_newID("user");

            // Register Own Team. All users must have own team.
            // Throw away the return
            team_register([
                "userID" => $userID,
                "teamName" => aux_OwnTeamIDFromUserID($userID),
                "teamID" => aux_OwnTeamIDFromUserID($userID),
                "password" => "xxoo",
                "email" => $email,
            ]);

            $responseData = [
                "userID" => $userID,
                "userName" => $userName,
                "password" => $password,
                "token" => randomToken(13),
                "email" => $email,
                "joinedTeamID" => aux_OwnTeamIDFromUserID($userID),
                "joinedTeamName" => aux_OwnTeamIDFromUserID($userID),
                "toneics" => [],
                "points" => 0        
            ];

            putFileContents(USERS_DIRECTORY."/".$userID.".json", $responseData);

            unset($responseData["password"]);
            $responseData["registered"] = true;
            $responseMessage = "alles_gut";
                
        }

    } else {

        $responseMessage = "userName_in_use";

    }

    return aux_response($responseData, $responseMessage);
}
function user_joinTeam($payload){

    $responseDataNotJoined = ["joined" => false];
    
    // Check
    if (!array_key_exists("teamID", $payload) && !array_key_exists("teamName", $payload)) {
        return aux_response($responseDataNotJoined, "join_invalid_request");
    }
    
    $userID = $payload["userID"];
    $teamID = $payload["teamID"];
    $teamName = $payload["teamName"];
    $passwordForTeam = $payload["passwordForTeam"];

    $ownTeam = (substr($teamID, 0, 3) === "t_u") || ($teamID === "own:team");

    if (!$teamID) {
        $teamID = aux_teamIDfromTeamName($payload["teamName"]);
        if (!$teamID) {
            return aux_response($responseDataNotJoined, "no_such_team_name");
        }
    }


    $filePathTeam = $ownTeam ? aux_filePathFromTeamID(aux_OwnTeamIDFromUserID($userID)) : aux_filePathFromTeamID($teamID);
    $teamData = getFileContents($filePathTeam);
    

    // Access to team?
    if (!$ownTeam) {
        if (!in_array($userID, $teamData["allowedUsers"], true)) {
            $credentials = [
                "fileName" => aux_filePathFromTeamID($teamID),
                "password" => $passwordForTeam
            ];
            if (!aux_checkCredentials($credentials)) {
                return aux_response($$responseDataNotJoined, "team_credentials_invalid");
            } else {
                $allowedUsers = $teamData["allowedUsers"];
                $allowedUsers[] = $userID;
                $update = [ "allowedUsers" => $allowedUsers ];
                aux_update($filePathTeam, $update);
            }
        }
    }


    // Init responseData
    $responseData = [
        "ownTeam" => $ownTeam,
        "teamID" => $teamID,
        "teamName" => $teamData["teamName"],
    ];


    // Get info about user's toneics (all history)
    $filePathUser = aux_filePathFromUserID($userID);
    $userToneics = getFileContents($filePathUser)["toneics"];


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
            "joinedTeamID" => $teamID,
            "joinedTeamName" => $teamID ? $teamData["teamName"] : null,
            "toneics" => $userToneics
        ];

        $userUpdate = aux_update($filePathUser, $userUpdate);

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

    return aux_response($responseData, $responseMessage);
}




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
function aux_getUserToneic ($userID, $toneicID) {
    $filePathUser = aux_filePathFromUserID($userID);
    $userData = getFileContents($filePathUser);
    $userToneics = $userData["toneics"];
    $index = array_search($toneicID, array_column($userToneics, 'toneicID'));

    if ($index === false) {
        return aux_createUserToneic ($userID, $toneicID, $userData["joinedTeamID"]);
    } else {
        return $userToneics[$index];
    }
}
function aux_createUserToneic ($userID, $toneicID, $teamID) {

    $filePathUser = aux_filePathFromUserID($userID);
    $userData = getFileContents($filePathUser);
    $userToneics = $userData["toneics"];
    $index = array_search($toneicID, array_column($userToneics, 'toneicID'));

    // Remove it if it already exists: User has changed teams and needs a new Toneic
    if ($index !== false) {
        array_splice($userToneics, $index, 1);
    }
    
    $newToneic = [
        "toneicID" => $toneicID,
        "teamID" => $teamID,
        "lastAction" => 0,
    ];
    $userToneics[] = $newToneic;

    // Update also joinedTeamName and joinedTeamID
    $filePathTeam = $teamID === null ? aux_filePathFromTeamID(aux_OwnTeamIDFromUserID($userID)) : aux_filePathFromTeamID($teamID);
    $teamData = getFileContents($filePathTeam);
    $userUpdate = [
        "joinedTeamID" => $teamID,
        "joinedTeamName" => $teamID ? $teamData["teamName"] : null,
        "toneics" => $userToneics
    ];

    $userUpdate = aux_update($filePathUser, $userUpdate);

    // Check result of update
    if ($userUpdate) {
        return $newToneic;
    } else {
        return null;
    }
}
function aux_ensureToneicForTeam ($toneicID, $filePathTeam) {

    $teamData = getFileContents($filePathTeam);
    $teamToneics = $teamData["toneics"];
    if (array_search($toneicID, array_column($teamToneics, 'toneicID')) === false) {
        $teamToneics[] = [
            "toneicID" => $toneicID,
            "actions" => []
        ];
        $teamUpdate = [ "toneics" => $teamToneics ];
        $teamUpdate = aux_update($filePathTeam, $teamUpdate);
        
        // ... TO DO... what if update didnt go well?
        $teamData = getFileContents($filePathTeam);
        $teamToneics = $teamData["toneics"];
    }
    
    return $teamToneics;
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