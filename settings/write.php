<?php

if(isset($_POST["txt"])) {
    file_put_contents("session.json", $_POST["txt"]);
}

?>