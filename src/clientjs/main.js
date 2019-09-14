/**
 * Created by whyask37 on 2017. 1. 19..
 */

"use strict";

function isKakaoTalkBrowser () {
    return (navigator.userAgent || '').toUpperCase().indexOf('KAKAOTALK') != -1;
}

function isIE () {
    var agent = navigator.userAgent.toLowerCase();
    return (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1);
}

if (isIE()) {
    alert("Internet explorer는 지원되지 않습니다. 다른 브라우저를 써주세요.");
    location.href = 'about:blank;';
    throw new Error('fuck');
}

if (isKakaoTalkBrowser()) {
    alert("카카오톡 브라우저에서 플레이하던 중 채팅으로 되돌아가면 게임에서 나가질 수 있습니다. 새로운 브라우저 창에서 게임을 실행해주세요.", 15000);
}


require('./formIssuer');
require('./roomjoin');
require('./game/conn');
require('./logViewer');

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

// On material select
$(document).ready(function() {
    $('select').material_select();
});
