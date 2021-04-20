<?php
session_start();

// Om användaren inte är inloggad
if (isset($_SESSION["isLoggedIn"]) == false) {
    header("Location: index.php");
    exit();
}

// Hämta användarens namn i vår session.
$username = $_SESSION["username"];
?>
<!doctype html>
<html>
    <head>
        <title>Ex01</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>
            Välkommen <?php echo $username; ?>
        </h1>

        <form action="logout.php" method="POST">
            <button type="submit">Logga ut</button>
        </form>
    </body>
</html>