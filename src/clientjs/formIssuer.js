"use strict";

window.issueLogin = function () {
    'use strict';
    issueForm(
        '/login',
        'loginForm',
        [
            ['username', 'username', formVerifier_NoBlank, '아이디를 입력하세요.'],
            ['password', 'password', formVerifier_NoBlank, '패스워드를 입력하세요.'],
        ],
        function() {
            window.location.reload(true);
        }
    );
};


window.issueRegister = function () {
    'use strict';
    issueForm(
        '/join',
        'registerForm',
        [
            ['username', 'username', formVerifier_NoBlank, '아이디를 입력하세요.'],
            ['password', 'password', formVerifier_NoBlank, '패스워드를 입력하세요.'],
            ['email', 'email', formVerifier_NoBlank, '이메일을 입력하세요.'],
        ],
        function() {
            window.alert("메일에 있는 링크를 클릭해서 계정을 활성화하세요.");
            window.location.href = "/";
        }
    );
};

window.issueLogout = function () {
    $.ajax({
        type: 'POST',
        url: '/logout',
        success: function(data) {
            window.location.reload(true);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
        }
    });
}


//////////


function formVerifier_AlwaysAllow(value) {
    return true;
}

function formVerifier_NoBlank(value) {
    return value !== '';
}

/**
 * Form의 내용을 종합해 Ajax request를 전송합니다. 이 때 form의 input를 임시로 모두 disable시킵니다
 * @param url - ajax를 날릴 URL
 * @param formName - form의 아이디
 * @param nameTable - ajax의 파라미터 정의. 아래 형식 배열의 배열로 되어있다.
 *      [(form 내 name), (ajax 파라미터 이름), formVerifier, (verifier 실패시 메세지)]
 * @param callback(data) - ajax에서 error가 없을 때 낼 동작
 * @returns {boolean} - ajax가 제대로 보내졌는지
 */
function issueForm(url, formName, nameTable, callback) {
    'use strict';

    const targetForm = $('#' + formName);
    const ajaxData = {};

    if (!targetForm) {
        console.log('Unknown form \'' + formName + '\'');
        return false;
    }

    // Collect form values
    for(let i = 0 ; i < nameTable.length ; i++) {
        let [inputName, postName, formVerifier, errorMsg] = nameTable[i];
        if(!formVerifier) formVerifier = formVerifier_AlwaysAllow;
        if(!errorMsg) errorMsg = "허용되지 않은 입력입니다.";

        ajaxData[postName] = targetForm.find('#' + inputName).val();
        if(!formVerifier(ajaxData[postName])) {
            window.alert(errorMsg);
            return false;
        }
    }

    // Disable form temporarilly
    targetForm.find('input, textarea').prop('disabled', true);

    $.ajax({
        type: 'POST',
        url: url,
        data: ajaxData,
        dataType: 'json',
        success: function(data) {
            if(!data.error) {
                callback(data);
            }
            else {
                // Re-enable form to allow correction.
                targetForm.find('input, textarea').prop('disabled', false);
                window.alert(data.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
        }
    });
    return true;
}
