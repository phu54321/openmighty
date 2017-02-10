/**
 * Created by whyask37 on 2017. 2. 4..
 */

const GAMELOG_VERSION = 2;

class GameLog {
    constructor() {
        this.logs = ['V' + GAMELOG_VERSION];
    }
    log(msg) {
        this.logs.push(msg);
    }
    toString() {
        return JSON.stringify(this.logs);
    }
}

module.exports = GameLog;
