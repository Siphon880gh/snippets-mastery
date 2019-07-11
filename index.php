<?php
  ini_set('display_errors', 1);
  ini_set('display_startup_errors', 1);
  error_reporting(E_ALL);

  // Configurable
  $DIR_SNIPPETS = "snippets/";
  $DEFAULT_THUMBNAIL_SIZE = "90x90"; // height x width
?><!DOCTYPE html>
<html lang="en">
  <head>
   <title>Snippets Mastery</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

    <!-- jQuery and Bootstrap  -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <!-- <script src="assets/js/vendor/ko.js"></script> -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.1.2/handlebars.min.js"></script>
        
    <link href="assets/css/index.css?v=<?php echo time(); ?>" rel="stylesheet">
    <link href="assets/css/multistates.css?v=<?php echo time(); ?>" rel="stylesheet">

    <script>
      <?php
      // TODO:
      // https://stackoverflow.com/questions/33850412/merge-javascript-objects-in-array-with-same-key
      // ggl - array of objects same keys merge

        function rglob($pattern, $flags = GLOB_ONLYDIR) {
          $files = glob($pattern, $flags); 
          foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR) as $dir) {
              $files = array_merge($files, rglob($dir.'/'.basename($pattern), $flags));
          }
          return $files;
        }
        $dirs = rglob("$DIR_SNIPPETS+?*");
        $lookup_metas = [];
        $lookup_uniqueids = [];


        function map_tp_dec($path) { // trailing parsed (removed preceding snippet/ and may remove ending slash /) and decorated object
          global $DIR_SNIPPETS;
          global $DEFAULT_THUMBNAIL_SIZE;
          global $lookup_metas;
          global $lookup_uniqueids;
          
          $path_tp = substr($path, strlen($DIR_SNIPPETS)+1); // trailing parsed

          // Assure trailing forward slash /
          $lastChar = $path[strlen($path)-1];
          $path = ($lastChar==='/') ? $path : "$path/";
          $desc = $thumbnail = $gotos = null;

          $decorated = [
            "current" => "",
            "path" => $path,
            "path_tp" => $path_tp,
            "next" => []
          ];

          if(file_exists($path . "+meta.json")) {
            $lookup_metas[$path] = @json_decode(file_get_contents($path . "+meta.json"));
          }

          $uniqueid_globs = glob($path . "+uniqueid*.dat");
          if(count($uniqueid_globs)===0) {
            $microtime = microtime(true);
            file_put_contents($path . "+uniqueid" . $microtime . ".dat", "");
            $uniqueid_glob = $microtime . ".dat";
          } else {
            $uniqueid_glob = basename($uniqueid_globs[0]);
          }
          $lookup_uniqueids[$path] = $uniqueid_glob;

          // die();
          
          return $decorated;
        } // map_tp_dec
        $dirs = array_map("map_tp_dec", $dirs);

        echo "var folders = " . json_encode($dirs) . ",";
        echo "ori = folders, ";
        echo "lookupMetas = " . json_encode($lookup_metas) . ";";
        echo "lookupUniqueIds = " . json_encode($lookup_uniqueids) . ";";
      ?>
    </script>

    <script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/multistates.js?v=<?php echo time(); ?>"></script>

</head>
    <body>
        <div class="container">
          <legend>Nested Folders</legend>
          <main id="target">
          </main>

          <fieldset class="deemp-fieldset">
            <legend>Summary</legend>
            <p id="summary-inner"></p>
          </fieldset>

          <fieldset class="deemp-fieldset">
            <legend>Debugging</legend>
            <small>Search for and open folder name: scrollToSearch("Some Title"):</small><br/>
            <input type="text" id="by-search" value="II">
            <button onclick='scrollToSearch($("#by-search").val())'>Go</button>
            <br><br>

            <small>Anchor to open unique Id folder: scrollToUniqueId("unique....dat"):</small><br/>
            <input type="text" id="by-uid" value="uniqueid1562162987.2096.dat">
            <button onclick='scrollToUniqueId($("#by-uid").val())'>Go</button>
            <br/><br/>

            <p>
              <small>Anchor with a tag:
              The story is about a man who started understanding the concept of <a href="javascript:void(0)" onclick='scrollToUniqueId("uniqueid1562162987.2094.dat");'>number 1</a>.
              </small>
            </p>

          </fieldset>

        </div> <!-- /.container -->
        
        <!-- Designer: Open Sans, Lato, FontAwesome, Waypoints, Skrollr, Pixel-Em-Converter -->
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,300|Open+Sans+Condensed:300" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/waypoints/4.0.0/jquery.waypoints.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/skrollr/0.6.30/skrollr.min.js"></script>
        <script src="https://raw.githack.com/filamentgroup/jQuery-Pixel-Em-Converter/master/pxem.jQuery.js"></script>
        
        <!-- Rendering: Handlebars JS, LiveQuery, Sprintf JS -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.js"></script>
        <script src="assets/js/vendor/livequery.js"></script>
        <script src="https://raw.githack.com/azatoth/jquery-sprintf/master/jquery.sprintf.js"></script>
        
        <!-- Compatibility: Modernizr, jQuery Migrate (check browser) -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js"></script>
        <script src="https://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
        
        <!-- Mobile: jQuery UI, jQuery UI Touch Punch -->
        <link href="https://code.jquery.com/ui/1.11.3/themes/ui-lightness/jquery-ui.css" rel="stylesheet"/>
        <script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
       
        <!-- Bootstrap JS -->
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
        
        <!-- Friendlier API: ListHandlers, Timeout -->
        <script src="https://raw.githack.com/Inducido/jquery-handler-toolkit.js/master/jquery-handler-toolkit.js"></script>
        <script src="https://raw.githack.com/tkem/jquery-timeout/master/src/jquery.timeout.js"></script>

    </body>
</html>