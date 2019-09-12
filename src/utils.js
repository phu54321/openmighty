/**
 * Created by whyask37 on 2017. 2. 17..
 */

/**
 * Format date
 * @param time
 * @returns {string}
 */
exports.formatTime = function (time, useMillisecond) {
    if(useMillisecond === undefined) useMillisecond = true;
    if (typeof time === 'string') time = new Date(time);
    else if (typeof time === 'number') {
        let newDate = new Date(0);
        newDate.setUTCMilliseconds(time);
        time = newDate;
    }

    const yyyy = time.getFullYear();
    const mm = time.getMonth() < 9 ? "0" + (time.getMonth() + 1) : (time.getMonth() + 1); // getMonth() is zero-based
    const dd  = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
    const hh = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
    const min = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
    const ss = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
    const ms = useMillisecond ? '.' + ("000" + time.getMilliseconds()).substr(-3) : "";
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}${ms}KST`;
};
