/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const Materialize = window.Materialize;

module.exports = function ($parent, name, attrs) {
    const $template = $('#template-' + name).clone().removeAttr('id');
    if($parent) {
        $parent.empty();
        $parent.append($template);
    }

    if(!attrs) return $template;

    // Set attributes
    for(let i = 0 ; i < attrs.length ; i++) {
        const [selector, attributes] = attrs[i];
        const $elm = selector ? $template.find(selector) : $template;
        if($elm.length != 1) {
            Materialize.toast('Invalid selector : ' + selector, 4000);
            continue;
        }

        if(Array.isArray(attributes[0])) {
            attributes.forEach((attr) => applyAttribute($elm, attr));
        }
        else applyAttribute($elm, attributes);
    }

    function applyAttribute($elm, attribute) {
        const [attr, value] = attribute;
        if (attr == 'text') $elm.text(value);
        else if (attr == 'val') $elm.val(value);
        else $elm.attr(attr, value);
    }

    return $template;
};
