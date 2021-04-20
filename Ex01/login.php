<?php
session_start();

$user = ["username" => "sebbe", "password" => "1234"];

// Om användaren har skickat formuläret
if (isset($_POST["username"]) && isset($_POST["password"])) {
    $username = $_POST["username"];
    $password = $_POST["password"];

    // Jämför användaruppgifter
    if ($username == $user["username"] && $password == $user["password"]) {
        $_SESSION["isLoggedIn"] = true;
        $_SESSION["username"] = $username;

        // Om allt stämde, skicka vidare användaren till welcome.php
        header("Location: welcome.php");
        exit();
        // return;
    }
}

// Om någonting inte stämde skicka tillbaka användaren till index.php
header("Location: index.php?error=1"); // Lägg till GET-parametern "error"
exit();
?>