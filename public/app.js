!function(e){function n(t){if(r[t])return r[t].exports;var a=r[t]={exports:{},id:t,loaded:!1};return e[t].call(a.exports,a,a.exports,n),a.loaded=!0,a.exports}var r={};return n.m=e,n.c=r,n.p="",n(0)}([function(e,n,r){"use strict";r(1),r(2),r(3),$(function(){$("#jokerCall").modal("open")}),$(document).on("click","#toast-container .toast",function(){$(this).fadeOut(function(){$(this).remove()})});var t=0;$(document).bind("touchstart",function(e){var n=+new Date;t+500>n&&e.preventDefault(),t=n}),$(document).ready(function(){$("select").material_select()})},function(e,n){"use strict";function r(e){return!0}function t(e){return""!==e}function a(e,n,t,a){var s=$("#"+n),o={};if(!s)return console.log("Unknown form '"+n+"'"),!1;for(var d=0;d<t.length;d++){var c=i(t[d],4),u=c[0],l=c[1],f=c[2],p=c[3];if(f||(f=r),p||(p="허용되지 않은 입력입니다."),o[l]=s.find("#"+u).val(),!f(o[l]))return window.alert(p),!1}return s.find("input, textarea").prop("disabled",!0),$.ajax({type:"POST",url:e,data:o,dataType:"json",success:function(e){e.error?(s.find("input, textarea").prop("disabled",!1),window.alert(e.error)):a(e)},error:function(e,n,r){console.log(n,"message : "+e.responseText+"\nerror : "+r)}}),!0}var i=function(){function e(e,n){var r=[],t=!0,a=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(t=(s=o.next()).done)&&(r.push(s.value),!n||r.length!==n);t=!0);}catch(e){a=!0,i=e}finally{try{!t&&o.return&&o.return()}finally{if(a)throw i}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return e(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();window.issueLogin=function(){a("/users/login","loginForm",[["username","username",t,"아이디를 입력하세요."],["password","password",t,"패스워드를 입력하세요."]],function(){window.location.reload(!0)})},window.issueRegister=function(){a("/users/join","registerForm",[["username","username",t,"아이디를 입력하세요."],["password","password",t,"패스워드를 입력하세요."],["email","email",t,"이메일을 입력하세요."]],function(){window.location.href="/"})},window.issueLogout=function(){$.ajax({type:"POST",url:"/users/logout",success:function(e){window.location.reload(!0)},error:function(e,n,r){console.log(n,"message : "+e.responseText+"\nerror : "+r)}})}},function(e,n){"use strict";$(function(){function e(e){for(var n="",r="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",t=0;t<e;t++)n+=r.charAt(Math.floor(Math.random()*r.length));return n}$("#roomURL").attr("pattern","^"+location.origin+"/[a-zA-Z0-9]{8}|$"),$("#joinRoom").submit(function(n){var r=$("#roomURL"),t=r.val();if(""===t){var a=e(8);t=window.location.origin+"/"+a,r.val(t)}window.location.href=t,n.preventDefault()})})},function(e,n,r){"use strict";function t(){c=i(),c.on("err",function(e){a.toast(e,3e3)}),c.on("info",function(e){}),c.on("cmd",function(e){var n=s.decompressCommand(e);o.translateCmdMessage(n)}),c.on("reconnect",function(){}),c.on("disconnect",function(){})}var a=window.Materialize,i=window.io,s=r(4),o=r(10),d=r(19),c=void 0,u=$("#gameDiv");0!==u.length&&u.ready(function(){a.toast("로딩중",1500),d(t)}),n.emit=function(e,n){c?c.emit(e,n):console.log("Socket not yet initialized : ",e,n)},window.sendCmd=n.sendCmd;var l=r(14);l.setEmitFunc(n.emit)},function(e,n,r){"use strict";function t(e){if(Array.isArray(e))return 0===e.length?[]:void 0!==e[0].cardEnvID?["*"].concat(e.map(function(e){return e.cardEnvID})):e.map(t);if(null===e)return null;if("object"!=("undefined"==typeof e?"undefined":i(e)))return"number"==typeof e&&isNaN(e)?void 0:e;var n=function(){var n={};return Object.keys(e).forEach(function(r){void 0===e[r]||(null===e[r]?n[r]=null:void 0!==e[r].cardEnvID?n["*"+r]=e[r].cardEnvID:n[r]=t(e[r]))}),{v:n}}();return"object"===("undefined"==typeof n?"undefined":i(n))?n.v:void 0}function a(e){if(Array.isArray(e))return 0===e.length?[]:"*"==e[0]?e.slice(1).map(d.decodeCard):e.map(a);if(null===e)return null;if("object"!=("undefined"==typeof e?"undefined":i(e)))return"number"==typeof e&&isNaN(e)?void 0:e;var n=function(){var n={};return Object.keys(e).forEach(function(r){"*"==r[0]?n[r.substr(1)]=d.decodeCard(e[r]):n[r]=a(e[r])}),{v:n}}();return"object"===("undefined"==typeof n?"undefined":i(n))?n.v:void 0}var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s={},o={},d=r(5);n.compressCommand=function(e){if("string"==typeof e)return e;var n=s[e.type];return n?n(e):t(e)},n.decompressCommand=function(e){if("string"!=typeof e)return a(e);var n=o[e[0]];return n?n(e)||e:a(e)},n.registerCompressor=function(e){var n=e.type,r=e.shead,t=e.cmpf,a=e.dcmpf,i=e.keys;if(s[n]||o[r])throw new Error("Duplicate compressor "+n+" "+r);t||a||!i||(t=d.createJsonCompressor(r,i),a=d.createJsonDecompressor(n,i)),s[n]=t,o[r]=a},r(6),r(7),r(8),r(9)},function(e,n){"use strict";function r(e){return{shape:t[e/13|0],num:52==e?0:e%13+2,cardEnvID:e}}var t=["spade","heart","clover","diamond","joker"];n.decodeCard=r;var a={C:{enc:function(e){return e.cardEnvID},dec:function(e){return r(e)}},F:{enc:function(e){return e},dec:function(e){return Number(e)}},I:{enc:function(e){return e},dec:function(e){return 0|e}},B:{enc:function(e){return 0|e},dec:Boolean}};n.createJsonCompressor=function(e,n){return function(r){var t=[];return n.forEach(function(e){var n=a[e[0]];n?t.push(n.enc(r[e.substring(1)])):t.push(r[e])}),e+t.join(";")}},n.createJsonDecompressor=function(e,n){return function(r){var t=r.substr(1).split(";"),i={type:e},s=0;return n.forEach(function(e){var n=a[e[0]];n?i[e.substring(1)]=n.dec(t[s]):i[e]=t[s],s++}),i}}},function(e,n,r){"use strict";var t=r(4);r(5);t.registerCompressor({type:"rjoin",shead:"j",keys:["username","useridf","Frating"]}),t.registerCompressor({type:"rusers",shead:"u",cmpf:function(e){var n=["u",e.owner];return n.push(e.youridf),e.users.forEach(function(e){n.push(e.username),n.push(e.useridf),n.push(e.rating)}),n.join(";")},dcmpf:function(e){for(var n=e.split(";"),r=[],t=3;t<n.length;t+=3)r.push({username:n[t],useridf:n[t+1],rating:Number(n[t+2])});return{type:"rusers",owner:0|n[1],youridf:n[2],users:r}}}),t.registerCompressor({type:"rleft",shead:"l",keys:["useridf","Iowner"]})},function(e,n,r){"use strict";var t=r(4),a=r(5);t.registerCompressor({type:"gusers",shead:"U",cmpf:function(e){var n=["U"];return e.users.forEach(function(e){n.push(e.username),n.push(e.useridf),n.push(e.rating)}),n.join(";")},dcmpf:function(e){for(var n=e.split(";"),r=[],t=1;t<n.length;t+=3)r.push({username:n[t],useridf:n[t+1],rating:Number(n[t+2])});return{type:"gusers",users:r}}}),t.registerCompressor({type:"deck",shead:"D",cmpf:function(e){var n=["D"];return e.deck.forEach(function(e){n.push(e.cardEnvID)}),n.join(";")},dcmpf:function(e){var n=e.split(";"),r=n.slice(1).map(a.decodeCard);return{type:"deck",deck:r}}})},function(e,n,r){"use strict";var t=r(4);r(5);t.registerCompressor({type:"pcp",shead:"C",keys:["Iplayer","Ccard","Bjcall"]}),t.registerCompressor({type:"tend",shead:"T",keys:["winner"]})},function(e,n,r){"use strict";var t=r(4);r(5);t.registerCompressor({type:"binfo",shead:"B",keys:["Ipresident","shape","Inum"]}),t.registerCompressor({type:"pbinfo",shead:"p",keys:["bidder","bidShape","IbidCount"]})},function(e,n,r){"use strict";var t={},a=window.Materialize,i=(r(11),r(13));n.translateCmdMessage=function(e){t[e.type]?t[e.type](e):a.toast("Unknown command message type : "+e.type,4e3)},r(15)(t),r(16)(t),r(17)(t),r(18)(t),t.gabort=function(e){var n=e.msg||"게임이 중간에 종료되었습니다.";a.toast(n,3e3),i.playing=!1,i.viewRoom(),$("#title").text("openMighty")}},function(e,n,r){"use strict";var t={},a=r(12);n=e.exports=t,n.viewDeck=function(){var e=$("#gameDiv .deck");e.empty();for(var n=0;n<t.deck.length;n++){var r=t.deck[n],i=[r.shape,r.num],s=i[0],o=i[1],d=a(null,"deck-card"),c=s[0]+o;d.find(".game-card").attr("card",c).addClass("game-card-"+c).addClass("game-card-shape-"+s[0]),e.append(d)}},n.shapeAbbrTable={spade:"♠",heart:"♥",diamond:"♦",clover:"♣",none:"N"},n.shapeStringTable={spade:"스페이드",heart:"하트",diamond:"다이아몬드",clover:"클로버",none:"노기루다"},n.numStringTable=[void 0,void 0,"2","3","4","5","6","7","8","9","10","J","Q","K","A"]},function(e,n){"use strict";var r=function(){function e(e,n){var r=[],t=!0,a=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(t=(s=o.next()).done)&&(r.push(s.value),!n||r.length!==n);t=!0);}catch(e){a=!0,i=e}finally{try{!t&&o.return&&o.return()}finally{if(a)throw i}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return e(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),t=window.Materialize,a=["text","val","submit","click","remove","empty","addClass","removeClass"," toggleClass"],i=["disabled"],s=void 0;$(function(){s=$("#game-template"),s.detach()}),e.exports=function(e,n,o){function d(e){var n=r(e,2),t=n[0],s=n[1];a.indexOf(t)!=-1?u[t](s):i.indexOf(t)!=-1?u.prop(t,s):u.attr(t,s)}var c=s.find("#template-"+n).clone().removeAttr("id"),u=void 0;if(o)for(var l=0;l<o.length;l++){var f=r(o[l],2),p=f[0],m=f[1];u=p?c.find(p):c,1==u.length?Array.isArray(m[0])?m.forEach(d):(null!==m&&"string"!=typeof m||(m=[o[l][1],o[l][2]]),d(m)):(t.toast("Invalid selector : "+p,4e3),console.log("Invalid selector",o[l]))}return e&&(e.empty(),e.append(c)),$("select").material_select(),c},e.exports.getTemplate=function(e){return s.find("#template-"+e)}},function(e,n,r){"use strict";function t(){var e=$(".player-self").find(".game-card-container");o(e,"button").focus(),e.find("button").click(function(e){s.sendStartGame(),$(".player-has").empty(),e.preventDefault()})}var a=r(11),i={playing:!1,myidf:null,owner:0,users:[]},s=r(14),o=r(12);n=e.exports=i,n.viewRoom=function(){var e=void 0,n=void 0,r=void 0;i.playing?(n=-1,e=a.gameUsers,r=a.president):(n=i.owner,e=i.users,r=-1);var s=$(".player-slot");s.removeClass("player-empty player-owner player-president player-self player-ai player-leading");var o=null;s.find(".player-has").empty(),$(".last-trick").empty();for(var d=0;d<e.length;d++){var c=$(s[d]),u=e[d];c.find(".player-name").text(u.username+" ("+u.rating.toFixed(1)+")"),c.find(".game-card-container").empty(),n===d&&c.addClass("player-owner"),r===d&&c.addClass("player-president"),u.useridf==i.myidf&&(c.addClass("player-self"),o=d)}for(var l=e.length;l<5;l++){var f=$(s[l]);f.addClass("player-empty"),f.find(".player-name").text("Empty"),f.find(".game-card-container").empty()}i.playing?a.selfIndex=o:n===o&&t()}},function(e,n,r){"use strict";function t(e,n){var r=Object.assign({},n||{});return r.type=e,i("cmd",a.compressCommand(r)),!0}var a=r(4),i=void 0;n.setEmitFunc=function(e){i=e},n.sendStartGame=function(){t("start")},n.sendBidding=function(e,n){t("bid",{shape:e,num:parseInt(n)})},n.sendBidChange1=function(e,n){t("bc1",{shape:e,num:n})},n.sendFriendSelectAndDiscard3=function(e){t("fs",e)},n.sendCardPlay=function(e,n){n=n||{jcall:!1};var r=n.jcall||void 0,a=n.callShape||void 0;t("cp",{cardIdx:e,jcall:r,srq:a})}},function(e,n,r){"use strict";var t=r(13),a=r(11),i=window.Materialize;e.exports=function(e){e.rjoin=function(e){i.toast(e.username+"님이 입장하셨습니다.",2e3),t.users.push({username:e.username,useridf:e.useridf,rating:e.rating}),t.viewRoom()},e.rleft=function(e){for(var n=t.users,r=0;r<n.length;r++){var s=n[r];if(s.useridf==e.useridf){t.playing?i.toast(s.username+"님이 탈주하셨습니다.",2e3):i.toast(s.username+"님이 퇴장하셨습니다.",2e3),n.splice(r,1);break}}if(t.owner=e.owner,t.playing){for(var o=a.gameUsers,d=0;d<o.length;d++)if(o[d].useridf==e.useridf){$($(".player-slot")[d]).addClass("player-ai");break}}else t.viewRoom()},e.rusers=function(e){t.owner=e.owner,t.users=e.users,t.myidf=e.youridf,t.viewRoom()}}},function(e,n,r){"use strict";var t=window.Materialize,a=r(12),i=r(11),s=r(13),o=r(14);e.exports=function(e){function n(e){if(!e.canDealMiss)return!1;var n=e.deck,r=0;return n.forEach(function(e){"spade"==e.shape&&14==e.num?r-=1:10==e.num?r+=.5:e.num>=11&&(r+=1)}),r<=1}e.gusers=function(e){i.gameUsers=e.users,i.president=-1,i.remainingBidder=5,i.lastBidder=null,i.bidCount=null,i.bidShape=null,i.canDealMiss=!0,s.playing=!0,s.viewRoom()},e.deck=function(e){i.deck=e.deck,i.viewDeck()},e.pbinfo=function(e){var n=$($(".player-slot .game-card-container")[e.bidder]);e.bidder==i.selfIndex&&(i.canDealMiss=!1),"pass"!=e.bidShape&&(i.bidShape=e.bidShape,i.bidCount=e.bidCount,i.lastBidder=e.bidder),n.find(".game-card").remove();var r=$("<div/>").addClass("game-card player-card-bidding");"pass"==e.bidShape?(r.text("pass"),i.remainingBidder--):r.text(e.bidShape+" "+e.bidCount),n.append(r),1==i.remainingBidder&&null!==i.lastBidder&&(i.lastBidder!=i.selfIndex&&t.toast("공약이 끝났습니다. 기다려주세요",1500),i.president=i.lastBidder)},e.bidrq=function(){var e=i.bidCount||13;"none"==i.bidShape&&e++;var r=$(".player-self .game-card-container"),t=a(r,"bidding");n(i)&&t.find("select[name=bidShape]").prepend($("<option/>").text("딜미스").val("dealmiss")).val("dealmiss"),t.attr("id","bidForm"),t.find('input[name="bidCount"]').attr("min",e).val(e),t.submit(function(){var e=$("#bidForm"),n=e.find('*[name="bidShape"]').val(),r=e.find('*[name="bidCount"]').val();return o.sendBidding(n,r),!1})},e.bc1rq=function(){t.toast("공약을 수정해주세요.",1500);var e=i.bidShape,n=i.bidCount,r=$(".player-self .game-card-container");a(r,"bidding",[[null,["id","bidChangeForm"]],[".player-form-title",["text","현재 : "+i.shapeAbbrTable[e]+n]],['input[name="bidCount"]',[["min",n],["val",n]]],['option[value="'+e+'"]',["remove"]],['option[value="pass"]',[["val",e],["text","그대로 ("+i.shapeStringTable[e]+")"]]],[null,["submit",function(){var e=$("#bidChangeForm"),n=e.find('*[name="bidShape"]').val(),r=0|e.find('*[name="bidCount"]').val();return n==i.bidShape&&r==i.bidCount&&(n="pass"),o.sendBidChange1(n,r),!1}]]]).focus()},e.binfo=function(e){$(".player-slot .game-card-container").empty();var n=i.shapeStringTable[e.shape]+" "+e.num;t.toast("공약 : "+n,1500),$("#title").text("openMighty - "+n),i.bidShape=e.shape,i.bidCount=e.num,i.president=e.president,$($(".player-slot")[i.president]).addClass("player-leading player-president")}}},function(e,n,r){"use strict";var t=window.Materialize,a=window._,i=r(12),s=(r(13),r(11)),o=r(14),d=r(18);e.exports=function(e){function n(e){return{mighty:{shape:"spade"==e?"diamond":"spade",num:14},joker:{shape:"joker",num:0},girudaA:{shape:e,num:14},girudaK:{shape:e,num:13},girudaQ:{shape:e,num:12},girudaJ:{shape:e,num:11},card_sA:{shape:"spade",num:14},card_sK:{shape:"spade",num:13},card_hA:{shape:"heart",num:14},card_hK:{shape:"heart",num:13},card_dA:{shape:"diamond",num:14},card_dK:{shape:"diamond",num:13},card_cA:{shape:"clover",num:14},card_cK:{shape:"clover",num:13}}}function r(e,r,t){if(null===e)return!1;var a=n(e);if(a[r]){var i=a[r];return t.ftype="card",t.shape=i.shape,t.num=i.num,!0}return"first"==r?(t.ftype="first",!0):r.startsWith("player")?(t.ftype="player",t.friend=parseInt(r.substr(7))-1,!0):"none"==r&&(t.ftype="none",!0)}function c(e,r){var t=n(e);if("card"==r.ftype){var o=null;return a.keys(t).some(function(e){var n=t[e];if(n.shape==r.args.shape&&n.num==r.args.num)return o=e,!0}),o?i.getTemplate("fselect").find('option[value="'+o+'"]').text()+" 프렌드":s.shapeStringTable[r.args.shape]+" "+s.numStringTable[r.args.num]+" 프렌드"}return"first"==r.ftype?"선구 프렌드":"none"==r.ftype?"노프렌드":"player"==r.ftype?($($(".player-slot")[r.args]).addClass("player-leading"),s.gameUsers[r.args].username+" 프렌드"):"알수없는 프렌드 - "+String(r.ftype)}e.fsrq=function(){t.toast("카드 3장을 버리고 프렌드를 선정하세요",1500),$(".deck-card").click(function(){$(this).toggleClass("deck-card-selected")});var e=s.bidCount,n=s.bidShape,a=$(".player-self .game-card-container"),d=i(a,"fselect",[[null,["id","friendSelectForm"]],["option[value="+n+"]",["remove"]],['input[name="bidCount"]',[["min",e],["val",e]]],['option[value="pass"]',["val",n]]]);d.submit(function(e){e.preventDefault();for(var n={},a=$("#friendSelectForm"),i=$("#gameDiv .deck .deck-card").toArray(),d=[],c=0;c<i.length;c++)$(i[c]).hasClass("deck-card-selected")&&d.push(c);if(3!=d.length)return t.toast("3장을 골라주세요.",1500),!1;n.discards=d;var u=a.find('*[name="bidShape"]').val(),l=a.find('*[name="bidCount"]').val();u==s.bidShape&&l==s.bidCount||(n.bidch2={shape:u,num:parseInt(l)});var f=a.find("select[name=friendType]").val();return r(u,f,n)?(o.sendFriendSelectAndDiscard3(n),!1):(t.toast("프렌드를 선정해주세요.",1500),!1)})},e.fs=function(e){var n=c(s.bidShape,e);t.toast(n,2e3),s.ftype=e.ftype,s.fargs=e.args;var r=$("#title");r.text(r.text()+" - "+n),d.initGame()}}},function(e,n,r){"use strict";function t(){a(),c.trick++}function a(){$("#gameDiv .deck-card").removeClass("deck-card-selected").unbind("click")}function i(){c.trick=0,c.starter=c.president,t()}function s(e){var n=e.attr("card"),r={s:"spade",h:"heart",c:"clover",d:"diamond",j:"joker"}[n[0]],t=parseInt(n.substr(1));return{shape:r,num:t}}var o=window.Materialize,d=r(12),c=r(11),u=r(13),l=r(14);n=e.exports=function(e){function n(e){var n=$("#gameDiv .deck"),r=n.find(".game-card-j0"),t=n.find("spade"==c.bidShape?".game-card-d14":".game-card-s14");if(r.parents(".deck-card").addClass("deck-card-selectable"),t.parents(".deck-card").addClass("deck-card-selectable"),1==c.trick&&c.president==c.selfIndex){var a=void 0;for(a=0;a<10&&c.deck[a].shape==c.bidShape;a++);if(10!=a)return $(".deck-card").addClass("deck-card-selectable"),void $(".deck-card .game-card-shape-"+c.bidShape[0]).parents(".deck-card").removeClass("deck-card-selectable")}if(e.jcall){if(0!==r.length)return}else if(e.shaperq){var i=n.find(".game-card-shape-"+e.shaperq[0]);if(0!==i.length)return void i.parents(".deck-card").addClass("deck-card-selectable")}$(".deck-card").addClass("deck-card-selectable")}function r(e){if("joker"==e.shape)return $("<div/>").addClass("has-slot has-joker").text("Joker");var n=["2","3","4","5","6","7","8","9","10","J","Q","K","A"][e.num-2];return $("<div/>").addClass("has-slot").addClass("has-"+e.shape).text(n)}e.cprq=function(e){o.toast("카드를 내주세요.",1500);var r=$(".player-self .game-card-container");d(r,"button",[["button",[["text","카드 내기"],["disabled",!0]]]]),n(e);var t=$(".deck-card-selectable");t.click(function(){$(".deck-card").removeClass("deck-card-selected"),$(this).addClass("deck-card-selected"),r.find("button").prop("disabled",!1)}),t.dblclick(function(){r.find("button").click()}),r.find("button").click(function(){var e=$(".deck-card-selected");1!=e.length&&o.toast("카드를 선택해주세요.",1500);var n=s(e.find(".game-card"));if(1!=c.trick&&3==n.num&&c.starter==c.selfIndex&&("clover"==c.bidShape&&"spade"==n.shape||"clover"!=c.bidShape&&"clover"==n.shape)){var r=$("#jokerCallModal");r.find("button[name=no]").click(function(){l.sendCardPlay(e.index(".deck-card"))}),r.find("button[name=yes]").click(function(){l.sendCardPlay(e.index(".deck-card"),{jcall:!0})}),r.modal({dismissible:!1}),r.modal("open")}else"joker"==n.shape&&c.starter==c.selfIndex?!function(){var n=$("#jokerModal"),r=n.find("select[name=srq]");r.val("none"),n.modal({dismissible:!1}),n.find("button").click(function(){var n=r.val();"none"==n&&(n=void 0),l.sendCardPlay(e.index(".deck-card"),{callShape:n})}),n.modal("open")}():l.sendCardPlay(e.index(".deck-card"))})},e.jrq=function(e){var n=e.shaperq;o.toast("조커로 "+c.shapeStringTable[n]+"를 불렀습니다.",2e3)},e.pcp=function(e){var n=e.card,r=$($(".player-slot")[e.player]);"card"==c.ftype&&c.fargs.shape==n.shape&&c.fargs.num==n.num&&r.addClass("player-leading");var t=r.find(".game-card-container"),i=n.shape[0]+n.num;d(t,"game-card",[[null,[["addClass","game-card-"+i],["card",i]]]]),a()},e.tend=function(e){var n=$($(".player-has")[e.winner]),a=$(".player-slot .game-card"),i=$(".last-trick");i.empty(),a.each(function(){var e=s($(this));i.append(r(e)),e.num>=10&&n.append(r(e))}),"first"==c.ftype&&c.president!=e.winner&&2!=$(".player-leading").length&&c.trick<=4&&$($(".player-slot")[e.winner]).addClass("player-leading"),a.fadeOut(1e3),c.starter=e.winner,t()},e.gend=function(e){var n=c.bidCount,r=20-e.oppcc,t=void 0;e.setUser?!function(){t=$("#gameEndWithSetModal"),t.find(".set").text("게임 결과 - 셋 ("+c.gameUsers[e.setUser].username+")");var n=t.find(".deck");n.empty(),e.setDeck.forEach(function(e){var r=[e.shape,e.num],t=r[0],a=r[1],i=d(null,"deck-card"),s=t[0]+a;i.find(".game-card").attr("card",s).addClass("game-card-"+s).addClass("game-card-shape-"+t[0]),n.append(i)})}():t=$("#gameEndModal");var a=t.find(".modal-content p.score");r>=n?a.text("["+r+"/"+n+"] 여당 승리입니다."):a.text("["+r+"/"+n+"] 야당 승리입니다."),u.playing=!1,t.modal({dismissible:!0,complete:function(){u.playing||(u.viewRoom(),$("#title").text("openMighty"))}}),t.modal("open")}},n.issueTrickStart=t,n.initGame=i},function(e,n){"use strict";var r=function(){function e(e,n){var r=[],t=!0,a=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(t=(s=o.next()).done)&&(r.push(s.value),!n||r.length!==n);t=!0);}catch(e){a=!0,i=e}finally{try{!t&&o.return&&o.return()}finally{if(a)throw i}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return e(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();e.exports=function(e){function n(){var n=129,i=185,s=document.createElement("canvas");s.width=n,s.height=i;var o=s.getContext("2d"),d=[];a.forEach(function(e){var a=r(e,3),c=a[0],u=a[1],l=a[2];o.drawImage(t,u,l,n,i,0,0,n,i);var f=s.toDataURL();d.push(".game-card-"+c+" {  background-image: url("+f+");}")}),$("<style>").prop("type","text/css").html(d.join("")).appendTo("head"),e&&e()}var t=new Image;t.onload=n,t.src="/images/cards/sprite.png";var a=[["c10",129,0],["c11",774,370],["c12",258,0],["c13",0,185],["c14",129,185],["c2",258,185],["c3",387,0],["c4",387,185],["c5",516,0],["c6",516,185],["c7",0,370],["c8",129,370],["c9",258,370],["d10",387,370],["d11",516,370],["d12",645,0],["d13",645,185],["d14",645,370],["d2",0,555],["d3",129,555],["d4",258,555],["d5",387,555],["d6",516,555],["d7",645,555],["d8",774,0],["d9",774,185],["h10",0,0],["h11",774,555],["h12",903,0],["h13",903,185],["h14",903,370],["h2",903,555],["h3",0,740],["h4",129,740],["h5",258,740],["h6",387,740],["h7",516,740],["h8",645,740],["h9",774,740],["j0",903,740],["s10",1032,0],["s11",1032,185],["s12",1032,370],["s13",1032,555],["s14",1032,740],["s2",0,925],["s3",129,925],["s4",258,925],["s5",387,925],["s6",516,925],["s7",645,925],["s8",774,925],["s9",903,925]]}}]);