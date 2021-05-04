<?php

    function t1() {
        sleep(3);
        return "Hej";
    }

    function t2() {
        echo t1();
    }

    t2();

?>