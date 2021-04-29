<?php


function checkCredentials($credentials){

    include_once("./fileIO.php");

    $userName = $credentials["userName"];
    $password = $credentials["password"] ? $credentials["password"] : "";
    $token = $credentials["token"] ? $credentials["token"] : "";

    $fileName = "./dp/players/$userName";

    if (file_exists($fileName)) {

        $fileContents = getFileContents($fileName);

        if ($password && $password === $fileContents["password"]) {
            return true;
        }

        if ($token && $token === $fileContents["token"]) {
            return true;
        }

    }

    return false;
}


function loginFormHtml($origin = ""){

    return "
        <form>
            <input type='text'>
            <input type='password'>
            <input type='submit'>
        </form>
    ";

}


?>