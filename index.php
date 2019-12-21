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
        $lookup_saveids = [];


        function map_tp_dec($path) { // trailing parsed (removed preceding snippet/ and may remove ending slash /) and decorated object
          global $DIR_SNIPPETS;
          global $DEFAULT_THUMBNAIL_SIZE;
          global $lookup_metas;
          global $lookup_saveids;
          
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

          $saveid_globs = glob($path . "+saveid*.dat");
          if(count($saveid_globs)===0) {
            $microtime = microtime(true);
            file_put_contents($path . "+saveid" . $microtime . ".dat", "");
            $saveid_glob = $microtime . ".dat";
          } else {
            $saveid_glob = basename($saveid_globs[0]);
          }
          $lookup_saveids[$path] = $saveid_glob;

          // die();
          
          return $decorated;
        } // map_tp_dec
        $dirs = array_map("map_tp_dec", $dirs);

        echo "var folders = " . json_encode($dirs) . ",";
        echo "ori = folders, ";
        echo "lookupMetas = " . json_encode($lookup_metas) . ";";
        echo "lookupUniqueIds = " . json_encode($lookup_saveids) . ";";
      ?>
    </script>

    <script>
    function selectAndCopyTextarea($el, cb) {
      this.selectTextarea = function($el, callback) {
        var isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

        if(isIOS)
          $el.get(0).setSelectionRange(0,9999);
        else
          $el.select();

        callback();
      } // selectTextarea

      this.saveToClipboard =function() {
        try {
          var successful = document.execCommand( 'copy' );
          var msg = successful ? 'successful' : 'unsuccessful';
          console.log('Copying text command was ' + msg);
          $done.fadeIn(800).delay(1200).fadeOut(500);
        } catch (err) {
          console.log('Oops, unable to copy');
        }

      } // saveToClipboard

      this.selectTextarea($el, saveToClipboard);
      if(cb) cb();

    } // selectAndCopyTextarea

    function animateCopied() {
      $done = $("#copied-message");
      $done.fadeIn(800).delay(1200).fadeOut(500);
    }

    function toggleSearchResults(display) {
      $div = $("#search-results");
      if(display)
        $div.fadeIn(800);
      else
        $div.fadeOut(500);
    }

    function checkSearcher() {
      $searcher = $("#searcher");
      if($searcher.val().length===0)
        toggleSearchResults(false);
    } // checkSearcher

    function doSearcher() {
      $searcher = $("#searcher");
      val = $searcher.val();
      if(val.length===0) return;

      $div = $("#search-results .contents");
      $.post("search.php", {search:val})
      .done(greps=>{
        greps = JSON.parse(greps); // grep results array
        greps = greps["res"];
        console.log(greps);
        
        // Reset
        $div.html(`<div><table id="table-search-results">
            <thead>
              <th>Concept (Folder)</th>
              <th>File</th>
              <th>Context</th>
            <thead>
            <tbody>
            </tbody>
          </table></div>`)
        $tbody = $div.find("tbody");

        // Match and render
        greps.forEach(res=> {
          // x/y/z/filepath: surrounding_text

          // Reset placeholders
          var afterFirstDoubleColon="", beforeFirstDoubleColon="", folder = ""; file="", context="";

          afterFirstDoubleColon = res.match(/:(.*)/im);
          afterFirstDoubleColon = afterFirstDoubleColon[1];
          afterFirstDoubleColon = afterFirstDoubleColon.trim();
          context = afterFirstDoubleColon;

          beforeFirstDoubleColon = res.match(/(.*?):/im);
          beforeFirstDoubleColon = beforeFirstDoubleColon[1];
          beforeFirstDoubleColon = beforeFirstDoubleColon.trim();

          i = beforeFirstDoubleColon.lastIndexOf("/")
          file = beforeFirstDoubleColon.substr(i+1);

          folder = beforeFirstDoubleColon.split("/").slice(-2, -1);

          $tbody.append(`
              <tr>
                <td><a onclick="scrollToNonoverridden('${folder}')" href="javascript:void(0);">${folder}</a></td>
                <td>${file}</td>
                <td><pre>${context}</pre></td>
              </tr>`);
        }); // foreach
        toggleSearchResults(true);
      });
    } // doSearcher

    function clearSearcher() {
      $searcher = $("#searcher");
      $searcher.val("");
      toggleSearchResults(false);
    }
    </script>

    <style>
    .error {
      color:red; border:1px solid red; background-color:lightred;
      padding: 10px 20px 10px 20px;
      border-radius: 2px;
      margin-left: 10px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    </style>

    <script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/multistates.js?v=<?php echo time(); ?>"></script>

</head>
    <body>

      <div style="position:absolute; top:0; right:5px;">
      <a href="javascript:void(0)" onclick="window.open('README.md'); window.open('README-deploy-js.md'); window.open('https://github.com/Siphon880gh/snippets-mastery')"><span class="fa fa-question"> 3</span></a>
      </div>

        <div class="container">
        
          <?php
            
            if(!`which pcregrep 2>/dev/null`) {
              echo "<div class='error'>Error: Your server does not support pcregrep necessary to find text in files. Please contact your server administrator.</div>";
            }

          ?>

          <legend>Nested Folders</legend>

          <div style="float:right; margin-top:5px;"><span>Open folder via terminal: </span><input id="open-command" style="background-color:darkgray; color:white; padding: 0 5px 0 5px; width:350px;" onclick="selectAndCopyTextarea($('#open-command'), animateCopied);" value="open `filepath`"></input></div>
          <br style="clear:both;"/>
          <div style="float:right; margin-top:5px;"><span>Templates +meta.json: </span>
            <a href="templates/1/+meta.json" target="_blank">Basic</a> | 
            <a href="templates/2/+meta.json" target="_blank">Overriding</a> | 
            <a href="templates/3/+meta.json" target="_blank">Advanced</a>
          </div>
          <br style="clear:both;"/>
          <div id="searcher-container" style="float:right; margin-top:5px;">
                <!-- <label for="alpha-strip" style="font-weight:400;">Text:</label> -->
                <input id="searcher" onkeyup="checkSearcher()" class="toolbar" type="text" placeholder="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style="width:180px;">
                <button id="searcher-btn" onclick="doSearcher()" style="cursor: pointer;"><span class="fa fa-search" style="cursor: pointer;"></span> Find text</button>
                <span>&nbsp;</span>
                <button onclick="if(confirm('Clear Find text field?')) clearSearcher();" style="cursor: pointer; border:0;">Clear</button>
          </div>
          <br style="clear:both;"/><br/>

          <main id="target">
          </main>

          <fieldset class="deemp-fieldset">
            <legend><span class="fa fa-book"></span> Summary</legend>
            <p id="summary-inner">None loaded.</p>
          </fieldset>

          <br/>
          <fieldset id="search-results" class="deemp-fieldset" style="display:none;">
            <legend style="font-size:15.75px;"><span class="fa fa-search"></span> Search Results</legend>
            <div class="contents"></div>
          </fieldset>

          <fieldset class="deemp-fieldset hidden">
            <legend>Testing</legend>
            <small>Search and open by folder name: scrollToText("Some Title"):</small><br/>
            <input type="text" id="by-search" value="II">
            <button onclick='scrollToText($("#by-search").val())'>Run function</button>
            <br><br>

            <small>Open by unique Id (Id is in li[data-uid] or folder contents): scrollToUniqueId("unique....dat"):</small><br/>
            <input type="text" id="by-uid" value="saveid1562162987.2096.dat">
            <button onclick='scrollToUniqueId($("#by-uid").val())'>Run function</button>
            <br/><br/>

            <p>
              <small>Search or open by unique Id with &#10094;a&#10095; tags:<br/>
              The story is about a man who started understanding the concept of <a href="javascript:void(0)" onclick='scrollToUniqueId("saveid1562162987.2094.dat");'>number 1</a>.
              </small>
            </p>

          </fieldset>

        </div> <!-- /.container -->

        <div id="copied-message" style="display:none; position:fixed; border-radius:5px; top:0; right:0; color:green; background-color:rgba(255,255,255,1); padding: 5px 10px 5px 5px;">Copied!</div>
        
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