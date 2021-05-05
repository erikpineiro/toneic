<?php

function getFileContents($fileName) {

    $pathParts = pathInfo($fileName);
    $noExtensionName = $pathParts["dirname"]."/".$pathParts["filename"];
    $lockFile = $noExtensionName.".lock";
    $extension = $pathParts["extension"];

    if (file_exists($lockFile)) {
        usleep(500000); // 500 ms = .5s
        return getFileContents($fileName);
    }

    file_put_contents($lockFile, "locked"); // Creates the file

    $content = null;

    if (file_exists($fileName)) {
        $content = file_get_contents($fileName);    
        if ($extension === "json") {
            $content = json_decode($content, true);
        }
    }

    return $content;
}

function freeFile($fileName) {

    $pathParts = pathInfo($fileName);
    $noExtensionName = $pathParts["dirname"]."/".$pathParts["filename"];
    $lockFile = $noExtensionName.".lock";

    if (file_exists($lockFile)) {
        unlink($lockFile);
    }
}


?>