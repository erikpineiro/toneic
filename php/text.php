<?php

require("../db/fileIO.php");

define('USERS_DIRECTORY', './users/');
define('TEAMS_DIRECTORY', '../db/teams/');


aux_teamIDfromTeamName ("basba");

function aux_teamIDfromTeamName ($teamName) {
    $file = aux_searchAmongTeams("teamName", $teamName);
    echo "results";
    echo "<br>";
    echo $file;
    echo "<br>";
    echo pathinfo($file, PATHINFO_FILENAME);
}
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
function aux_teamFileNamesAsArray ($path = TEAMS_DIRECTORY) {
    return aux_fileNamesAsArray($path);
}
function aux_userFileNamesAsArray ($path = USERS_DIRECTORY) {
    return aux_fileNamesAsArray($path);
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


// var_dump($_GET);
// $input = json_decode($_GET["data"], true);
// echo "<br>";

// var_dump($input);
// $payload = $input["payload"];
// echo "<br>";

// echo $input["action"];
// echo "<br>";
// echo "key1 : ".$payload["key1"];
// echo "<br>";
// echo "key2 : ".$payload["key2"];


// function a($p) { echo "a".$p; }
// function b($p) { echo "b".$p; }

// $r = 1;
// $function = $r === 1 ? "a" : "b";
// $function("e");

// $toneics = [
//     [
//         "toneicID" => "toneic1",
//         "teamID" => "team1"
//     ],
//     [
//         "toneicID" => "toneic2",
//         "teamID" => "team2"
//     ],
//     [
//         "toneicID" => "toneic3",
//         "teamID" => "team3"
//     ],
//     [
//         "toneicID" => "toneic4",
//         "teamID" => "team4"
//     ],
// ];

// $index = array_search('toneic3', array_column($toneics, 'toneicID'));
// echo gettype($index);
// if ($index !== false) {
//     echo "SPLICING".$index.")";
//     array_splice($toneics, $index, 1);
// }
// var_dump($toneics)


// $date=date("W");
// echo "t".date("y")."v".date("W");

    // define('PLAYERS_DIRECTORY', '../db/players');

    // $a = ["p1.json", "p12.json", "p2.json", "p5.json"];

    // $b = [];
    // var_dump($b[0]);
    // echo ($b[0] ? "null" : "yomen" );

    // echo newID(aux_userFileNamesAsArray());

    // function newID($allIDs) {
    //     $numbers = array_map(
    //         function($fileName) {
    //             return intval(substr(pathinfo($fileName, PATHINFO_FILENAME), 1));
    //         }, $allIDs);

    //     sort($numbers);
    //     return $numbers[count($numbers) - 1] + 1;
    // }


    // function aux_userFileNamesAsArray ($path = PLAYERS_DIRECTORY."/") {
    //     $array = [];
    //     foreach (new DirectoryIterator(PLAYERS_DIRECTORY) as $file) {
            
    //         if ($file->isDot()) continue;
    //         if ($file->getExtension() !== "json") continue;
    //         if (substr($file->getFilename(), 0, 1) !== "p") continue;
    
    //         $array[] = $path.$file->getFilename();
    //     }
    //     return $array;
    // }
    

?>