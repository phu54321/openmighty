!function(e){function r(a){if(n[a])return n[a].exports;var t=n[a]={exports:{},id:a,loaded:!1};return e[a].call(t.exports,t,t.exports,r),t.loaded=!0,t.exports}var n={};return r.m=e,r.c=n,r.p="",r(0)}([function(e,r,n){"use strict";n(1),n(2),n(3),$(function(){$("#jokerCall").modal("open")}),$(document).on("click","#toast-container .toast",function(){$(this).fadeOut(function(){$(this).remove()})});var a=0;$(document).bind("touchstart",function(e){var r=+new Date;a+500>r&&e.preventDefault(),a=r}),$(document).ready(function(){$("select").material_select()})},function(e,r){"use strict";function n(e){return!0}function a(e){return""!==e}function t(e,r,a,t){var s=$("#"+r),o={};if(!s)return console.log("Unknown form '"+r+"'"),!1;for(var d=0;d<a.length;d++){var c=i(a[d],4),u=c[0],l=c[1],p=c[2],f=c[3];if(p||(p=n),f||(f="허용되지 않은 입력입니다."),o[l]=s.find("#"+u).val(),!p(o[l]))return window.alert(f),!1}return s.find("input, textarea").prop("disabled",!0),$.ajax({type:"POST",url:e,data:o,dataType:"json",success:function(e){e.error?(s.find("input, textarea").prop("disabled",!1),window.alert(e.error)):t(e)},error:function(e,r,n){console.log(r,"message : "+e.responseText+"\nerror : "+n)}}),!0}var i=function(){function e(e,r){var n=[],a=!0,t=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(a=(s=o.next()).done)&&(n.push(s.value),!r||n.length!==r);a=!0);}catch(e){t=!0,i=e}finally{try{!a&&o.return&&o.return()}finally{if(t)throw i}}return n}return function(r,n){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();window.issueLogin=function(){t("/users/login","loginForm",[["username","username",a,"아이디를 입력하세요."],["password","password",a,"패스워드를 입력하세요."]],function(){window.location.reload(!0)})},window.issueRegister=function(){t("/users/join","registerForm",[["username","username",a,"아이디를 입력하세요."],["password","password",a,"패스워드를 입력하세요."],["email","email",a,"이메일을 입력하세요."]],function(){window.location.href="/"})},window.issueLogout=function(){$.ajax({type:"POST",url:"/users/logout",success:function(e){window.location.reload(!0)},error:function(e,r,n){console.log(r,"message : "+e.responseText+"\nerror : "+n)}})}},function(e,r){"use strict";$(function(){function e(e){for(var r="",n="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",a=0;a<e;a++)r+=n.charAt(Math.floor(Math.random()*n.length));return r}$("#roomURL").attr("pattern","^"+location.origin+"/[a-zA-Z0-9]{8}|$"),$("#joinRoom").submit(function(r){var n=$("#roomURL"),a=n.val();if(""===a){var t=e(8);a=window.location.origin+"/"+t,n.val(a)}window.location.href=a,r.preventDefault()})})},function(e,r,n){"use strict";function a(){c=i(),c.on("err",function(e){t.toast(e,3e3)}),c.on("info",function(e){}),c.on("cmd",function(e){var r=s.decompressCommand(e);console.log(e,r),o.translateCmdMessage(r)}),c.on("reconnect",function(){}),c.on("disconnect",function(){})}var t=window.Materialize,i=window.io,s=n(4),o=n(10),d=n(18),c=void 0,u=$("#gameDiv");0!==u.length&&u.ready(function(){t.toast("로딩중",1500),d(a)}),r.sendCmd=function(e,r){var n=Object.assign({},r||{});return n.type=e,c.emit("cmd",s.compressCommand(n)),!0},window.sendCmd=r.sendCmd},function(e,r,n){"use strict";function a(e){if(Array.isArray(e))return 0===e.length?[]:void 0!==e[0].cardEnvID?["*"].concat(e.map(function(e){return e.cardEnvID})):e.map(a);if("object"!=("undefined"==typeof e?"undefined":i(e)))return e;var r=function(){var r={};return Object.keys(e).forEach(function(n){void 0===e[n]||(null===e[n]?r[n]=null:void 0!==e[n].cardEnvID?r["*"+n]=e[n].cardEnvID:r[n]=a(e[n]))}),{v:r}}();return"object"===("undefined"==typeof r?"undefined":i(r))?r.v:void 0}function t(e){if(Array.isArray(e))return 0===e.length?[]:"*"==e[0]?e.slice(1).map(d.decodeCard):e.map(t);if("object"!=("undefined"==typeof e?"undefined":i(e)))return e;var r=function(){var r={};return Object.keys(e).forEach(function(n){"*"==n[0]?r[n.substr(1)]=d.decodeCard(e[n]):r[n]=t(e[n])}),{v:r}}();return"object"===("undefined"==typeof r?"undefined":i(r))?r.v:void 0}var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s={},o={},d=n(5);r.compressCommand=function(e){if("string"==typeof e)return e;var r=s[e.type];return r?r(e):a(e)},r.decompressCommand=function(e){if("string"!=typeof e)return t(e);var r=o[e[0]];return r?r(e)||e:t(e)},r.registerCompressor=function(e){var r=e.type,n=e.shead,a=e.cmpf,t=e.dcmpf,i=e.keys;if(s[r]||o[n])throw new Error("Duplicate compressor "+r+" "+n);a||t||!i||(a=d.createJsonCompressor(n,i),t=d.createJsonDecompressor(r,i)),s[r]=a,o[n]=t},n(6),n(7),n(8),n(9)},function(e,r){"use strict";function n(e){return{shape:a[e/13|0],num:52==e?0:e%13+2,cardEnvID:e}}var a=["spade","heart","clover","diamond","joker"];r.decodeCard=n;var t={C:{enc:function(e){return e.cardEnvID},dec:function(e){return n(e)}},I:{enc:function(e){return e},dec:function(e){return 0|e}},B:{enc:function(e){return 0|e},dec:Boolean}};r.createJsonCompressor=function(e,r){return function(n){var a=[];return r.forEach(function(e){var r=t[e[0]];r?a.push(r.enc(n[e.substring(1)])):a.push(n[e])}),e+a.join(";")}},r.createJsonDecompressor=function(e,r){return function(n){var a=n.substr(1).split(";"),i={type:e},s=0;return r.forEach(function(e){var r=t[e[0]];r?i[e.substring(1)]=r.dec(a[s]):i[e]=a[s],s++}),i}}},function(e,r,n){"use strict";var a=n(4);n(5);a.registerCompressor({type:"rjoin",shead:"j",keys:["username","useridf"]}),a.registerCompressor({type:"rusers",shead:"u",cmpf:function(e){var r=["u",e.owner];return r.push(e.youridf),e.users.forEach(function(e){r.push(e.username),r.push(e.useridf)}),r.join(";")},dcmpf:function(e){for(var r=e.split(";"),n=[],a=3;a<r.length;a+=2)n.push({username:r[a],useridf:r[a+1]});return{type:"rusers",owner:0|r[1],youridf:r[2],users:n}}}),a.registerCompressor({type:"rleft",shead:"l",keys:["useridf","Iowner"]})},function(e,r,n){"use strict";var a=n(4),t=n(5);a.registerCompressor({type:"gusers",shead:"U",cmpf:function(e){var r=["U"];return e.users.forEach(function(e){r.push(e.username),r.push(e.useridf)}),r.join(";")},dcmpf:function(e){for(var r=e.split(";"),n=[],a=1;a<r.length;a+=2)n.push({username:r[a],useridf:r[a+1]});return{type:"gusers",users:n}}}),a.registerCompressor({type:"deck",shead:"D",cmpf:function(e){var r=["D"];return e.deck.forEach(function(e){r.push(e.cardEnvID)}),r.join(";")},dcmpf:function(e){var r=e.split(";"),n=r.slice(1).map(t.decodeCard);return{type:"deck",deck:n}}})},function(e,r,n){"use strict";var a=n(4);n(5);a.registerCompressor({type:"pcp",shead:"C",keys:["Iplayer","Ccard","Bjcall"]}),a.registerCompressor({type:"tend",shead:"T",keys:["winner"]})},function(e,r,n){"use strict";var a=n(4);n(5);a.registerCompressor({type:"binfo",shead:"B",keys:["Ipresident","shape","num"]}),a.registerCompressor({type:"pbinfo",shead:"p",keys:["bidder","bidShape","bidCount"]})},function(e,r,n){"use strict";var a={},t=window.Materialize,i=(n(11),n(13));r.translateCmdMessage=function(e){a[e.type]?a[e.type](e):t.toast("Unknown command message type : "+e.type,4e3)},n(14)(a),n(15)(a),n(16)(a),n(17)(a),a.gabort=function(e){var r=e.msg||"게임이 중간에 종료되었습니다.";t.toast(r,3e3),i.playing=!1,i.viewRoom(),$("#title").text("openMighty")}},function(e,r,n){"use strict";var a={},t=n(12);r=e.exports=a,r.viewDeck=function(){var e=$("#gameDiv .deck");e.empty();for(var r=0;r<a.deck.length;r++){var n=a.deck[r],i=[n.shape,n.num],s=i[0],o=i[1],d=t(null,"deck-card"),c=s[0]+o;d.find(".game-card").attr("card",c).addClass("game-card-"+c).addClass("game-card-shape-"+s[0]),e.append(d)}},r.shapeAbbrTable={spade:"♠",heart:"♥",diamond:"♦",clover:"♣",none:"N"},r.shapeStringTable={spade:"스페이드",heart:"하트",diamond:"다이아몬드",clover:"클로버",none:"노기루다"},r.numStringTable=[void 0,void 0,"2","3","4","5","6","7","8","9","10","J","Q","K","A"]},function(e,r){"use strict";var n=function(){function e(e,r){var n=[],a=!0,t=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(a=(s=o.next()).done)&&(n.push(s.value),!r||n.length!==r);a=!0);}catch(e){t=!0,i=e}finally{try{!a&&o.return&&o.return()}finally{if(t)throw i}}return n}return function(r,n){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),a=window.Materialize,t=["text","val","submit","click","remove","empty","addClass","removeClass"," toggleClass"],i=["disabled"],s=void 0;$(function(){s=$("#game-template"),s.detach()}),e.exports=function(e,r,o){function d(e){var r=n(e,2),a=r[0],s=r[1];t.indexOf(a)!=-1?u[a](s):i.indexOf(a)!=-1?u.prop(a,s):u.attr(a,s)}var c=s.find("#template-"+r).clone().removeAttr("id"),u=void 0;if(o)for(var l=0;l<o.length;l++){var p=n(o[l],2),f=p[0],m=p[1];u=f?c.find(f):c,1==u.length?Array.isArray(m[0])?m.forEach(d):(null!==m&&"string"!=typeof m||(m=[o[l][1],o[l][2]]),d(m)):(a.toast("Invalid selector : "+f,4e3),console.log("Invalid selector",o[l]))}return e&&(e.empty(),e.append(c)),$("select").material_select(),c},e.exports.getTemplate=function(e){return s.find("#template-"+e)}},function(e,r,n){"use strict";function a(){var e=$(".player-self").find(".game-card-container");o(e,"button").focus(),e.find("button").click(function(e){s.sendCmd("start"),$(".player-has").empty(),e.preventDefault()})}var t=n(11),i={playing:!1,myidf:null,owner:0,users:[]},s=n(3),o=n(12);r=e.exports=i,r.viewRoom=function(){var e=void 0,r=void 0,n=void 0;i.playing?(r=-1,e=t.gameUsers,n=t.president):(r=i.owner,e=i.users,n=-1);var s=$(".player-slot");s.removeClass("player-empty player-owner player-president player-self player-ai player-leading");var o=null;s.find(".player-has").empty(),$(".last-trick").empty();for(var d=0;d<e.length;d++){var c=$(s[d]),u=e[d];c.find(".player-name").text(u.username),c.find(".game-card-container").empty(),r===d&&c.addClass("player-owner"),n===d&&c.addClass("player-president"),u.useridf==i.myidf&&(c.addClass("player-self"),o=d)}for(var l=e.length;l<5;l++){var p=$(s[l]);p.addClass("player-empty"),p.find(".player-name").text("Empty"),p.find(".game-card-container").empty()}i.playing?t.selfIndex=o:r===o&&a()}},function(e,r,n){"use strict";var a=n(13),t=n(11),i=window.Materialize;e.exports=function(e){e.rjoin=function(e){i.toast(e.username+"님이 입장하셨습니다.",2e3),a.users.push({username:e.username,useridf:e.useridf}),a.viewRoom()},e.rleft=function(e){for(var r=a.users,n=0;n<r.length;n++){var s=r[n];if(s.useridf==e.useridf){a.playing?i.toast(s.username+"님이 탈주하셨습니다.",2e3):i.toast(s.username+"님이 퇴장하셨습니다.",2e3),r.splice(n,1);break}}if(a.owner=e.owner,a.playing){for(var o=t.gameUsers,d=0;d<o.length;d++)if(o[d].useridf==e.useridf){$($(".player-slot")[d]).addClass("player-ai");break}}else a.viewRoom()},e.rusers=function(e){a.owner=e.owner,a.users=e.users,a.myidf=e.youridf,a.viewRoom()}}},function(e,r,n){"use strict";var a=window.Materialize,t=n(12),i=n(11),s=n(13),o=n(3);e.exports=function(e){function r(e){if(!e.canDealMiss)return!1;var r=e.deck,n=0;return r.forEach(function(e){"spade"==e.shape&&14==e.num?n-=1:10==e.num?n+=.5:e.num>=11&&(n+=1)}),n<=1}e.gusers=function(e){i.gameUsers=e.users,i.president=-1,i.remainingBidder=5,i.lastBidder=null,i.bidCount=null,i.bidShape=null,i.canDealMiss=!0,s.playing=!0,s.viewRoom()},e.deck=function(e){i.deck=e.deck,i.viewDeck()},e.pbinfo=function(e){var r=$($(".player-slot .game-card-container")[e.bidder]);e.bidder==i.selfIndex&&(i.canDealMiss=!1),"pass"!=e.bidShape&&(i.bidShape=e.bidShape,i.bidCount=e.bidCount,i.lastBidder=e.bidder),r.find(".game-card").remove();var n=$("<div/>").addClass("game-card player-card-bidding");"pass"==e.bidShape?(n.text("pass"),i.remainingBidder--):n.text(e.bidShape+" "+e.bidCount),r.append(n),1==i.remainingBidder&&null!==i.lastBidder&&(i.lastBidder!=i.selfIndex&&a.toast("공약이 끝났습니다. 기다려주세요",1500),i.president=i.lastBidder)},e.bidrq=function(){var e=i.bidCount||13;"none"==i.bidShape&&e++;var n=$(".player-self .game-card-container"),a=t(n,"bidding");r(i)&&a.find("select[name=bidShape]").prepend($("<option/>").text("딜미스").val("dealmiss")).val("dealmiss"),a.attr("id","bidForm"),a.find('input[name="bidCount"]').attr("min",e).val(e),a.submit(function(){var e=$("#bidForm"),r=e.find('*[name="bidShape"]').val(),n=e.find('*[name="bidCount"]').val();return o.sendCmd("bid",{shape:r,num:parseInt(n)}),!1})},e.bc1rq=function(){a.toast("공약을 수정해주세요.",1500);var e=i.bidShape,r=i.bidCount,n=$(".player-self .game-card-container");t(n,"bidding",[[null,["id","bidChangeForm"]],[".player-form-title",["text","현재 : "+i.shapeAbbrTable[e]+r]],['input[name="bidCount"]',[["min",r],["val",r]]],['option[value="'+e+'"]',["remove"]],['option[value="pass"]',[["val",e],["text","그대로 ("+i.shapeStringTable[e]+")"]]],[null,["submit",function(){var e=$("#bidChangeForm"),r=e.find('*[name="bidShape"]').val(),n=e.find('*[name="bidCount"]').val();return r==i.bidShape&&n==i.bidCount&&(r="pass"),o.sendCmd("bc1",{shape:r,num:parseInt(n)}),!1}]]]).focus()},e.binfo=function(e){$(".player-slot .game-card-container").empty();var r=i.shapeStringTable[e.shape]+" "+e.num;a.toast("공약 : "+r,1500),$("#title").text("openMighty - "+r),i.bidShape=e.shape,i.bidCount=e.num,i.president=e.president,$($(".player-slot")[i.president]).addClass("player-leading player-president")}}},function(e,r,n){"use strict";var a=window.Materialize,t=window._,i=n(12),s=(n(13),n(11)),o=n(3),d=n(17);e.exports=function(e){function r(e){return{mighty:{shape:"spade"==e?"diamond":"spade",num:14},joker:{shape:"joker",num:0},girudaA:{shape:e,num:14},girudaK:{shape:e,num:13},girudaQ:{shape:e,num:12},girudaJ:{shape:e,num:11},card_sA:{shape:"spade",num:14},card_sK:{shape:"spade",num:13},card_hA:{shape:"heart",num:14},card_hK:{shape:"heart",num:13},card_dA:{shape:"diamond",num:14},card_dK:{shape:"diamond",num:13},card_cA:{shape:"clover",num:14},card_cK:{shape:"clover",num:13}}}function n(e,n,a){var t=r(e);if(t[n]){var i=t[n];return a.ftype="card",a.shape=i.shape,a.num=i.num,!0}return"first"==n?(a.ftype="first",!0):"player"==n.substr(0,6)?(a.ftype="player",a.friend=parseInt(n.substr(7))-1,!0):"none"==n&&(a.ftype="none",!0)}function c(e,n){var a=r(e);if("card"==n.ftype){var o=null;return t.keys(a).some(function(e){var r=a[e];if(r.shape==n.args.shape&&r.num==n.args.num)return o=e,!0}),o?i.getTemplate("fselect").find('option[value="'+o+'"]').text()+" 프렌드":s.shapeStringTable[n.args.shape]+" "+s.numStringTable[n.args.num]+" 프렌드"}return"first"==n.ftype?"선구 프렌드":"none"==n.ftype?"노프렌드":"player"==n.ftype?($($(".player-slot")[n.args]).addClass("player-leading"),s.gameUsers[n.args].username+" 프렌드"):"알수없는 프렌드 - "+String(n.ftype)}e.fsrq=function(){a.toast("카드 3장을 버리고 프렌드를 선정하세요",1500),$(".deck-card").click(function(){$(this).toggleClass("deck-card-selected")});var e=s.bidCount,r=s.bidShape,t=$(".player-self .game-card-container"),d=i(t,"fselect",[[null,["id","friendSelectForm"]],["option[value="+r+"]",["remove"]],['input[name="bidCount"]',[["min",e],["val",e]]],['option[value="pass"]',["val",r]]]);d.submit(function(){for(var e={},r=$("#friendSelectForm"),t=$("#gameDiv .deck .deck-card").toArray(),i=[],d=0;d<t.length;d++)$(t[d]).hasClass("deck-card-selected")&&i.push(d);if(3!=i.length)return a.toast("3장을 골라주세요.",1500),!1;e.discards=i;var c=r.find('*[name="bidShape"]').val(),u=r.find('*[name="bidCount"]').val();c==s.bidShape&&u==s.bidCount||(e.bidch2={shape:c,num:parseInt(u)});var l=r.find("select[name=friendType]").val();return n(c,l,e)?(o.sendCmd("fs",e),!1):(a.toast("프렌드를 선정해주세요.",1500),!1)})},e.fs=function(e){var r=c(s.bidShape,e);a.toast(r,2e3),s.ftype=e.ftype,s.fargs=e.args;var n=$("#title");n.text(n.text()+" - "+r),d.initGame()}}},function(e,r,n){"use strict";function a(){t(),c.trick++}function t(){$("#gameDiv .deck-card").removeClass("deck-card-selected").unbind("click")}function i(){c.trick=0,c.starter=c.president,a()}function s(e){var r=e.attr("card"),n={s:"spade",h:"heart",c:"clover",d:"diamond",j:"joker"}[r[0]],a=parseInt(r.substr(1));return{shape:n,num:a}}var o=window.Materialize,d=n(12),c=n(11),u=n(13),l=n(3);r=e.exports=function(e){function r(e){var r=$("#gameDiv .deck"),n=r.find(".game-card-j0"),a=r.find("spade"==c.bidShape?".game-card-d14":".game-card-s14");if(n.parents(".deck-card").addClass("deck-card-selectable"),a.parents(".deck-card").addClass("deck-card-selectable"),console.log(c.trick,c.deck),1==c.trick&&c.president==c.selfIndex){var t=void 0;for(t=0;t<10&&c.deck[t].shape==c.bidShape;t++);if(10!=t)return $(".deck-card").addClass("deck-card-selectable"),void $(".deck-card .game-card-shape-"+c.bidShape[0]).parents(".deck-card").removeClass("deck-card-selectable")}if(e.jcall){if(0!==n.length)return}else if(e.shaperq){var i=r.find(".game-card-shape-"+e.shaperq[0]);if(0!==i.length)return void i.parents(".deck-card").addClass("deck-card-selectable")}$(".deck-card").addClass("deck-card-selectable")}function n(e){if("joker"==e.shape)return $("<div/>").addClass("has-slot has-joker").text("Joker");var r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"][e.num-2];return $("<div/>").addClass("has-slot").addClass("has-"+e.shape).text(r)}e.cprq=function(e){o.toast("카드를 내주세요.",1500);var n=$(".player-self .game-card-container");d(n,"button",[["button",[["text","카드 내기"],["disabled",!0]]]]),r(e);var a=$(".deck-card-selectable");a.click(function(){$(".deck-card").removeClass("deck-card-selected"),$(this).addClass("deck-card-selected"),n.find("button").prop("disabled",!1)}),a.dblclick(function(){n.find("button").click()}),n.find("button").click(function(){var e=$(".deck-card-selected");1!=e.length&&o.toast("카드를 선택해주세요.",1500);var r=s(e.find(".game-card"));if(1!=c.trick&&3==r.num&&c.starter==c.selfIndex&&("clover"==c.bidShape&&"spade"==r.shape||"clover"!=c.bidShape&&"clover"==r.shape)){var n=$("#jokerCallModal");n.find("button[name=no]").click(function(){l.sendCmd("cp",{cardIdx:e.index(".deck-card")})}),n.find("button[name=yes]").click(function(){l.sendCmd("cp",{cardIdx:e.index(".deck-card"),jcall:!0})}),n.modal({dismissible:!1}),n.modal("open")}else"joker"==r.shape&&c.starter==c.selfIndex?!function(){var r=$("#jokerModal"),n=r.find("select[name=srq]");n.val("none"),r.modal({dismissible:!1}),r.find("button").click(function(){var r=n.val();"none"==r&&(r=void 0),l.sendCmd("cp",{cardIdx:e.index(".deck-card"),srq:r})}),r.modal("open")}():l.sendCmd("cp",{cardIdx:e.index(".deck-card")})})},e.jrq=function(e){var r=e.shaperq;o.toast("조커로 "+c.shapeStringTable[r]+"를 불렀습니다.",2e3)},e.pcp=function(e){var r=e.card,n=$($(".player-slot")[e.player]);"card"==c.ftype&&c.fargs.shape==r.shape&&c.fargs.num==r.num&&n.addClass("player-leading");var a=n.find(".game-card-container"),i=r.shape[0]+r.num;d(a,"game-card",[[null,[["addClass","game-card-"+i],["card",i]]]]),t()},e.tend=function(e){var r=$($(".player-has")[e.winner]),t=$(".player-slot .game-card"),i=$(".last-trick");i.empty(),t.each(function(){var e=s($(this));i.append(n(e)),e.num>=10&&r.append(n(e))}),"first"==c.ftype&&c.president!=e.winner&&2!=$(".player-leading").length&&c.trick<=4&&$($(".player-slot")[e.winner]).addClass("player-leading"),t.fadeOut(1e3),c.starter=e.winner,a()},e.gend=function(e){var r=c.bidCount,n=20-e.oppcc,a=void 0;e.setUser?!function(){a=$("#gameEndWithSetModal"),a.find(".set").text("게임 결과 - 셋 ("+c.gameUsers[e.setUser].username+")");var r=a.find(".deck");r.empty(),e.setDeck.forEach(function(e){var n=[e.shape,e.num],a=n[0],t=n[1],i=d(null,"deck-card"),s=a[0]+t;i.find(".game-card").attr("card",s).addClass("game-card-"+s).addClass("game-card-shape-"+a[0]),r.append(i)})}():a=$("#gameEndModal");var t=a.find(".modal-content p.score");n>=r?t.text("["+n+"/"+r+"] 여당 승리입니다."):t.text("["+n+"/"+r+"] 야당 승리입니다."),u.playing=!1,a.modal({dismissible:!0,complete:function(){u.playing||(u.viewRoom(),$("#title").text("openMighty"))}}),a.modal("open")}},r.issueTrickStart=a,r.initGame=i},function(e,r){"use strict";var n=function(){function e(e,r){var n=[],a=!0,t=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(a=(s=o.next()).done)&&(n.push(s.value),!r||n.length!==r);a=!0);}catch(e){t=!0,i=e}finally{try{!a&&o.return&&o.return()}finally{if(t)throw i}}return n}return function(r,n){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();e.exports=function(e){function r(){var r=129,i=185,s=document.createElement("canvas");s.width=r,s.height=i;var o=s.getContext("2d"),d=[];t.forEach(function(e){var t=n(e,3),c=t[0],u=t[1],l=t[2];o.drawImage(a,u,l,r,i,0,0,r,i);var p=s.toDataURL();d.push(".game-card-"+c+" {  background-image: url("+p+");}")}),$("<style>").prop("type","text/css").html(d.join("")).appendTo("head"),e&&e()}var a=new Image;a.onload=r,a.src="/images/cards/sprite.png";var t=[["c10",129,0],["c11",774,370],["c12",258,0],["c13",0,185],["c14",129,185],["c2",258,185],["c3",387,0],["c4",387,185],["c5",516,0],["c6",516,185],["c7",0,370],["c8",129,370],["c9",258,370],["d10",387,370],["d11",516,370],["d12",645,0],["d13",645,185],["d14",645,370],["d2",0,555],["d3",129,555],["d4",258,555],["d5",387,555],["d6",516,555],["d7",645,555],["d8",774,0],["d9",774,185],["h10",0,0],["h11",774,555],["h12",903,0],["h13",903,185],["h14",903,370],["h2",903,555],["h3",0,740],["h4",129,740],["h5",258,740],["h6",387,740],["h7",516,740],["h8",645,740],["h9",774,740],["j0",903,740],["s10",1032,0],["s11",1032,185],["s12",1032,370],["s13",1032,555],["s14",1032,740],["s2",0,925],["s3",129,925],["s4",258,925],["s5",387,925],["s6",516,925],["s7",645,925],["s8",774,925],["s9",903,925]]}}]);