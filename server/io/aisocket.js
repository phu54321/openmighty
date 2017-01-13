/**
 * Created by whyask37 on 2017. 1. 12..
 */

const cmdproc = require("./cmdproc");

function AISocket(room, userEntry) {
    "use strict";

    this.room = room;
    this.userEntry = userEntry;
}

AISocket.prototype.cmd = function (msg) {
    "use strict";

    const cmdProcessor = cmdproc[msg.type];
    if(!cmdProcessor) {
        console.log('[' + this.userEntry.useridf + '] 알 수 없는 명령입니다 : ' + msg.type);
        return false;
    }
    console.log('[' + this.userEntry.useridf + ' Out]', msg);
    return cmdProcessor(this, this.room, this.userEntry, msg);
};

AISocket.prototype.emit = function (type, msg) {
    "use strict";

    console.log('[' + this.userEntry.useridf + ' In]', msg);
    if(type == 'cmd') {
        this.onCommand(msg);
    }
};

AISocket.prototype.onCommand = function (msg) {
    setTimeout(() => {
        "use strict";
        if(msg.type == 'bidrq') {
            // Always pass
            this.cmd({
                type: 'bid',
                shape: 'pass'
            });
        }
    }, 1);
};

module.exports = AISocket;
