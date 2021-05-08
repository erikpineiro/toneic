<?php


function toneicID () {
    return "t".date("y")."v".date("W");
}


function randomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
function randomUserName(){
    return "_u!random_".randomString(12);
}
function randomToken () {
    return randomString(13);
}

?>