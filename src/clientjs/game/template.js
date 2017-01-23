/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const Materialize = window.Materialize;

const jqueryMethods = [
    'text', 'val', 'submit', 'click', 'remove', 'empty',
    'addClass', 'removeClass',' toggleClass'
];

const properties = [
    'disabled'
];

let $templateZip;

$(function() {
    $templateZip = $('#game-template');
    $templateZip.detach();
});

module.exports = function ($parent, name, attrs) {
    const $template = $templateZip.find('#template-' + name).clone().removeAttr('id');
    let $elm;

    if(attrs) {
        // Set attributes
        for (let i = 0; i < attrs.length; i++) {
            let [selector, attributes] = attrs[i];
            $elm = selector ? $template.find(selector) : $template;
            if ($elm.length != 1) {
                Materialize.toast('Invalid selector : ' + selector, 4000);
                console.log('Invalid selector', attrs[i]);
                continue;
            }

            if (Array.isArray(attributes[0])) {
                attributes.forEach(applyAttribute);
            }
            else {
                if(attributes === null || typeof attributes == "string") {
                    attributes = [attrs[i][1], attrs[i][2]];
                }
                applyAttribute(attributes);
            }
        }
    }

    function applyAttribute(attribute) {
        const [attr, value] = attribute;
        if (jqueryMethods.indexOf(attr) != -1) $elm[attr](value);
        else if (properties.indexOf(attr) != -1) $elm.prop(attr, value);
        else $elm.attr(attr, value);
    }


    if($parent) {
        $parent.empty();
        $parent.append($template);
    }

    $('select').material_select();

    return $template;
};

module.exports.getTemplate = function (name) {
    return $templateZip.find('#template-' + name);
};
