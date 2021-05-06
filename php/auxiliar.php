<?php



function serverPhase () {
    $start_hours = 19;
    $start_day = 5; // Friday
    $end_day = 7; // Sunday;
    $duration_ready = 30; // minutes
    
    $now_hours = intval(date("H"));
    $now_mins = intval(date("i"));
    $now_secs = intval(date("s"));

    $phase = "phase::Toneic";

    if (date("w") < $start_day) {
        
        $phase = "phase::Relax";

    } else if (date("w") === $start_day) {
        
        if ($now_hours < $start_hours ) {
            
            $phase = "phase::Relax";

            if ( $now_hours === $start_hours - 1 && $now_mins > 60 - $duration_ready ) {
                $phase = "phase::Ready";
                $timeLeft = (60 - $now_mins) * 60 - $now_secs;
            }

        }
        
    }

    if (date("w") === $end_day && $now_hours === 23 && $now_mins > 30) {
        $timeLeft = (60 - $now_mins) * 60 - $now_secs;
    }
   
    return [
        // "phase" => $phase,
        "phase" => "phase::Toneic",
        // "timeLeft" => $timeLeft,
        "timeLeft" => 345,
        "startDay" => $start_day,
        "startHour" => $start_hours,
        "endDay" => $end_day
    ];
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