<?php

function getFileContents ($fileName, $nTries = 0) {

    if (!file_exists($fileName)) {
        return null;
    }

    if (isFileLocked($fileName)) {
        $nTries++;        
        if ($nTries > 50) {
            return null;
        } else {
            usleep(50000); // 50ms
            return getFileContents($fileName, $nTries);
        }
    }

    lockFile($fileName);
    $content = file_get_contents($fileName);
    freeFile($fileName);

    return json_decode($content, true);
}

function putFileContents ($fileName, $data) {
    lockFile($fileName);
    file_put_contents($fileName, json_encode($data, JSON_PRETTY_PRINT));
    freeFile($fileName);
}

function freeFile ($fileName) {

    $pathParts = pathInfo($fileName);
    $noExtensionName = $pathParts["dirname"]."/".$pathParts["filename"];
    $lockFile = $noExtensionName.".lock";

    if (file_exists($lockFile)) {
        unlink($lockFile);
    }
}

function lockFile ($fileName) {

    $pathParts = pathInfo($fileName);
    $noExtensionName = $pathParts["dirname"]."/".$pathParts["filename"];
    $lockFile = $noExtensionName.".lock";

    file_put_contents($lockFile, "locked"); // Creates the file
}

function isFileLocked ($fileName) {

    $pathParts = pathInfo($fileName);
    $noExtensionName = $pathParts["dirname"]."/".$pathParts["filename"];
    $lockFile = $noExtensionName.".lock";

    return file_exists($lockFile);
}

?>