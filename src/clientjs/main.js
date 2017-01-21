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

// Toast should disappear
$(document).on('click', '#toast-container .toast', function() {
    $(this).fadeOut(function(){
        $(this).remove();
    });
});
