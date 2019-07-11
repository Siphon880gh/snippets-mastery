<?php

$txt = file_get_contents("gauges.json");
if($txt!==false)
    echo $txt;
else
    header('HTTP/1.0 302'); // ajax done will not trigger

?>