<?php

    $_SESSION["loggedIn"] = false;
    $userInfo = [
        "userName" => null,
        "token" => "",
        "loggedIn" => false
    ];

    if (isset($_GET["u"]) && isset($_GET["t"])) {

        $userInfo["userName"] = $_GET["u"];
        $userInfo["token"] = $_GET["t"];

        include "db/loginRegister.php";
        $loggedIn = checkCredentials([
            "userName" => $userInfo["userName"],
            "token" => $userInfo["token"]
        ]);

        if ($loggedIn) {
            $_SESSION["loggedIn"] = true;
            $userInfo["loggedIn"] = true;
        }

    }

    // // Create random user for the client
    // if ($userInfo["userName"] === null) {
    //     include_once("./db/auxiliarFunctions.php");
    //     $userInfo["userName"] = randomUserName();
    // }

?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, user-scalable=no">

    <!-- CSS -->
    <?php
        $path    = './css';
        $files = array_diff(scandir($path), array('.', '..'));
        foreach ($files as $file) {
            echo "<link rel='stylesheet' href='css/$file'>";
        }
    ?>


    <!-- FONTS -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:wght@300;700&family=Open+Sans:wght@300&family=Rajdhani:wght@300&display=swap" rel="stylesheet">     
    <title>Toneic</title>
</head>
<body>

    <main></main>
    
    <script>
        let userInfo = <?php echo json_encode($userInfo) ?>;
    </script>    

    <script type="module" src="./js/toneic.js"></script>

</body>
</html>