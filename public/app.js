!function(e){function n(a){if(r[a])return r[a].exports;var t=r[a]={exports:{},id:a,loaded:!1};return e[a].call(t.exports,t,t.exports,n),t.loaded=!0,t.exports}var r={};return n.m=e,n.c=r,n.p="",n(0)}([function(e,n,r){"use strict";r(1),r(2),r(3),$(function(){$("#jokerCall").modal("open")}),$(document).on("click","#toast-container .toast",function(){$(this).fadeOut(function(){$(this).remove()})});var a=0;$(document).bind("touchstart",function(e){var n=+new Date;a+500>n&&e.preventDefault(),a=n}),$(document).ready(function(){$("select").material_select()})},function(e,n){"use strict";function r(e){return!0}function a(e){return""!==e}function t(e,n,a,t){var s=$("#"+n),d={};if(!s)return console.log("Unknown form '"+n+"'"),!1;for(var o=0;o<a.length;o++){var c=i(a[o],4),l=c[0],u=c[1],p=c[2],f=c[3];if(p||(p=r),f||(f="허용되지 않은 입력입니다."),d[u]=s.find("#"+l).val(),!p(d[u]))return window.alert(f),!1}return s.find("input, textarea").prop("disabled",!0),$.ajax({type:"POST",url:e,data:d,dataType:"json",success:function(e){e.error?(s.find("input, textarea").prop("disabled",!1),window.alert(e.error)):t(e)},error:function(e,n,r){console.log(n,"message : "+e.responseText+"\nerror : "+r)}}),!0}var i=function(){function e(e,n){var r=[],a=!0,t=!1,i=void 0;try{for(var s,d=e[Symbol.iterator]();!(a=(s=d.next()).done)&&(r.push(s.value),!n||r.length!==n);a=!0);}catch(e){t=!0,i=e}finally{try{!a&&d.return&&d.return()}finally{if(t)throw i}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return e(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();window.issueLogin=function(){t("/users/login","loginForm",[["username","username",a,"아이디를 입력하세요."],["password","password",a,"패스워드를 입력하세요."]],function(){window.location.reload(!0)})},window.issueRegister=function(){t("/users/join","registerForm",[["username","username",a,"아이디를 입력하세요."],["password","password",a,"패스워드를 입력하세요."],["email","email",a,"이메일을 입력하세요."]],function(){window.location.href="/"})},window.issueLogout=function(){$.ajax({type:"POST",url:"/users/logout",success:function(e){window.location.reload(!0)},error:function(e,n,r){console.log(n,"message : "+e.responseText+"\nerror : "+r)}})}},function(e,n){"use strict";$(function(){function e(e){for(var n="",r="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",a=0;a<e;a++)n+=r.charAt(Math.floor(Math.random()*r.length));return n}$("#roomURL").attr("pattern","^"+location.origin+"/[a-zA-Z0-9]{8}|$"),$("#joinRoom").submit(function(n){var r=$("#roomURL"),a=r.val();if(""===a){var t=e(8);a=window.location.origin+"/"+t,r.val(a)}window.location.href=a,n.preventDefault()})})},function(e,n,r){"use strict";function a(){c=i(),c.on("err",function(e){t.toast(e,3e3)}),c.on("info",function(e){}),c.on("cmd",function(e){e=s.decompressCommand(e),d.translateCmdMessage(e)}),c.on("reconnect",function(){}),c.on("disconnect",function(){})}var t=window.Materialize,i=window.io,s=r(4),d=r(6),o=r(14),c=void 0,l=$("#gameDiv");0!==l.length&&l.ready(function(){t.toast("로딩중",1500),o(a)}),n.sendCmd=function(e,n){var r=Object.assign({},n||{});return r.type=e,c.emit("cmd",s.compressCommand(r)),!0},window.sendCmd=n.sendCmd},function(e,n,r){"use strict";var a={},t={};n.compressCommand=function(e){if(e instanceof String)return e;var n=a[e.type];return n?n(e):e},n.decompressCommand=function(e){if("string"!=typeof e)return e;console.log(e);var n=t[e[0]];return n?n(e)||e:e},n.registerCompressor=function(e){var n=e.type,r=e.shead,i=e.cmpf,s=e.dcmpf;if(a[n]||t[r])throw new Error("Duplicate compressor "+n+" "+r);a[n]=i,t[r]=s},r(5)},function(e,n,r){"use strict";var a=r(4);a.registerCompressor({type:"rjoin",shead:"j",cmpf:function(e){return"j"+e.username+"\0"+e.useridf},dcmpf:function(e){var n=e.match(/^j(\w+)\0(\w+)$/);return n?{type:"rjoin",username:n[1],useridf:n[2]}:null}}),a.registerCompressor({type:"rusers",shead:"u",cmpf:function(e){var n=["u",e.owner];return n.push(e.youridf),e.users.forEach(function(e){n.push(e.username),n.push(e.useridf)}),n.join("\0")},dcmpf:function(e){for(var n=e.split("\0"),r=[],a=3;a<n.length;a+=2)r.push({username:n[a],useridf:n[a+1]});return{type:"rusers",owner:0|n[1],youridf:n[2],users:r}}}),a.registerCompressor({type:"rleft",shead:"l",cmpf:function(e){return"l"+e.useridf+"\0"+e.owner},dcmpf:function(e){var n=e.match(/^l(\w+)\0(\d+)$/);return n?{type:"rleft",useridf:n[1],owner:0|n[2]}:null}})},function(e,n,r){"use strict";var a={},t=window.Materialize,i=(r(7),r(9));n.translateCmdMessage=function(e){a[e.type]?a[e.type](e):t.toast("Unknown command message type : "+e.type,4e3)},r(10)(a),r(11)(a),r(12)(a),r(13)(a),a.gabort=function(e){var n=e.msg||"게임이 중간에 종료되었습니다.";t.toast(n,3e3),i.playing=!1,i.viewRoom(),$("#title").text("openMighty")}},function(e,n,r){"use strict";var a={},t=r(8);n=e.exports=a,n.viewDeck=function(){var e=$("#gameDiv .deck");e.empty();for(var n=0;n<a.deck.length;n++){var r=a.deck[n],i=[r.shape,r.num],s=i[0],d=i[1],o=t(null,"deck-card"),c=s[0]+d;o.find(".game-card").attr("card",c).addClass("game-card-"+c).addClass("game-card-shape-"+s[0]),e.append(o)}},n.shapeAbbrTable={spade:"♠",heart:"♥",diamond:"♦",clover:"♣",none:"N"},n.shapeStringTable={spade:"스페이드",heart:"하트",diamond:"다이아몬드",clover:"클로버",none:"노기루다"},n.numStringTable=[void 0,void 0,"2","3","4","5","6","7","8","9","10","J","Q","K","A"]},function(e,n){"use strict";var r=function(){function e(e,n){var r=[],a=!0,t=!1,i=void 0;try{for(var s,d=e[Symbol.iterator]();!(a=(s=d.next()).done)&&(r.push(s.value),!n||r.length!==n);a=!0);}catch(e){t=!0,i=e}finally{try{!a&&d.return&&d.return()}finally{if(t)throw i}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return e(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),a=window.Materialize,t=["text","val","submit","click","remove","empty","addClass","removeClass"," toggleClass"],i=["disabled"],s=void 0;$(function(){s=$("#game-template"),s.detach()}),e.exports=function(e,n,d){function o(e){var n=r(e,2),a=n[0],s=n[1];t.indexOf(a)!=-1?l[a](s):i.indexOf(a)!=-1?l.prop(a,s):l.attr(a,s)}var c=s.find("#template-"+n).clone().removeAttr("id"),l=void 0;if(d)for(var u=0;u<d.length;u++){var p=r(d[u],2),f=p[0],m=p[1];l=f?c.find(f):c,1==l.length?Array.isArray(m[0])?m.forEach(o):(null!==m&&"string"!=typeof m||(m=[d[u][1],d[u][2]]),o(m)):(a.toast("Invalid selector : "+f,4e3),console.log("Invalid selector",d[u]))}return e&&(e.empty(),e.append(c)),$("select").material_select(),c},e.exports.getTemplate=function(e){return s.find("#template-"+e)}},function(e,n,r){"use strict";function a(){var e=$(".player-self").find(".game-card-container");d(e,"button").focus(),e.find("button").click(function(e){s.sendCmd("start"),$(".player-has").empty(),e.preventDefault()})}var t=r(7),i={playing:!1,myidf:null,owner:0,users:[]},s=r(3),d=r(8);n=e.exports=i,n.viewRoom=function(){var e=void 0,n=void 0,r=void 0;i.playing?(n=-1,e=t.gameUsers,r=t.president):(n=i.owner,e=i.users,r=-1);var s=$(".player-slot");s.removeClass("player-empty player-owner player-president player-self player-ai player-leading");var d=null;s.find(".player-has").empty(),$(".last-trick").empty();for(var o=0;o<e.length;o++){var c=$(s[o]),l=e[o];c.find(".player-name").text(l.username),c.find(".game-card-container").empty(),n===o&&c.addClass("player-owner"),r===o&&c.addClass("player-president"),l.useridf==i.myidf&&(c.addClass("player-self"),d=o)}for(var u=e.length;u<5;u++){var p=$(s[u]);p.addClass("player-empty"),p.find(".player-name").text("Empty"),p.find(".game-card-container").empty()}i.playing?t.selfIndex=d:n===d&&a()}},function(e,n,r){"use strict";var a=r(9),t=r(7),i=window.Materialize;e.exports=function(e){e.rjoin=function(e){i.toast(e.username+"님이 입장하셨습니다.",2e3),a.users.push({username:e.username,useridf:e.useridf}),a.viewRoom()},e.rleft=function(e){for(var n=a.users,r=0;r<n.length;r++){var s=n[r];if(s.useridf==e.useridf){a.playing?i.toast(s.username+"님이 탈주하셨습니다.",2e3):i.toast(s.username+"님이 퇴장하셨습니다.",2e3),n.splice(r,1);break}}if(a.owner=e.owner,a.playing){for(var d=t.gameUsers,o=0;o<d.length;o++)if(d[o].useridf==e.useridf){$($(".player-slot")[o]).addClass("player-ai");break}}else a.viewRoom()},e.rusers=function(e){a.owner=e.owner,a.users=e.users,a.myidf=e.youridf,a.viewRoom()}}},function(e,n,r){"use strict";var a=window.Materialize,t=r(8),i=r(7),s=r(9),d=r(3);e.exports=function(e){function n(e){if(!e.canDealMiss)return!1;var n=e.deck,r=0;return n.forEach(function(e){"spade"==e.shape&&14==e.num?r-=1:10==e.num?r+=.5:e.num>=11&&(r+=1)}),r<=1}e.gusers=function(e){i.gameUsers=e.users,i.president=-1,i.remainingBidder=5,i.lastBidder=null,i.bidCount=null,i.bidShape=null,i.canDealMiss=!0,s.playing=!0,s.viewRoom()},e.deck=function(e){i.deck=e.deck,i.viewDeck()},e.pbinfo=function(e){var n=$($(".player-slot .game-card-container")[e.bidder]);e.bidder==i.selfIndex&&(i.canDealMiss=!1),"pass"!=e.bidShape&&(i.bidShape=e.bidShape,i.bidCount=e.bidCount,i.lastBidder=e.bidder),n.find(".game-card").remove();var r=$("<div/>").addClass("game-card player-card-bidding");"pass"==e.bidShape?(r.text("pass"),i.remainingBidder--):r.text(e.bidShape+" "+e.bidCount),n.append(r),1==i.remainingBidder&&null!==i.lastBidder&&(i.lastBidder!=i.selfIndex&&a.toast("공약이 끝났습니다. 기다려주세요",1500),i.president=i.lastBidder)},e.bidrq=function(){var e=i.bidCount||13;"none"==i.bidShape&&e++;var r=$(".player-self .game-card-container"),a=t(r,"bidding");n(i)&&a.find("select[name=bidShape]").prepend($("<option/>").text("딜미스").val("dealmiss")).val("dealmiss"),a.attr("id","bidForm"),a.find('input[name="bidCount"]').attr("min",e).val(e),a.submit(function(){var e=$("#bidForm"),n=e.find('*[name="bidShape"]').val(),r=e.find('*[name="bidCount"]').val();return d.sendCmd("bid",{shape:n,num:parseInt(r)}),!1})},e.bc1rq=function(){a.toast("공약을 수정해주세요.",1500);var e=i.bidShape,n=i.bidCount,r=$(".player-self .game-card-container");t(r,"bidding",[[null,["id","bidChangeForm"]],[".player-form-title",["text","현재 : "+i.shapeAbbrTable[e]+n]],['input[name="bidCount"]',[["min",n],["val",n]]],['option[value="'+e+'"]',["remove"]],['option[value="pass"]',[["val",e],["text","그대로 ("+i.shapeStringTable[e]+")"]]],[null,["submit",function(){var e=$("#bidChangeForm"),n=e.find('*[name="bidShape"]').val(),r=e.find('*[name="bidCount"]').val();return n==i.bidShape&&r==i.bidCount&&(n="pass"),d.sendCmd("bc1",{shape:n,num:parseInt(r)}),!1}]]]).focus()},e.binfo=function(e){$(".player-slot .game-card-container").empty();var n=i.shapeStringTable[e.shape]+" "+e.num;a.toast("공약 : "+n,1500),$("#title").text("openMighty - "+n),i.bidShape=e.shape,i.bidCount=e.num,i.president=e.president,$($(".player-slot")[i.president]).addClass("player-leading player-president")}}},function(e,n,r){"use strict";var a=window.Materialize,t=window._,i=r(8),s=(r(9),r(7)),d=r(3),o=r(13);e.exports=function(e){function n(e){return{mighty:{shape:"spade"==e?"diamond":"spade",num:14},joker:{shape:"joker",num:0},girudaA:{shape:e,num:14},girudaK:{shape:e,num:13},girudaQ:{shape:e,num:12},girudaJ:{shape:e,num:11},card_sA:{shape:"spade",num:14},card_sK:{shape:"spade",num:13},card_hA:{shape:"heart",num:14},card_hK:{shape:"heart",num:13},card_dA:{shape:"diamond",num:14},card_dK:{shape:"diamond",num:13},card_cA:{shape:"clover",num:14},card_cK:{shape:"clover",num:13}}}function r(e,r,a){var t=n(e);if(t[r]){var i=t[r];return a.ftype="card",a.shape=i.shape,a.num=i.num,!0}return"first"==r?(a.ftype="first",!0):"player"==r.substr(0,6)?(a.ftype="player",a.friend=parseInt(r.substr(7))-1,!0):"none"==r&&(a.ftype="none",!0)}function c(e,r){var a=n(e);if("card"==r.ftype){var d=null;return t.keys(a).some(function(e){var n=a[e];if(n.shape==r.args.shape&&n.num==r.args.num)return d=e,!0}),d?i.getTemplate("fselect").find('option[value="'+d+'"]').text()+" 프렌드":s.shapeStringTable[r.args.shape]+" "+s.numStringTable[r.args.num]+" 프렌드"}return"first"==r.ftype?"선구 프렌드":"none"==r.ftype?"노프렌드":"player"==r.ftype?($($(".player-slot")[r.args]).addClass("player-leading"),s.gameUsers[r.args].username+" 프렌드"):"알수없는 프렌드 - "+String(r.ftype)}e.fsrq=function(){a.toast("카드 3장을 버리고 프렌드를 선정하세요",1500),$(".deck-card").click(function(){$(this).toggleClass("deck-card-selected")});var e=s.bidCount,n=s.bidShape,t=$(".player-self .game-card-container"),o=i(t,"fselect",[[null,["id","friendSelectForm"]],["option[value="+n+"]",["remove"]],['input[name="bidCount"]',[["min",e],["val",e]]],['option[value="pass"]',["val",n]]]);o.submit(function(){for(var e={},n=$("#friendSelectForm"),t=$("#gameDiv .deck .deck-card").toArray(),i=[],o=0;o<t.length;o++)$(t[o]).hasClass("deck-card-selected")&&i.push(o);if(3!=i.length)return a.toast("3장을 골라주세요.",1500),!1;e.discards=i;var c=n.find('*[name="bidShape"]').val(),l=n.find('*[name="bidCount"]').val();c==s.bidShape&&l==s.bidCount||(e.bidch2={shape:c,num:parseInt(l)});var u=n.find("select[name=friendType]").val();return r(c,u,e)?(d.sendCmd("fs",e),!1):(a.toast("프렌드를 선정해주세요.",1500),!1)})},e.fs=function(e){var n=c(s.bidShape,e);a.toast(n,2e3),s.ftype=e.ftype,s.fargs=e.args;var r=$("#title");r.text(r.text()+" - "+n),o.initGame()}}},function(e,n,r){"use strict";function a(){t(),c.trick++}function t(){$("#gameDiv .deck-card").removeClass("deck-card-selected").unbind("click")}function i(){c.trick=0,c.starter=c.president,a()}function s(e){var n=e.attr("card"),r={s:"spade",h:"heart",c:"clover",d:"diamond",j:"joker"}[n[0]],a=parseInt(n.substr(1));return{shape:r,num:a}}var d=window.Materialize,o=r(8),c=r(7),l=r(9),u=r(3);n=e.exports=function(e){function n(e){var n=$("#gameDiv .deck"),r=n.find(".game-card-j0"),a=n.find("spade"==c.bidShape?".game-card-d14":".game-card-s14");if(r.parents(".deck-card").addClass("deck-card-selectable"),a.parents(".deck-card").addClass("deck-card-selectable"),1==c.trick&&c.president==c.selfIndex){var t=void 0;for(t=0;t<10&&c.deck[t].shape==c.bidShape;t++);if(10!=t)return $(".deck-card").addClass("deck-card-selectable"),void $(".deck-card .game-card-shape-"+c.bidShape[0]).parents(".deck-card").removeClass("deck-card-selectable")}if(e.jcall){if(0!==r.length)return}else if(e.shaperq){var i=n.find(".game-card-shape-"+e.shaperq[0]);if(0!==i.length)return void i.parents(".deck-card").addClass("deck-card-selectable")}$(".deck-card").addClass("deck-card-selectable")}function r(e){if("joker"==e.shape)return $("<div/>").addClass("has-slot has-joker").text("Joker");var n=["2","3","4","5","6","7","8","9","10","J","Q","K","A"][e.num-2];return $("<div/>").addClass("has-slot").addClass("has-"+e.shape).text(n)}e.cprq=function(e){d.toast("카드를 내주세요.",1500);var r=$(".player-self .game-card-container");o(r,"button",[["button",[["text","카드 내기"],["disabled",!0]]]]),n(e);var a=$(".deck-card-selectable");a.click(function(){$(".deck-card").removeClass("deck-card-selected"),$(this).addClass("deck-card-selected"),r.find("button").prop("disabled",!1)}),a.dblclick(function(){r.find("button").click()}),r.find("button").click(function(){var e=$(".deck-card-selected");1!=e.length&&d.toast("카드를 선택해주세요.",1500);var n=s(e.find(".game-card"));if(1!=c.trick&&3==n.num&&c.starter==c.selfIndex&&("clover"==c.bidShape&&"spade"==n.shape||"clover"!=c.bidShape&&"clover"==n.shape)){var r=$("#jokerCallModal");r.find("button[name=no]").click(function(){u.sendCmd("cp",{cardIdx:e.index(".deck-card")})}),r.find("button[name=yes]").click(function(){u.sendCmd("cp",{cardIdx:e.index(".deck-card"),jcall:!0})}),r.modal({dismissible:!1}),r.modal("open")}else"joker"==n.shape&&c.starter==c.selfIndex?!function(){var n=$("#jokerModal"),r=n.find("select[name=srq]");r.val("none"),n.modal({dismissible:!1}),n.find("button").click(function(){var n=r.val();"none"==n&&(n=void 0),u.sendCmd("cp",{cardIdx:e.index(".deck-card"),srq:n})}),n.modal("open")}():u.sendCmd("cp",{cardIdx:e.index(".deck-card")})})},e.jrq=function(e){var n=e.shaperq;d.toast("조커로 "+c.shapeStringTable[n]+"를 불렀습니다.",2e3)},e.pcp=function(e){var n=e.card,r=$($(".player-slot")[e.player]);"card"==c.ftype&&c.fargs.shape==n.shape&&c.fargs.num==n.num&&r.addClass("player-leading");var a=r.find(".game-card-container"),i=n.shape[0]+n.num;o(a,"game-card",[[null,[["addClass","game-card-"+i],["card",i]]]]),t()},e.tend=function(e){var n=$($(".player-has")[e.winner]),t=$(".player-slot .game-card"),i=$(".last-trick");i.empty(),t.each(function(){var e=s($(this));i.append(r(e)),e.num>=10&&n.append(r(e))}),"first"==c.ftype&&c.president!=e.winner&&2!=$(".player-leading").length&&c.trick<=4&&$($(".player-slot")[e.winner]).addClass("player-leading"),t.fadeOut(1e3),c.starter=e.winner,a()},e.gend=function(e){var n=c.bidCount,r=20-e.oppcc,a=void 0;e.setUser?!function(){a=$("#gameEndWithSetModal"),a.find(".set").text("게임 결과 - 셋 ("+c.gameUsers[e.setUser].username+")");var n=a.find(".deck");n.empty(),e.setDeck.forEach(function(e){var r=[e.shape,e.num],a=r[0],t=r[1],i=o(null,"deck-card"),s=a[0]+t;i.find(".game-card").attr("card",s).addClass("game-card-"+s).addClass("game-card-shape-"+a[0]),n.append(i)})}():a=$("#gameEndModal");var t=a.find(".modal-content p.score");r>=n?t.text("["+r+"/"+n+"] 여당 승리입니다."):t.text("["+r+"/"+n+"] 야당 승리입니다."),l.playing=!1,a.modal({dismissible:!0,complete:function(){l.playing||(l.viewRoom(),$("#title").text("openMighty"))}}),a.modal("open")}},n.issueTrickStart=a,n.initGame=i},function(e,n){"use strict";var r=function(){function e(e,n){var r=[],a=!0,t=!1,i=void 0;try{for(var s,d=e[Symbol.iterator]();!(a=(s=d.next()).done)&&(r.push(s.value),!n||r.length!==n);a=!0);}catch(e){t=!0,i=e}finally{try{!a&&d.return&&d.return()}finally{if(t)throw i}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return e(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();e.exports=function(e){function n(){var n=129,i=185,s=document.createElement("canvas");s.width=n,s.height=i;var d=s.getContext("2d"),o=[];t.forEach(function(e){var t=r(e,3),c=t[0],l=t[1],u=t[2];d.drawImage(a,l,u,n,i,0,0,n,i);var p=s.toDataURL();o.push(".game-card-"+c+" {  background-image: url("+p+");}")}),$("<style>").prop("type","text/css").html(o.join("")).appendTo("head"),e&&e()}var a=new Image;a.onload=n,a.src="/images/cards/sprite.png";var t=[["c10",129,0],["c11",774,370],["c12",258,0],["c13",0,185],["c14",129,185],["c2",258,185],["c3",387,0],["c4",387,185],["c5",516,0],["c6",516,185],["c7",0,370],["c8",129,370],["c9",258,370],["d10",387,370],["d11",516,370],["d12",645,0],["d13",645,185],["d14",645,370],["d2",0,555],["d3",129,555],["d4",258,555],["d5",387,555],["d6",516,555],["d7",645,555],["d8",774,0],["d9",774,185],["h10",0,0],["h11",774,555],["h12",903,0],["h13",903,185],["h14",903,370],["h2",903,555],["h3",0,740],["h4",129,740],["h5",258,740],["h6",387,740],["h7",516,740],["h8",645,740],["h9",774,740],["j0",903,740],["s10",1032,0],["s11",1032,185],["s12",1032,370],["s13",1032,555],["s14",1032,740],["s2",0,925],["s3",129,925],["s4",258,925],["s5",387,925],["s6",516,925],["s7",645,925],["s8",774,925],["s9",903,925]]}}]);