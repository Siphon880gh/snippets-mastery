<?php

if(isset($_POST["search"])) {
  $search = $_POST["search"];
  // pcregrep: case insensitive, I ignoring binary files, recursive search
  $cmd = 'pcregrep --binary-files=without-match -ri "' . $search . '" "./snippets"'; 
  $res = [];
  $stdout = exec($cmd, $res);
  echo json_encode(["res"=>$res]);
} else {
  echo json_encode(["res"=>[]]);
}
?>