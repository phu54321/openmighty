/**
 * Created by whyask37 on 2017. 2. 4..
 */

class GameLog {
    constructor() {
        this.logs = [];
    }
    log(msg) {
        this.logs.push(msg);
    }
    toString() {
        return JSON.stringify(this.logs);
    }
}

module.exports = GameLog;
