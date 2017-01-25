/**
 * Created by whyask37 on 2017. 1. 23..
 */

"use strict";

const mutils = require('./../server/logic/mutils');
const _ = require('underscore');

function createZeroArray(length) {
    return new Array(length).fill(0);
}

function applyOneHotEncoding(env, maxval, v) {
    for(let i = 0 ; i < maxval ; i++) {
        if(i == v) env[i] = 1;
        else env[i] = 0;
    }
}

function createOneHotEncoding(maxval, v) {
    const arr = createZeroArray(maxval);
    applyOneHotEncoding(arr, maxval, v);
    return arr;
}


// 플레이할 때 필요한 것 - 모든 플레이어 공통
// 1. 지금 트릭 수 (1~10)
// 2. 트릭에서 누가 선 플레이어인지 (0~4 one-hot encoding)
// 3. 트릭에서 내가 몇번째로 내는지 (0~4 one-hot encoding)
// 4. 기루다 문양 (0~4 one-hot encoding)
// 5. 주공이 누구인지 (0~4 one-hot encoding)
// 6. 프렌드가 누구인지 (0~5 one-hot encoding, 5: 아직 모름)
// 7. 지난 트릭까지 나온 카드들 (0~52 one-hot encoding)
// 8. 지난 트릭에서 플레이어가 어떤 카드를 냈는지 (4 * 5(문양), 각 문양은 그냥 2~14로 continuous하게 가정)

function GameEnv(game) {
    this.game = game;

    this.currentTrick = [0];
    this.startPlayer = createZeroArray(5);
    this.currentPlayer = createZeroArray(5);
    this.giruda = createOneHotEncoding(5, mutils.bidShapes.indexOf(game.bidShape));
    this.president = createOneHotEncoding(5, game.president);
    this.friend = createZeroArray(6);
    this.gotCards = createZeroArray(5);
    this.discardedCards = [
        createZeroArray(53),
        createZeroArray(53),
        createZeroArray(53),
        createZeroArray(53),
        createZeroArray(53),
    ];
    this.playerCards = createZeroArray(20);
}
exports = module.exports = GameEnv;

exports.createZeroArray = createZeroArray;
exports.applyOneHotEncoding = applyOneHotEncoding;

////

GameEnv.prototype.onTrickStart = function () {
    const game = this.game;

    this.currentTrick[0] = game.currentTrick;
    applyOneHotEncoding(this.startPlayer, 5, game.startTurn);
    this.playerCards.fill(0);
};

GameEnv.prototype.onTurnStart = function () {
    applyOneHotEncoding(this.currentPlayer, 5, this.game.currentTurn);
    // this.logEnv();
};

GameEnv.prototype.onTurnEnd = function (card) {
    const game = this.game;

    const slotIndex = game.playedCards.length - 1;
    const sID = (card.cardEnvID / 13) | 0;
    const nID = card.cardEnvID % 13 + 2;
    if(slotIndex != 4) this.playerCards[slotIndex * 5 + sID] = nID;
    this.discardedCards[game.currentTurn][card.cardEnvID] = 1;
    this.gotCards = _.map(game.obtainedCards, (obc) => obc.length);

    if(game.friend !== null) {
        applyOneHotEncoding(this.friend, 5, game.friend);
    }
};

GameEnv.prototype.logEnv = function () {
    console.log('============ envlog ===========');
    console.log('currentTrick', this.currentTrick.join(','));
    console.log('startPlayer', this.startPlayer.join(','));
    console.log('currentPlayer', this.currentPlayer.join(','));
    console.log('giruda', this.giruda.join(','));
    console.log('president', this.president.join(','));
    console.log('friend', this.friend.join(','));
    console.log('dc[0]', this.discardedCards[0].join(''));
    console.log('dc[1]', this.discardedCards[1].join(''));
    console.log('dc[2]', this.discardedCards[2].join(''));
    console.log('dc[3]', this.discardedCards[3].join(''));
    console.log('dc[4]', this.discardedCards[4].join(''));
    console.log('playerCard', this.playerCards.join(','));
    console.log(this.getEnvArray().length);
};

GameEnv.prototype.getEnvArray = function () {
    return [].concat(
        this.currentTrick,
        this.startPlayer,
        this.currentPlayer,
        this.giruda,
        this.president,
        this.friend,
        this.gotCards,
        this.discardedCards[0],
        this.discardedCards[1],
        this.discardedCards[2],
        this.discardedCards[3],
        this.discardedCards[4],
        this.playerCards
    );
};
