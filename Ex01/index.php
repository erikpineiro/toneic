<?php
session_start();

// Om användaren redan är inloggad, skicka vidare dom till welcome.php
if (isset($_SESSION["isLoggedIn"])) {
    header("Location: welcome.php");
    exit();
}

?>
<!doctype html>
<html>
    <head>
        <title>Ex01</title>
        <meta charset="utf-8">
    </head>
    <body>

        <?php
        if (isset($_GET["error"])) {
            echo "<p>Fel kombination av användarnamn och lösenord.</p>";
        }
        ?>

        <form action="login.php" method="POST">
            <input type="text" name="username" placeholder="Användarnamn">
            <br>
            <input type="password" name="password" placeholder="Lösenord">
            <br>
            <button type="submit">Logga in</button>
        </form>

    </body>
</html>