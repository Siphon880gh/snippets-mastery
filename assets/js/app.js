
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
  
      if(titleOverridden && titleOverridden.length) { 
        $meta.find(".name").text(titleOverridden);
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
        $info.attr("title", `<u>${titleOverridden || item.current}</u>:<br/>${$dom.html()}`);
        $info.tooltip({placement:"bottom", html:true, delay:{show:50}});
        $contain.append($info);
      }

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
        if(ajaxed)
          $contain.prepend($summary);
        else
          $contain.append($summary);
      }
    
      if(gotos && gotos.length) {
        $meta.data("gotos", gotos);
        var $gotosBtn = $(`<span class="fas fa-chalkboard gotos-click"></span>`);
      
          $gotosBtn.on("click", (event)=>{
            for(var i=0; i<gotos.length; i++) {
              var url =gotos[i];
              var randomNum = Math.floor((Math.random() * 1000) + 1);
              if(url.length && url[0]===".") {
                var path = $meta.attr("data-path");
                url = path + url;
              }
              window.open(url, "window" + randomNum);
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
  
  
  $(()=>{
  //https://gist.github.com/arunprasadr/9662545
  
  var $ul = $("<ul>");
  // debugger;
  for(var i=0; i<folders.length; i++) {
    var item = folders[i];
    var func = (item, $ul)=> {
      var $newLi = objToHtml(item);
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
    var $this = $(event.target);
    $li = $this.closest("li.accordion");
    $this = $li;
    // if($this.find("ul *").length) {
      $this.children(".contain, ul").toggle("active");
      $li.find(".name").toggleClass("minus");
    // }
    event.preventDefault();
    event.stopPropagation();
  });
  
  setTimeout(()=> {
    readDb(); // for thermometer and multistates

    //close tooltip if clicked outside
    $('body').on('click', function (e) {
      var $el = $(e.target);
        if ($el.data('toggle') !== 'tooltip' && $el.closest(".tooltip").length === 0) {
        $(".tooltip-inner").closest(".tooltip").prev().click();
        }
    });
  }, 100)
  });
  
  function updateDb() {
    // alert("updateDb");
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
        var txt = JSON.stringify(arr);
        // debugger;
    
        $.ajax({
                method:"POST", 
                url:"settings/write.php", 
                data: {
                    txt: txt
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

    function setDomFromJson(txt) {
        console.log("Reading Db");
        var arr = JSON.parse(txt);
        arr.forEach((dat) => {
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
    } // setDomFromJson
 
} // readDb

function scrollToUniqueId(uniqueId) {
    /* Get the $row */
    if(uniqueId.length && uniqueId[0]==='+')
        uniqueId = uniqueId.substr(1);

    var selector = `[data-uid="${uniqueId}"]`;
    var $foundRow = $(selector);

    toOpenUp_Exec($foundRow);
    toOpenUp_Highlight($foundRow);
    $foundRow[0].scrollIntoView();

    // Animated what's scrolled to?
    // $animatedDom = $foundRow;
    // setTimeout( ()=> {
    //     if(typeof $animatedDom!=="undefined") {
    //         $animatedDom.removeClass("ministateAnimate");
    //         $animatedDom.addClass("ministateAnimate");
    //         setTimeout(function() {
    //             $animatedDom.removeClass("ministateAnimate");
    //         }, 200);
    //     }
    // }, 500);
}

function scrollToSearch(partial) {
    var $foundRow = $(`li:contains(${partial})`);
    $foundRow.each( (i,row)=> {
        var $row = $(row)
        toOpenUp_Exec($row);
        toOpenUp_Highlight($row);
        $row[0].scrollIntoView();
    });
}

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
