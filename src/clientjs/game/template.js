/**
 * Created by whyask37 on 2017. 1. 20..
 */

module.exports = function (name) {
    "use strict";
    return $('#template-' + name).clone().removeAttr('id');
};
