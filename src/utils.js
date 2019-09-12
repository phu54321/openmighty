/**
 * Created by whyask37 on 2017. 2. 17..
 */

 function normalizeTime (time) {
    if (typeof time === 'string') {
        if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(time)) {
            return new Date(time + " UTC");
        } else {
            return new Date(time);
        }
    } else if (typeof time === 'number') {
        const newDate = new Date(0);
        newDate.setUTCMilliseconds(time);
        return newDate;
    } else return time;
 }
 exports.normalizeTime = normalizeTime;
 
/**
 * Format date
 * @param time
 * @returns {string}
 */
exports.formatTime = function (time, useMillisecond) {
    time = normalizeTime(time);

    if(useMillisecond === undefined) useMillisecond = true;

    const yyyy = time.getFullYear();
    const mm = time.getMonth() < 9 ? "0" + (time.getMonth() + 1) : (time.getMonth() + 1); // getMonth() is zero-based
    const dd  = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
    const hh = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
    const min = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
    const ss = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
    const ms = useMillisecond ? '.' + ("000" + time.getMilliseconds()).substr(-3) : "";
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}${ms}KST`;
};
