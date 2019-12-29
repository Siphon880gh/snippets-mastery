// NEW selector is case insensitive
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
  return function( elem ) {
      return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
  };
});

window.lastOpenedUid = "";

function mergeByCommonPath(data) {
  // the function where the nesting magic happens
  // this function generates an object for each folder recursively
  var nestnext = function (folders, item, index) {
    
    var newObj = {};
    Object.assign(newObj, item);
    newObj.current = folders[index]; // title is based on folder name

    newObj.next = (index + 1 < folders.length)
        ? nestnext(folders, item, index + 1) // If there is next element, that is `index` is lesser than `folders` length, run this function recursively with the `index` of the next item
        : [] // else return empty object

    return newObj;

  } // nestnext

  // Iterate over each item in data array
  return data.map(function (item) {
    // Separate the item's current by +
    var folders = item.path_tp.split('/+')
    // console.log(folders)

    // Return nested folders starting from the top-level folder
    return nestnext(folders, item, 0)
  })
} // nestFolders
console.log(folders);
folders = mergeByCommonPath(folders);
console.log(folders);


function mergeByKey(array) {

var output = array.reduce(function(o, cur) {

  // Get the index of the key-value pair.
  var occurs = o.reduce(function(n, item, i) {
    // if((item.current === cur.current)) debugger;
    return (item.current === cur.current) ? i : n;
  }, -1);
  // debugger;

  // If the current is found,
  if (occurs >= 0 && o[occurs]!==undefined) {

    // copy over the properties
    tempPath = o[occurs].path;
    tempPathTP = o[occurs].path_tp;
    tempNext = o[occurs].next;
    Object.assign(o[occurs], cur);
    o[occurs].path = tempPath;
    o[occurs].path_tp = tempPathTP;
    o[occurs].next = tempNext;

    // append the current value to its list of values.
    o[occurs].next = o[occurs].next.concat(cur.next);
    // debugger;

  // Otherwise,
  } else {

    // add the current item to o (but make sure the value is an array).
    if(cur.current!==undefined) {
      // copy over the properties
      var tempNext = [cur.next];
      var obj = {};
      Object.assign(obj, cur);
      obj.next = tempNext;
      // var obj = {current: cur.current, next: };
      o = o.concat([obj]);
    }
  }

  return o;
}, []); // those with the same key "current" becomes one entity and their former values "next" pushed into the new entity's array "next"

// debugger;
for(var i=0; i<output.length; i++) {
  output[i].next = mergeByKey(output[i].next);
}

return output;
} // mergeByKey

folders = mergeByKey(folders);

console.log(folders);
window.summary = "";

