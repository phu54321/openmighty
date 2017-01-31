/**
 * Created by whyask37 on 2017. 1. 30..
 */

const config      = require('../../knexfile');
const env         = 'development';
const knex        = require('knex')(config[env]);
const deasync = require('deasync');

exports = module.exports = knex;

////

exports.initScheme = function (tableName, tableGen) {
    "use strict";
    let dbInitialized = false;
    knex.schema.hasTable(tableName).then((exists) => {
        if (exists) dbInitialized = true;
        else {
            knex.schema.createTable(tableName, tableGen).then(() => {
                dbInitialized = true;
            });
        }
    });
    while(!dbInitialized) deasync.sleep(100);
};

