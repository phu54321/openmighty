/**
 * Created by whyask37 on 2017. 1. 23..
 */

"use strict";

const _ = require('lodash');
const mutils = require('./mutils');
const compareCard = mutils.compareCard;


function deckHasCard(deck, card) {
    "use strict";
    return _.find(deck, (c) => (c.shape == card.shape && c.num == card.num)) !== undefined;
}

function postGroupBy(out) {
    "use strict";
    mutils.cardShapes.forEach((shape) => {
        if(!out[shape]) out[shape] = [];
    });
    return out;
}

function stringifyDeck(deck) {
    "use strict";
    return '[' + _.map(deck, (c) => c.shape[0] + c.num).join(', ') + ']';
}


/**
 * 게임 셋을 할 수 있는 사람이 있는지 파악
 * @param room
 * @returns {number} 게임 셋을 할 수 있는 사람
 */
module.exports = function (room) {
    "use strict";
    // 세트 조건 - 앞으로 모든 트릭에서 내가 선을 먹는다.
    //  1. 마이티/조커중 하나라도 다른 사람에게 있으면 질 수 있다. 이 경우는 그냥 제외
    //  2. 남은 모든 기루다는 내게 있어야 한다.
    //  3. 모두 기루다/마이티/조커 중 하나면 OK
    //  3. 각 문양마다 짱카를 갖고 있어야함
    //      1. 짱카만 있다면 다른 사람이 그 문양을 내면 내가 선이고 내가 내도 선이다.
    //      2. 해당 문양이 아얘 없다면
    //          1. 내가 지금 선이면 상관 없고
    //          2. 다른 사람이 선이고 그 문양을 내면 내가 기루다로 간을 쳐야하니까
    //              내가 가지 모든 카드가 마이티/조커/기루다 중 하나여야함. 아니므로 실패
    //  4. 여기까지 왔으면 셋

    // console.log('calculating set');

    const discardedMap = postGroupBy(_.groupBy(room.discardedCards, (c) => c.shape));  // 문양당 버려진 카드
    const isMightyDown = deckHasCard(room.discardedCards, room.mighty);  // 마이티가 버려졌나
    const isJokerDown = (discardedMap.joker.length == 1);  // 조커가 버려졌나.
    // console.log(discardedMap, room.mighty, isMightyDown, isJokerDown);

    for(let i = 0 ; i < 5 ; i++) {
        const user = room.gameUsers[i];
        const userDeckMap = postGroupBy(_.groupBy(user.deck, (c) => c.shape));
        // console.log('checking user', i, stringifyDeck(user.deck));

        const hasMighty = deckHasCard(user.deck, room.mighty);
        const hasJoker = deckHasCard(user.deck, room.joker);

        //  1. 마이티/조커중 하나라도 다른 사람에게 있으면 질 수 있다. 이 경우는 그냥 제외
        if(!isMightyDown && !hasMighty) continue;
        if(!isJokerDown && !hasJoker) continue;

        // 2. 남은 모든 기루다는 내게 있어야 한다.
        let userGirudaCount;
        if(room.bidShape != 'none') {
            userGirudaCount = userDeckMap[room.bidShape].length;
            if(userGirudaCount + discardedMap[room.bidShape].length != 13) {
                // console.log(' - less giruda');
                continue;
            }
        }
        else userGirudaCount = 0;

        // 3. 모두 마이티/조커/기루다 면 셋
        let girudaJokerMighty = (room.currentTrick != 10 && hasJoker) ? 1 : 0;
        girudaJokerMighty += hasMighty ? 1 : 0;
        girudaJokerMighty += userGirudaCount;
        if(girudaJokerMighty == user.deck.length) return i;


        // 4. 각 문양마다 짱카를 갖고 있어야함
        let shapeIdx;
        for(shapeIdx = 0 ; shapeIdx < 4 ; shapeIdx++) {
            const checkShape = mutils.cardShapes[shapeIdx];
            if(checkShape == room.bidShape) continue;  // 기루다는 이미 체크함

            // z. 해당 문양이 아얘 없다면
            //     1. 내가 지금 선이면 상관 없고
            //     2. 다른 사람이 선이면 실수로 다른걸 낼 수 있으므로 실패
            if(userDeckMap[checkShape].length === 0) {
                if(room.startTurn != i) break;
            }

            // 1. 짱카만 있다면 다른 사람이 그 문양을 내면 내가 선이고 내가 내도 선이다.
            else {
                const userMinimumCard = _.min(userDeckMap[checkShape], (c) => c.num);
                const betterCardCount = 14 - userMinimumCard;
                const userBetterCardCount = userDeckMap[checkShape].length - 1;
                const discardedBetterCardCount = _.filter(discardedMap[checkShape], function (c) {
                    return c.num > userMinimumCard;
                }).length;
                // console.log(checkShape, userBetterCardCount, discardedBetterCardCount, betterCardCount);
                if (userBetterCardCount + discardedBetterCardCount != betterCardCount) break;
            }
        }
        if(shapeIdx != 4) continue;

        // 셋이 맞다.
        // console.log('Set', i);
        return i;
    }
    return null;
};