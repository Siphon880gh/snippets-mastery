
$.fn.multistates = function(options) {
    var self = options;

    if(typeof window.multistates_holdingShift==="undefined") {
        // alert("ran once");
        window.multistates_holdingShift = false;
        
        $(document).keydown(function (e) {
            if (e.keyCode == 16) {
                window.multistates_holdingShift = true;
            }
        });
        $(document).keyup(function (e) {
            if (e.keyCode == 16) {
                window.multistates_holdingShift = false;
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
            if(window.multistates_holdingShift) {
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