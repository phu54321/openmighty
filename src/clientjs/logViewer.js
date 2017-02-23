/**
 * Created by whyask37 on 2017. 2. 22..
 */

let loadingGameLog = false;

window.viewGameLog = function (gameID) {
    gameID |= 0;

    if(loadingGameLog) return;  // 이미 게임 로그를 불러오고 있다.

    $.ajax({
        type: 'GET',
        url: '/gamelog/' + gameID + '?popup=1',
        success: function(data) {
            const $gameLogModal = $('#gameLogModal');
            $gameLogModal.find('.modal-content').html(data);
            $gameLogModal.find('.modal-footer a').attr('href', '/gamelog/' + gameID);
            $gameLogModal.modal();
            $gameLogModal.modal('open');
            loadingGameLog = false;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
            loadingGameLog = false;
        }
    });
    loadingGameLog = true;
};

