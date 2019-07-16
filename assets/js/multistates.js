var Multistates = {
    holdingShift: undefined,
    getStates: ($el) => {
        if(typeof $el==="string") {
            console.error("You must pass a jQuery dom.");
            return false;
        }

        if(!$el.hasClass("data-wrapper")) {
            $el = $el.find(".data-wrapper").first();
            if($el.length===0) {
                console.error("The descendent or itself is not a multistate component.");
                return false;
            }
        }

        var $data = $el;
        return $data.attr("data-states");
    },
    setStates: ($el, states) => {
        if(typeof $el==="string") {
            console.error("You must pass a jQuery dom (first parameter).");
            return false;

        }

        if(typeof states!=="string" || states.length!=4) {
            console.error("You must pass a multistate string (second parameter). E.g. cccc");
            return false;
        }

        if(!$el.hasClass("data-wrapper")) {
            $el = $el.find(".data-wrapper").first();
            if($el.length===0) {
                console.error("The descendent or itself is not a multistate component.");
                return false;
            }
        }

        var $data = $el,
            $p = $data.find(".p1, .p2, .p3, .p4");

        $data.attr("data-states", states);
        $p.removeClass("square-brackets parentheses checked");

       // Update states
       for(var i=0; i<4; i++) { 
          // Character?
          if(states[i].toLowerCase()==="s") 
             $p.eq(i).addClass("square-brackets"); 
          else if(states[i].toLowerCase()==="p") 
            $p.eq(i).addClass("parentheses"); 
    
          // Checked?
          if(states[i]===states[i].toUpperCase()) 
            $p.eq(i).addClass("checked"); 
       } // for

    } // setStates
} // Multistates


$.fn.multistates = function(options) {
    var self = options;

    if(typeof Multistates.holdingShift==="undefined") {
        // alert("ran once");
        Multistates.holdingShift = false;
        
        $(document).keydown(function (e) {
            if (e.keyCode == 16) {
                Multistates.holdingShift = true;
            }
        });
        $(document).keyup(function (e) {
            if (e.keyCode == 16) {
                Multistates.holdingShift = false;
            }
    });
    }

    // Can initiate multiple DOMs if the query matches multiple DOM's
    return this.each( (i, el)=> {
        var options = self;
        if(typeof options==="undefined") options = {};
        var $el =  $(el);
        
        var options = $.extend(true, options, {
            // key: condition?... defaultValue
            $animatedDom: (typeof options.$animatedDom!=="undefined")?  options.$animatedDom: undefined,
            callback: (typeof options.callback!=="undefined")?  options.callback: undefined
        });

        // Main functionality
        var {$animatedDom, callback} = options;
        // debugger;
        var startTime, endTime, longpress;
        let $pAny = $el.find(".p1, .p2, .p3, .p4");

        function checkDelegator(event) {
            const $p = event?$(event.target):touch$p,
                  pNum = $p.index(),
                  $data = $p.closest(".data-wrapper");
        
            $p.toggleClass("checked");
        
            // Replace primary at ith position
            let oldPrimary = $data.attr("data-states"),
                newPrimary = oldPrimary.substr(0, pNum) + oldPrimary[pNum].toUpperCase() + oldPrimary.substr(pNum + 1);
            $data.attr("data-states", newPrimary);
        
            // Animate
            // debugger;
            if(typeof $animatedDom!=="undefined") {
                $animatedDom.removeClass("ministateAnimate");
                setTimeout(function() {
                    $animatedDom.addClass("ministateAnimate");
                }, 1);
            }
        } // checkDelegator

        $pAny.on("click contextmenu touchstart touchend mousedown mouseup", (event) => {
            event.stopPropagation();
            event.preventDefault();
        }); // prevent defaults

        if (/Mobi|Android/i.test(navigator.userAgent)) {
            $pAny.on('touchstart', function () {
                startTime = new Date().getTime();
            });

            $pAny.on('touchend', function () {
                endTime = new Date().getTime();
                //alert("Should accurate start and end times: " + startTime + ":" + endTime);
                longpress = (endTime - startTime > 200) ? true : false;
            });
        } else {
            $pAny.on('mousedown', function () {
                startTime = new Date().getTime();
            });

            $pAny.on('mouseup', function () {
                endTime = new Date().getTime();
                //alert("Should accurate start and end times: " + startTime + ":" + endTime);
                longpress = (endTime - startTime > 200) ? true : false;
            });
        } // OS dependent

        // ministate switching
        $pAny.on("contextmenu", (event)=>{
            checkDelegator(event);
            event.preventDefault();

            if(typeof callback!=="undefined") {
                callback.apply(this, arguments);
            }
        }) // on contextmenu
        
        // primary state switching
        .on("click", event => {
            const isLeftClick = (event.which===1);
            if( !isLeftClick ) return false;

            // If shift clicking, then treat as ministate switching
            if(Multistates.holdingShift) {
                checkDelegator(event);

                if(typeof callback!=="undefined") {
                    callback.apply(this, arguments);
                }

                return false;
            }

            else if( longpress ) {
                checkDelegator(event);
                event.preventDefault();

                if(typeof callback!=="undefined") {
                    callback.apply(this, arguments);
                }
                
            } else { // short press

                const $p = $(event.target),
                    pNum = $p.index(),
                    $data = $p.closest(".data-wrapper");

                if( $p.hasClass("parentheses") ) {
                    $p.removeClass("checked");
                    $p.removeClass("parentheses")
                    $p.addClass("square-brackets");

                    // Replace primary at ith position
                    let oldPrimary = $data.attr("data-states"),
                        newPrimary = oldPrimary.substr(0, pNum) + 's' + oldPrimary.substr(pNum + 1);
                    $data.attr("data-states", newPrimary);
                    event.preventDefault();

                } else if( $p.hasClass("square-brackets") ) {
                    $p.removeClass("checked");
                    $p.removeClass("parentheses");
                    $p.removeClass("square-brackets");

                    // Replace primary at ith position
                    let oldPrimary = $data.attr("data-states"),
                        newPrimary = oldPrimary.substr(0, pNum) + 'c' + oldPrimary.substr(pNum + 1);
                    $data.attr("data-states", newPrimary);
                    event.preventDefault();
                } else {
                    $p.removeClass("checked");
                    $p.addClass("parentheses");
                    $p.removeClass("square-brackets");

                    // Replace primary at ith position
                    let oldPrimary = $data.attr("data-states"),
                        newPrimary = oldPrimary.substr(0, pNum) + 'p' + oldPrimary.substr(pNum + 1);
                    $data.attr("data-states", newPrimary);
                    event.preventDefault();
                } // else


                if(typeof callback!=="undefined") {
                    callback.apply(this, arguments);
                }
            } // shortpress

        }); // on click

    }); // Dom returned
} // multistates plugin