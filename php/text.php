<?php


function a($p) { echo "a".$p; }
function b($p) { echo "b".$p; }

$r = 1;
$function = $r === 1 ? "a" : "b";
$function("e");

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