!function(e){function a(r){if(n[r])return n[r].exports;var t=n[r]={exports:{},id:r,loaded:!1};return e[r].call(t.exports,t,t.exports,a),t.loaded=!0,t.exports}var n={};return a.m=e,a.c=n,a.p="",a(0)}([function(e,a,n){"use strict";n(1),n(2),n(3),$(function(){$("#jokerCall").modal("open")}),$(document).on("click","#toast-container .toast",function(){$(this).fadeOut(function(){$(this).remove()})});var r=0;$(document).bind("touchstart",function(e){var a=+new Date;r+500>a&&e.preventDefault(),r=a}),$(document).ready(function(){$("select").material_select()})},function(e,a){"use strict";function n(e){return!0}function r(e){return""!==e}function t(e,a,r,t){var s=$("#"+a),d={};if(!s)return console.log("Unknown form '"+a+"'"),!1;for(var o=0;o<r.length;o++){var c=i(r[o],4),l=c[0],u=c[1],p=c[2],f=c[3];if(p||(p=n),f||(f="허용되지 않은 입력입니다."),d[u]=s.find("#"+l).val(),!p(d[u]))return window.alert(f),!1}return s.find("input, textarea").prop("disabled",!0),$.ajax({type:"POST",url:e,data:d,dataType:"json",success:function(e){e.error?(s.find("input, textarea").prop("disabled",!1),window.alert(e.error)):t(e)},error:function(e,a,n){console.log(a,"message : "+e.responseText+"\nerror : "+n)}}),!0}var i=function(){function e(e,a){var n=[],r=!0,t=!1,i=void 0;try{for(var s,d=e[Symbol.iterator]();!(r=(s=d.next()).done)&&(n.push(s.value),!a||n.length!==a);r=!0);}catch(e){t=!0,i=e}finally{try{!r&&d.return&&d.return()}finally{if(t)throw i}}return n}return function(a,n){if(Array.isArray(a))return a;if(Symbol.iterator in Object(a))return e(a,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();window.issueLogin=function(){t("/users/login","loginForm",[["username","username",r,"아이디를 입력하세요."],["password","password",r,"패스워드를 입력하세요."]],function(){window.location.reload(!0)})},window.issueRegister=function(){t("/users/join","registerForm",[["username","username",r,"아이디를 입력하세요."],["password","password",r,"패스워드를 입력하세요."],["email","email",r,"이메일을 입력하세요."]],function(){window.location.href="/"})},window.issueLogout=function(){$.ajax({type:"POST",url:"/users/logout",success:function(e){window.location.reload(!0)},error:function(e,a,n){console.log(a,"message : "+e.responseText+"\nerror : "+n)}})}},function(e,a){"use strict";$(function(){function e(e){for(var a="",n="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",r=0;r<e;r++)a+=n.charAt(Math.floor(Math.random()*n.length));return a}$("#roomURL").attr("pattern","^"+location.origin+"/[a-zA-Z0-9]{8}|$"),$("#joinRoom").submit(function(a){var n=$("#roomURL"),r=n.val();if(""===r){var t=e(8);r=window.location.origin+"/"+t,n.val(r)}window.location.href=r,a.preventDefault()})})},function(e,a,n){"use strict";function r(){c=i(),c.on("err",function(e){t.toast(e,3e3)}),c.on("info",function(e){}),c.on("cmd",function(e){e=s.decompressCommand(e),d.translateCmdMessage(e)}),c.on("reconnect",function(){}),c.on("disconnect",function(){})}var t=window.Materialize,i=window.io,s=n(4),d=n(6),o=n(14),c=void 0,l=$("#gameDiv");0!==l.length&&l.ready(function(){t.toast("로딩중",1500),o(r)}),a.sendCmd=function(e,a){var n=Object.assign({},a||{});return n.type=e,c.emit("cmd",s.compressCommand(n)),!0},window.sendCmd=a.sendCmd},function(e,a,n){"use strict";var r={},t={};a.compressCommand=function(e){if(e instanceof String)return e;var a=r[e.type];return a&&console.log("compressing",e.type),a?a(e):e},a.decompressCommand=function(e){if("string"!=typeof e)return e;var a=t[e[0]];return a?a(e)||e:e},a.registerCompressor=function(e){var a=e.type,n=e.shead,i=e.cmpf,s=e.dcmpf;if(r[a]||t[n])throw new Error("Duplicate compressor "+a+" "+n);r[a]=i,t[n]=s},n(5)},function(e,a,n){"use strict";var r=n(4);r.registerCompressor({type:"rjoin",shead:"J",cmpf:function(e){return"J"+e.username+"\0"+e.useridf},dcmpf:function(e){var a=e.match(/^J(\w+)\0(\w+)$/);return null===a?null:{type:"rjoin",username:a[1],useridf:a[2]}}})},function(e,a,n){"use strict";var r={},t=window.Materialize,i=(n(7),n(9));a.translateCmdMessage=function(e){r[e.type]?r[e.type](e):t.toast("Unknown command message type : "+e.type,4e3)},n(10)(r),n(11)(r),n(12)(r),n(13)(r),r.gabort=function(e){var a=e.msg||"게임이 중간에 종료되었습니다.";t.toast(a,3e3),i.playing=!1,i.viewRoom(),$("#title").text("openMighty")}},function(e,a,n){"use strict";var r={},t=n(8);a=e.exports=r,a.viewDeck=function(){var e=$("#gameDiv .deck");e.empty();for(var a=0;a<r.deck.length;a++){var n=r.deck[a],i=[n.shape,n.num],s=i[0],d=i[1],o=t(null,"deck-card"),c=s[0]+d;o.find(".game-card").attr("card",c).addClass("game-card-"+c).addClass("game-card-shape-"+s[0]),e.append(o)}},a.shapeAbbrTable={spade:"♠",heart:"♥",diamond:"♦",clover:"♣",none:"N"},a.shapeStringTable={spade:"스페이드",heart:"하트",diamond:"다이아몬드",clover:"클로버",none:"노기루다"},a.numStringTable=[void 0,void 0,"2","3","4","5","6","7","8","9","10","J","Q","K","A"]},function(e,a){"use strict";var n=function(){function e(e,a){var n=[],r=!0,t=!1,i=void 0;try{for(var s,d=e[Symbol.iterator]();!(r=(s=d.next()).done)&&(n.push(s.value),!a||n.length!==a);r=!0);}catch(e){t=!0,i=e}finally{try{!r&&d.return&&d.return()}finally{if(t)throw i}}return n}return function(a,n){if(Array.isArray(a))return a;if(Symbol.iterator in Object(a))return e(a,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),r=window.Materialize,t=["text","val","submit","click","remove","empty","addClass","removeClass"," toggleClass"],i=["disabled"],s=void 0;$(function(){s=$("#game-template"),s.detach()}),e.exports=function(e,a,d){function o(e){var a=n(e,2),r=a[0],s=a[1];t.indexOf(r)!=-1?l[r](s):i.indexOf(r)!=-1?l.prop(r,s):l.attr(r,s)}var c=s.find("#template-"+a).clone().removeAttr("id"),l=void 0;if(d)for(var u=0;u<d.length;u++){var p=n(d[u],2),f=p[0],m=p[1];l=f?c.find(f):c,1==l.length?Array.isArray(m[0])?m.forEach(o):(null!==m&&"string"!=typeof m||(m=[d[u][1],d[u][2]]),o(m)):(r.toast("Invalid selector : "+f,4e3),console.log("Invalid selector",d[u]))}return e&&(e.empty(),e.append(c)),$("select").material_select(),c},e.exports.getTemplate=function(e){return s.find("#template-"+e)}},function(e,a,n){"use strict";function r(){var e=$(".player-self").find(".game-card-container");d(e,"button").focus(),e.find("button").click(function(e){s.sendCmd("start"),$(".player-has").empty(),e.preventDefault()})}var t=n(7),i={playing:!1,myidf:null,owner:0,users:[]},s=n(3),d=n(8);a=e.exports=i,a.viewRoom=function(){var e=void 0,a=void 0,n=void 0;i.playing?(a=-1,e=t.gameUsers,n=t.president):(a=i.owner,e=i.users,n=-1);var s=$(".player-slot");s.removeClass("player-empty player-owner player-president player-self player-ai player-leading");var d=null;s.find(".player-has").empty(),$(".last-trick").empty();for(var o=0;o<e.length;o++){var c=$(s[o]),l=e[o];c.find(".player-name").text(l.username),c.find(".game-card-container").empty(),a===o&&c.addClass("player-owner"),n===o&&c.addClass("player-president"),l.useridf==i.myidf&&(c.addClass("player-self"),d=o),l.ai&&c.addClass("player-ai")}for(var u=e.length;u<5;u++){var p=$(s[u]);p.addClass("player-empty"),p.find(".player-name").text("Empty"),p.find(".game-card-container").empty()}i.playing?t.selfIndex=d:a===d&&r()}},function(e,a,n){"use strict";var r=n(9),t=n(7),i=window.Materialize;e.exports=function(e){e.rjoin=function(e){i.toast(e.username+"님이 입장하셨습니다.",2e3),r.users.push({username:e.username,useridf:e.useridf}),r.viewRoom()},e.rleft=function(e){for(var a=r.users,n=0;n<a.length;n++){var s=a[n];if(s.useridf==e.useridf){r.playing?i.toast(s.username+"님이 탈주하셨습니다.",2e3):i.toast(s.username+"님이 퇴장하셨습니다.",2e3),a.splice(n,1);break}}if(r.owner=e.owner,r.playing){for(var d=t.gameUsers,o=0;o<d.length;o++)if(d[o].useridf==e.useridf){$($(".player-slot")[o]).addClass("player-ai");break}}else r.viewRoom()},e.rusers=function(e){r.owner=e.owner,r.users=e.users,r.myidf=e.youridf,r.viewRoom()}}},function(e,a,n){"use strict";var r=window.Materialize,t=n(8),i=n(7),s=n(9),d=n(3);e.exports=function(e){function a(e){if(!e.canDealMiss)return!1;var a=e.deck,n=0;return a.forEach(function(e){"spade"==e.shape&&14==e.num?n-=1:10==e.num?n+=.5:e.num>=11&&(n+=1)}),n<=1}e.gusers=function(e){i.gameUsers=e.users,i.president=-1,i.remainingBidder=5,i.lastBidder=null,i.bidCount=null,i.bidShape=null,i.canDealMiss=!0,s.playing=!0,s.viewRoom()},e.deck=function(e){i.deck=e.deck,i.viewDeck()},e.pbinfo=function(e){var a=$($(".player-slot .game-card-container")[e.bidder]);e.bidder==i.selfIndex&&(i.canDealMiss=!1),"pass"!=e.bidShape&&(i.bidShape=e.bidShape,i.bidCount=e.bidCount,i.lastBidder=e.bidder),a.find(".game-card").remove();var n=$("<div/>").addClass("game-card player-card-bidding");"pass"==e.bidShape?(n.text("pass"),i.remainingBidder--):n.text(e.bidShape+" "+e.bidCount),a.append(n),1==i.remainingBidder&&null!==i.lastBidder&&(i.lastBidder!=i.selfIndex&&r.toast("공약이 끝났습니다. 기다려주세요",1500),i.president=i.lastBidder)},e.bidrq=function(){var e=i.bidCount||13;"none"==i.bidShape&&e++;var n=$(".player-self .game-card-container"),r=t(n,"bidding");a(i)&&r.find("select[name=bidShape]").prepend($("<option/>").text("딜미스").val("dealmiss")).val("dealmiss"),r.attr("id","bidForm"),r.find('input[name="bidCount"]').attr("min",e).val(e),r.submit(function(){var e=$("#bidForm"),a=e.find('*[name="bidShape"]').val(),n=e.find('*[name="bidCount"]').val();return d.sendCmd("bid",{shape:a,num:parseInt(n)}),!1})},e.bc1rq=function(){r.toast("공약을 수정해주세요.",1500);var e=i.bidShape,a=i.bidCount,n=$(".player-self .game-card-container");t(n,"bidding",[[null,["id","bidChangeForm"]],[".player-form-title",["text","현재 : "+i.shapeAbbrTable[e]+a]],['input[name="bidCount"]',[["min",a],["val",a]]],['option[value="'+e+'"]',["remove"]],['option[value="pass"]',[["val",e],["text","그대로 ("+i.shapeStringTable[e]+")"]]],[null,["submit",function(){var e=$("#bidChangeForm"),a=e.find('*[name="bidShape"]').val(),n=e.find('*[name="bidCount"]').val();return a==i.bidShape&&n==i.bidCount&&(a="pass"),d.sendCmd("bc1",{shape:a,num:parseInt(n)}),!1}]]]).focus()},e.binfo=function(e){$(".player-slot .game-card-container").empty();var a=i.shapeStringTable[e.shape]+" "+e.num;r.toast("공약 : "+a,1500),$("#title").text("openMighty - "+a),i.bidShape=e.shape,i.bidCount=e.num,i.president=e.president,$($(".player-slot")[i.president]).addClass("player-leading player-president")}}},function(e,a,n){"use strict";var r=window.Materialize,t=window._,i=n(8),s=(n(9),n(7)),d=n(3),o=n(13);e.exports=function(e){function a(e){return{mighty:{shape:"spade"==e?"diamond":"spade",num:14},joker:{shape:"joker",num:0},girudaA:{shape:e,num:14},girudaK:{shape:e,num:13},girudaQ:{shape:e,num:12},girudaJ:{shape:e,num:11},card_sA:{shape:"spade",num:14},card_sK:{shape:"spade",num:13},card_hA:{shape:"heart",num:14},card_hK:{shape:"heart",num:13},card_dA:{shape:"diamond",num:14},card_dK:{shape:"diamond",num:13},card_cA:{shape:"clover",num:14},card_cK:{shape:"clover",num:13}}}function n(e,n,r){var t=a(e);if(t[n]){var i=t[n];return r.ftype="card",r.shape=i.shape,r.num=i.num,!0}return"first"==n?(r.ftype="first",!0):"player"==n.substr(0,6)?(r.ftype="player",r.friend=parseInt(n.substr(7))-1,!0):"none"==n&&(r.ftype="none",!0)}function c(e,n){var r=a(e);if("card"==n.ftype){var d=null;return t.keys(r).some(function(e){var a=r[e];if(a.shape==n.args.shape&&a.num==n.args.num)return d=e,!0}),d?i.getTemplate("fselect").find('option[value="'+d+'"]').text()+" 프렌드":s.shapeStringTable[n.args.shape]+" "+s.numStringTable[n.args.num]+" 프렌드"}return"first"==n.ftype?"선구 프렌드":"none"==n.ftype?"노프렌드":"player"==n.ftype?($($(".player-slot")[n.args]).addClass("player-leading"),s.gameUsers[n.args].username+" 프렌드"):"알수없는 프렌드 - "+String(n.ftype)}e.fsrq=function(){r.toast("카드 3장을 버리고 프렌드를 선정하세요",1500),$(".deck-card").click(function(){$(this).toggleClass("deck-card-selected")});var e=s.bidCount,a=s.bidShape,t=$(".player-self .game-card-container"),o=i(t,"fselect",[[null,["id","friendSelectForm"]],["option[value="+a+"]",["remove"]],['input[name="bidCount"]',[["min",e],["val",e]]],['option[value="pass"]',["val",a]]]);o.submit(function(){for(var e={},a=$("#friendSelectForm"),t=$("#gameDiv .deck .deck-card").toArray(),i=[],o=0;o<t.length;o++)$(t[o]).hasClass("deck-card-selected")&&i.push(o);if(3!=i.length)return r.toast("3장을 골라주세요.",1500),!1;e.discards=i;var c=a.find('*[name="bidShape"]').val(),l=a.find('*[name="bidCount"]').val();c==s.bidShape&&l==s.bidCount||(e.bidch2={shape:c,num:parseInt(l)});var u=a.find("select[name=friendType]").val();return n(c,u,e)?(d.sendCmd("fs",e),!1):(r.toast("프렌드를 선정해주세요.",1500),!1)})},e.fs=function(e){var a=c(s.bidShape,e);r.toast(a,2e3),s.ftype=e.ftype,s.fargs=e.args;var n=$("#title");n.text(n.text()+" - "+a),o.initGame()}}},function(e,a,n){"use strict";function r(){t(),c.trick++}function t(){$("#gameDiv .deck-card").removeClass("deck-card-selected").unbind("click")}function i(){c.trick=0,c.starter=c.president,r()}function s(e){var a=e.attr("card"),n={s:"spade",h:"heart",c:"clover",d:"diamond",j:"joker"}[a[0]],r=parseInt(a.substr(1));return{shape:n,num:r}}var d=window.Materialize,o=n(8),c=n(7),l=n(9),u=n(3);a=e.exports=function(e){function a(e){var a=$("#gameDiv .deck"),n=a.find(".game-card-j0"),r=a.find("spade"==c.bidShape?".game-card-d14":".game-card-s14");if(n.parents(".deck-card").addClass("deck-card-selectable"),r.parents(".deck-card").addClass("deck-card-selectable"),1==c.trick&&c.president==c.selfIndex){var t=void 0;for(t=0;t<10&&c.deck[t].shape==c.bidShape;t++);if(10!=t)return $(".deck-card").addClass("deck-card-selectable"),void $(".deck-card .game-card-shape-"+c.bidShape[0]).parents(".deck-card").removeClass("deck-card-selectable")}if(e.jcall){if(0!==n.length)return}else if(e.shaperq){var i=a.find(".game-card-shape-"+e.shaperq[0]);if(0!==i.length)return void i.parents(".deck-card").addClass("deck-card-selectable")}$(".deck-card").addClass("deck-card-selectable")}function n(e){if("joker"==e.shape)return $("<div/>").addClass("has-slot has-joker").text("Joker");var a=["2","3","4","5","6","7","8","9","10","J","Q","K","A"][e.num-2];return $("<div/>").addClass("has-slot").addClass("has-"+e.shape).text(a)}e.cprq=function(e){d.toast("카드를 내주세요.",1500);var n=$(".player-self .game-card-container");o(n,"button",[["button",[["text","카드 내기"],["disabled",!0]]]]),a(e);var r=$(".deck-card-selectable");r.click(function(){$(".deck-card").removeClass("deck-card-selected"),$(this).addClass("deck-card-selected"),n.find("button").prop("disabled",!1)}),r.dblclick(function(){n.find("button").click()}),n.find("button").click(function(){var e=$(".deck-card-selected");1!=e.length&&d.toast("카드를 선택해주세요.",1500);var a=s(e.find(".game-card"));if(1!=c.trick&&3==a.num&&c.starter==c.selfIndex&&("clover"==c.bidShape&&"spade"==a.shape||"clover"!=c.bidShape&&"clover"==a.shape)){var n=$("#jokerCallModal");n.find("button[name=no]").click(function(){u.sendCmd("cp",{cardIdx:e.index(".deck-card")})}),n.find("button[name=yes]").click(function(){u.sendCmd("cp",{cardIdx:e.index(".deck-card"),jcall:!0})}),n.modal({dismissible:!1}),n.modal("open")}else"joker"==a.shape&&c.starter==c.selfIndex?!function(){var a=$("#jokerModal"),n=a.find("select[name=srq]");n.val("none"),a.modal({dismissible:!1}),a.find("button").click(function(){var a=n.val();"none"==a&&(a=void 0),u.sendCmd("cp",{cardIdx:e.index(".deck-card"),srq:a})}),a.modal("open")}():u.sendCmd("cp",{cardIdx:e.index(".deck-card")})})},e.jrq=function(e){var a=e.shaperq;d.toast("조커로 "+c.shapeStringTable[a]+"를 불렀습니다.",2e3)},e.pcp=function(e){var a=e.card,n=$($(".player-slot")[e.player]);"card"==c.ftype&&c.fargs.shape==a.shape&&c.fargs.num==a.num&&n.addClass("player-leading");var r=n.find(".game-card-container"),i=a.shape[0]+a.num;o(r,"game-card",[[null,[["addClass","game-card-"+i],["card",i]]]]),t()},e.tend=function(e){var a=$($(".player-has")[e.winner]),t=$(".player-slot .game-card"),i=$(".last-trick");i.empty(),t.each(function(){var e=s($(this));i.append(n(e)),e.num>=10&&a.append(n(e))}),"first"==c.ftype&&c.president!=e.winner&&2!=$(".player-leading").length&&c.trick<=4&&$($(".player-slot")[e.winner]).addClass("player-leading"),t.fadeOut(1e3),c.starter=e.winner,r()},e.gend=function(e){var a=c.bidCount,n=20-e.oppcc,r=void 0;e.setUser?!function(){r=$("#gameEndWithSetModal"),r.find(".set").text("게임 결과 - 셋 ("+c.gameUsers[e.setUser].username+")");var a=r.find(".deck");a.empty(),e.setDeck.forEach(function(e){var n=[e.shape,e.num],r=n[0],t=n[1],i=o(null,"deck-card"),s=r[0]+t;i.find(".game-card").attr("card",s).addClass("game-card-"+s).addClass("game-card-shape-"+r[0]),a.append(i)})}():r=$("#gameEndModal");var t=r.find(".modal-content p.score");n>=a?t.text("["+n+"/"+a+"] 여당 승리입니다."):t.text("["+n+"/"+a+"] 야당 승리입니다."),l.playing=!1,r.modal({dismissible:!0,complete:function(){l.playing||(l.viewRoom(),$("#title").text("openMighty"))}}),r.modal("open")}},a.issueTrickStart=r,a.initGame=i},function(e,a){"use strict";var n=function(){function e(e,a){var n=[],r=!0,t=!1,i=void 0;try{for(var s,d=e[Symbol.iterator]();!(r=(s=d.next()).done)&&(n.push(s.value),!a||n.length!==a);r=!0);}catch(e){t=!0,i=e}finally{try{!r&&d.return&&d.return()}finally{if(t)throw i}}return n}return function(a,n){if(Array.isArray(a))return a;if(Symbol.iterator in Object(a))return e(a,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();e.exports=function(e){function a(){var a=129,i=185,s=document.createElement("canvas");s.width=a,s.height=i;var d=s.getContext("2d"),o=[];t.forEach(function(e){var t=n(e,3),c=t[0],l=t[1],u=t[2];d.drawImage(r,l,u,a,i,0,0,a,i);var p=s.toDataURL();o.push(".game-card-"+c+" {  background-image: url("+p+");}")}),$("<style>").prop("type","text/css").html(o.join("")).appendTo("head"),e&&e()}var r=new Image;r.onload=a,r.src="/images/cards/sprite.png";var t=[["c10",129,0],["c11",774,370],["c12",258,0],["c13",0,185],["c14",129,185],["c2",258,185],["c3",387,0],["c4",387,185],["c5",516,0],["c6",516,185],["c7",0,370],["c8",129,370],["c9",258,370],["d10",387,370],["d11",516,370],["d12",645,0],["d13",645,185],["d14",645,370],["d2",0,555],["d3",129,555],["d4",258,555],["d5",387,555],["d6",516,555],["d7",645,555],["d8",774,0],["d9",774,185],["h10",0,0],["h11",774,555],["h12",903,0],["h13",903,185],["h14",903,370],["h2",903,555],["h3",0,740],["h4",129,740],["h5",258,740],["h6",387,740],["h7",516,740],["h8",645,740],["h9",774,740],["j0",903,740],["s10",1032,0],["s11",1032,185],["s12",1032,370],["s13",1032,555],["s14",1032,740],["s2",0,925],["s3",129,925],["s4",258,925],["s5",387,925],["s6",516,925],["s7",645,925],["s8",774,925],["s9",903,925]]}}]);