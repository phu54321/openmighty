/**
 * Created by whyask37 on 2017. 1. 19..
 */

"use strict";

require('./formIssuer');
require('./roomjoin');
require('./game/conn');

$(function() {
    $('#jokerCall').modal('open');
});

// Toast should disappear on click
$(document).on('click', '#toast-container .toast', function() {
    $(this).fadeOut(function(){
        $(this).remove();
    });
});

// Disable double tap
let doubleTouchStartTimestamp = 0;
$(document).bind("touchstart", function (event) {
    const now = +(new Date());
    if (doubleTouchStartTimestamp + 500 > now) {
        event.preventDefault();
    }
    doubleTouchStartTimestamp = now;
});