function objToHtml(item) {
  var uniqueId = lookupUniqueIds[item.path];
  uniqueId = uniqueId.substr(1);
  var $liDom = $(`<li class="accordion meta" data-uid="${uniqueId}" data-path="${item.path}"></li>`);
  $liDom.append($(`<span class="name">${item.current}</span>`));
  $contain = $(`<span class="contain"></span>`);
  var $meta = $liDom;
  // var $meta = $liDom.find(".meta");
  
  if(lookupMetas[item.path]) {
    // Extract property from metas. If property not defined at +meta.json, then it'll be value undefined
    var {summary, summaryFile, titleOverridden, desc, gotos} = lookupMetas[item.path];
    // debugger;

    // Folder text overridden vs not overridden
    $meta.find(".name").attr("data-folder-name", item.current);
    if(titleOverridden && titleOverridden.length) { 
      $meta.find(".name").html(titleOverridden);
    }

    if(desc && desc.length) {
      var $info = $(`<span class="fas fa-info"></span>`);
      $info.attr("data-toggle", "tooltip");
      $info.attr("data-trigger", "click");
      $dom = $(`<div>${desc}</div>`);
      var $imgs = $dom.find("img");
      var $a = $dom.find("a");

      $imgs.each( (i, el)=> {
        var $img = $(el);
        var src = $img.attr("src");
        if(src.indexOf("./")==0) {
          src=item.path+src.substr(2);
          $img.attr("src", src);
        }
      }); // imgs

      $a.each( (i, el)=> {
        var $a = $(el);
        var href = $a.attr("href");
        if(href.indexOf("./")==0) {
          href=item.path+href.substr(2);
          $a.attr("href", href);
        }
      });

      // debugger;
      // Tooltip attributes
      $info.attr("title", `
        <b style="font-size:21px;">Description</b><p/>
        <u>${titleOverridden || item.current}</u>:<br/>
        ${$dom.html()}
      `);
      $info.tooltip({placement:"bottom", html:true, delay:{show:50}});
      $contain.append($info);
    } // if desc

    var summaryText = "",
        summaryFileText = "";

    // Prepare summary text if exists
    if(summary && summary.length) {
      if(Array.isArray(summary))
        summaryText = encodeURI(summary.join("<br/>"));
      else
        summaryText = summary;

      // alert(summaryText);
    }

    // Get and prepare summary file text if exists, then render
    if(summaryFile && summaryFile.length) {
      var url = summaryFile;
      if(url.length && url[0]===".") {
        var path = $meta.attr("data-path");
        url = path + url;
      }
      console.log($contain)
      $.ajax( {
        cache: false,
        url: url,
        success: function(summaryFileContent) {
          var $contain = this;

          if(typeof summaryFileContent === "object")
            summaryFileContent = "<textarea class=fullwidth100>" + encodeURI(JSON.stringify(summaryFileContent)) + "</textarea>"; // if you're referencing a json file with summaryFile, force type to be string. 
          
          summaryFileContent = summaryFileContent.replace(/\n/g, "<br>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
          summaryFinalText = (summaryText && summaryText.length)?`${summaryText}<br/>${summaryFileContent}`:summaryFileContent;
          createSummaryIconAndContents(summaryFinalText, $contain, true);
        }.bind($contain),
        error: function(error) {
          var $contain = this;
          if(summaryText && summaryText.length) {
            createSummaryIconAndContents(summaryText, $contain, true);
          }
        }.bind($contain) // fail
      })

    // Render summary text if summary file text does not exist and summary text does exist
    } else if(summaryText && summaryText.length) {
      createSummaryIconAndContents(summaryText, $contain, false);
    }

    function createSummaryIconAndContents(text, $contain, ajaxed) {
      var $summary = $(`<span class="fas fa-book-reader" data-summary="${text}"></span>`);
      $summary.on("click", (event)=> {
        var $this = $(event.target);
        var summary = $this.attr("data-summary");
        summary = decodeURI(summary);
        $("#summary-inner").html(summary);
      });
      $queriedInfoButton = $contain.find(".fa-info");
      if($queriedInfoButton.length) {
        $summary.insertAfter($queriedInfoButton);
      } else {
        $contain.prepend($summary);
      }
      // ajaxed now obsoleted
      // if(ajaxed)
      //   $contain.prepend($summary);
      // else
      //   $contain.append($summary);
    }
  
    if(gotos && gotos.length) {
      $meta.data("gotos", gotos);
        var count = gotos.length;
        var $gotosBtn = $(`<span class="fas fa-globe gotos-click"> ${count}</span>`);
    
        $gotosBtn.on("click", (event)=>{
          for(var i=0; i<gotos.length; i++) {
            var url = gotos[i];
            var randomNum = Math.floor((Math.random() * 1000) + 1);
            if(url.length && url[0]===".") {
              var path = $meta.attr("data-path");
              url = path + url;
            }
            window.open(url, "target_blank_" + randomNum);
          } // for
        });

      $contain.append( $gotosBtn );
    } // gotos
  } // hasMeta

  // Add whether or not has +meta.json
  var $thermometer = $(
  `<span class="thermo">
    <span class="fas fa-thermometer-empty active"></span>
    <span class="fas fa-thermometer-quarter"></span>
    <span class="fas fa-thermometer-three-quarters"></span>
    <span class="fas fa-thermometer-full"></span>
  </span>`);
  
  $thermometer.on("click", (event) => {
    var $thermoInstance = $(event.target),
        $thermoWrapper = $thermoInstance.closest(".thermo");
    index = $thermoWrapper.find(".fas").index($thermoWrapper.find(".active"));
    // debugger;
    $thermoWrapper.find(".active").removeClass("active");
  
    // debugger;
    if(index===3) {
      $thermoWrapper.find(".fas").eq(0).addClass("active");
    } else {
      index++;
      $thermoWrapper.find(".fas").eq(index).addClass("active");
    }
    // debugger;
  
    updateDb();
  });
  $contain.append($thermometer);
  
  
  var $multistates = $(`
  <div class="multistates-wrapper" style="display:inline-block;">
    <aside class="multistates">
        <data class="data-wrapper" data-states="cccc">
            <span class="p1 unselectable" unselectable="on"></span>
            <span class="p2 unselectable" unselectable="on"></span>
            <span class="p3 unselectable" unselectable="on"></span>
            <span class="p4 unselectable" unselectable="on"></span>
        </data>
    </aside>
  </div>`);
  $multistates.multistates({$animatedDom:$multistates, callback:updateDb});
  $contain.append($multistates);
  
  $liDom.append($contain);
  
  // if(item.path==="snippets/+I/");
  //   debugger;
  return $liDom;
} // objToHtml

function updateDb() {
  // Read JSON
  setTimeout(()=> {
      var arr = $("li").toArray().map((el) => { 
          return {
          uid:$(el).attr("data-uid"), 
          data: {
              thermo:$(el).find(".thermo .fas.active").index(), 
              multistates: $(el).find(".multistates .data-wrapper").attr("data-states")} 
          } 
      });
      var prepared = JSON.stringify({
        "opened":window.lastOpenedUid, 
        "gauges":arr
      });
  
      $.ajax({
          method:"POST", 
          url:"settings/write.php", 
          data: {
              txt: prepared
          }})
          .done( (dat)=>{ 
              console.log("Written to Db");
              // console.log(dat); 
      });
  }, 200);
} // updateDb

function readDb() {
  var txt = "";

  $.ajax({
          method:"GET", 
          url:"settings/read.php", 
          cache: false
         })
          .done(setDomFromJson);

  function setDomFromJson(session) {
      console.log("Reading Db");
      var {opened, gauges} = JSON.parse(session);
      window.lastOpenedUid = opened;

      gauges.forEach((dat) => {
          var $row = $(`li[data-uid="${dat.uid}"]`);
          // debugger;
          var $thermo = $row.find(">.contain>.thermo");
          $thermo.find(".active").removeClass("active");
          $thermo.find(".fas").eq(dat.data.thermo).addClass("active");
          console.log(`dat.data.thermo:` + dat.data.thermo);
      
          // setStates
          var states = dat.data.multistates;
          var $states = $row.find(">.contain .data-wrapper");
          $states.attr("data-states", states);
          var classes =["","","",""];

          // debugger;
          // Remove states
          $states.find(".p1, .p2, .p3, .p4").removeClass("square-brackets parentheses checked");

         // Update states
         for(var i=0; i<4; i++) { 
            if(states[i].toLowerCase()==="s") 
               classes[i]="square-brackets"; 
            else if(states[i].toLowerCase()==="p") 
               classes[i]="parentheses"; 
               
            if(states[i]===states[i].toUpperCase()) 
               classes[i]+=" checked";  
         } // for

         $states.find(".p1").addClass(classes[0]);
         $states.find(".p2").addClass(classes[1]);
         $states.find(".p3").addClass(classes[2]);
         $states.find(".p4").addClass(classes[3]);

      }); // forEach

      waitForDom = setInterval( ()=> {
        if($(`[data-uid="${window.lastOpenedUid}"]`).length) {
          setTimeout(()=>{
            STARTING_MODE = true;
            scrollToUniqueId(window.lastOpenedUid, STARTING_MODE);
            console.log(`DOM rendered. Calling scrollToUniqueId("${window.lastOpenedUid}");`);
          }, 200); // timeout is necessary because it does not register if too early
          clearInterval(waitForDom);
        }
      }, 100);
  } // setDomFromJson

} // readDb

function scrollToUniqueId(uniqueId, startingMode) {
  /* Get the $row */
  if(uniqueId.length && uniqueId[0]==='+')
      uniqueId = uniqueId.substr(1);

  var selector = `[data-uid="${uniqueId}"]`;
  var $foundRow = $(selector);
  if($foundRow.length===0) return;

  toOpenUp_Exec($foundRow);
  if(!startingMode)
    toOpenUp_Highlight($foundRow);
  $foundRow[0].scrollIntoView();
} // scrollToUniqueId

function scrollToText(partial) {
  var $foundRow = $(`li:contains(${partial})`);
  $foundRow.each( (i,row)=> {
      var $row = $(row)
      toOpenUp_Exec($row);
      toOpenUp_Highlight($row);
      $row[0].scrollIntoView();
  });
} // scrollToText

function scrollToNonoverridden(partial) {
  partial = partial.toLowerCase();
  if(partial.length===0) return;

  if(partial[0]==='+') partial = partial.substr(1);
  var $foundRow = $(".name[data-folder-name]").filter((i, el) => 
    $(el).attr("data-folder-name").toLowerCase().indexOf(partial)>=0
  );
  $foundRow = $foundRow.map( (i, el) => $(el).closest("li") );

  // console.log("found", $foundRow);
  // var $foundRow = $(`.name[data-folder-name^=main]`);

  $foundRow.each( (i,row)=> {
      var $row = $(row)
      toOpenUp_Exec($row);
      toOpenUp_Highlight($row);
      $row[0].scrollIntoView();
  });
} // scrollToText

var toOpenUp = [];
function toOpenUp_Exec($row) {
  // console.log($row);

  toOpenUp = [];
  toOpenUp.unshift($row);

  // closest looks on itself and ancestors
  while($row.parent().closest("li").length) {
      $row = $row.parent().closest("li");
      toOpenUp.unshift($row);
  }

  toOpenUp.forEach((li)=> { 
      var $li = $(li),
          isCollapsed = $li.children(".contain").css("display")==="none";
      if(isCollapsed) {
          $li.children(".contain, ul",).toggle("active");
      }
      // debugger;
  }); // 1st li is outermost
}

function toOpenUp_Highlight($row) {
  $row.css("border", "1px solid black");
  $row.css("border-radius", "3px");
  // $row.css("padding", "1px");
  $row.on("hover", () => {
      $row.css("border", "none");
      $row.css("border-radius", "none");
      // $row.css("padding", "0");
      $row.off("hover");
  });
}


$(()=>{
  //https://gist.github.com/arunprasadr/9662545
  
  var $ul = $("<ul>");
  for(var i=0; i<folders.length; i++) {
    var item = folders[i];
    var func = (item, $ul)=> {
      var $newLi = objToHtml(item);
      // console.log(`var $newLi = objToHtml(item);`);
      // debugger;
      var $newUl = $("<ul>");
      if(item.next && item.next.length) {
        for(var j=0; j<item.next.length; j++) {
          func(item.next[j], $newUl);
        }
      } else {
        $newLi.addClass("empty");
      }
      $newLi.append($newUl)
      $ul.append($newLi);
    }
    func(item, $ul);
  }
  $ul.appendTo("#target");
  
  // Open up accordions initially
  $(".accordion").each((i, li) => {
    // debugger;
    var $this = $(li);
    $this.children(".contain, ul").toggle("active");
    // $this.addClass("minus");
  });
  
  // Accordion onclicks
  $(".name").on("click", (event)=> {
    var $name = $(event.target);
    var uid = $name.closest("li").attr("data-uid");
    window.lastOpenedUid = uid;
    console.log(`Clicked uid/name: ${uid}/${$name[0].innerText}`);
  
    // Expanding/collapsing
    $li = $name.closest("li.accordion");
    $li.children(".contain, ul").toggle("active");
    $name.toggleClass("minus");
    // $li.children(".name").toggleClass("minus");
  
    // Open command
    path = $li.attr("data-path");
    $("#open-command").val(`cd '${realpath}/${path}'`);

    // Update last opened tree part
    updateDb();
    
    event.preventDefault();
    event.stopPropagation();
  });
  
  setTimeout(()=> {
    //close tooltip if clicked outside
    $('body').on('click', function (e) {
      var $el = $(e.target);
        if ($el.data('toggle') !== 'tooltip' && $el.closest(".tooltip").length === 0) {
        $(".tooltip-inner").closest(".tooltip").prev().click();
        }
    });
    
    readDb(); // for thermometer and multistates
  
  }, 100)
  }); // on dom