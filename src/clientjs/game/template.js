/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const Materialize = window.Materialize;

const jqueryMethods = [
    'text', 'val', 'submit', 'click', 'remove', 'empty',
];

module.exports = function ($parent, name, attrs) {
    const $template = $('#template-' + name).clone().removeAttr('id');
    if($parent) {
        $parent.empty();
        $parent.append($template);
    }

    if(!attrs) return $template;

    // Set attributes
    let $elm;
    for(let i = 0 ; i < attrs.length ; i++) {
        const [selector, attributes] = attrs[i];
        $elm = selector ? $template.find(selector) : $template;
        if($elm.length != 1) {
            Materialize.toast('Invalid selector : ' + selector, 4000);
            console.log('Invalid selector', attrs[i]);
            continue;
        }

        if(Array.isArray(attributes[0])) {
            attributes.forEach(applyAttribute);
        }
        else applyAttribute(attributes);
    }

    function applyAttribute(attribute) {
        const [attr, value] = attribute;
        if(jqueryMethods.indexOf(attr) != -1) $elm[attr](value);
        else $elm.attr(attr, value);
    }

    return $template;
};
