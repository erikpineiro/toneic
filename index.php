<?php

    if (isset($_SESSION["loggedIn"]) && $_SESSION["loggedIn"] === true) {

        $initData = [
            "userName" => $_SESSION["userName"],
            "token" => $_SESSION["token"],
            "loggedIn" => true
        ];
    
    } else {

        $initData = [
            "loggedIn" => false
        ];

    }

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

    <main></main>
    
    <script>
        let initData = <?php echo json_encode($initData) ?>;
    </script>    

    <script type="module" src="./js/init.js"></script>

</body>
</html>
