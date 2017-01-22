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
$(document).bind('touchend', function(e) {
    e.preventDefault();
    // Add your code here.
});
