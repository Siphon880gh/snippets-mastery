<?php
$time = time();
$txt = file_get_contents("gauges.json?nocache=$time");
if($txt!==false)
    echo $txt;
else
    header('HTTP/1.0 302'); // ajax done will not trigger

?>