<?php
// Fixed Bug: Chrome or PHP update breaks when file_get_contents has a cachebuster param in URL
// $time = time();
// $txt = file_get_contents("gauges.json?nocache=$time");
$txt = file_get_contents("gauges.json");
if($txt!==false)
    echo $txt;
else
    header('HTTP/1.0 302'); // ajax done will not trigger

?>