
<?php

function getFileContents($fileName, $extension = "json") {

    $lockFile = $fileName.".lock";
    $realFile = $fileName.".".$extension;

    if (file_exists($lockFile)) {
        usleep(500000); // 500 ms = .5s
        return getFileContents($fileName, $extension);
    }

    file_put_contents($lockFile, "locked"); // Creates the file

    $content = null;

    if (file_exists($realFile)) {

        $content = file_get_contents($realFile);
        
        if ($extension === "json") {
            $content = json_decode($content, true);
        }

    }

    return $content;

}



?>