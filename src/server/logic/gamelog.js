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
    print() {
        console.log('gamelog', JSON.stringify(this.logs));
    }
}

module.exports = GameLog;
