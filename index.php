<?php

    /*
        initData = {
            loggedIn,
            userData: { userName, token, latestTeam },
            serverPhase: { phase, timeLeft }
        }
    */
    // require("./php/auxiliar.php");
    // $initData = [
    //     "userData" => null,
    //     "loggedIn" => false,
    //     "serverPhase" => serverPhase()
    // ];

    // if (isset($_SESSION["loggedIn"]) && $_SESSION["loggedIn"] === true) {

    //     $initData["userData"] = $_SESSION["userData"];
    //     $initData["loggedIn"] = true;

    //     // $initData["userName"] = $_SESSION["userName"];
    //     // $initData["token"] = $_SESSION["token"];

    //     // $initData = [
    //     //     "userName" => $_SESSION["userName"],
    //     //     "token" => $_SESSION["token"],
    //     //     "loggedIn" => true
    //     // ];
    
    // }


?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, user-scalable=no">
    <title>Toneic</title>

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

</head>
<body>

    <main>
        <div id="content">
            <div id="header"></div>
            <div id="menu"></div>
            <div id="views">
                <div id="archive" class="view"></div>
                <div id="league" class="view"></div>
                <div id="home" class="view"></div>
                <div id="toneic" class="view"></div>
            </div>
        </div>
        <div id="userInfo" class="cover invisible"></div>        
        <div id="loginRegisterJoin" class="cover off"></div>        
        <div id="init" class="cover">INIT PAGE</div>        
    </main>
    
    <!-- <script>
        let initData = <?php echo json_encode($initData) ?>;
    </script>     -->

    <script type="module" src="./js/index.js"></script>

</body>
</html>
