<?php

if(isset($_POST["txt"])) {
    file_put_contents("gauges.json", $_POST["txt"]);
}

?>