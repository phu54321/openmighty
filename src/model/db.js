/**
 * Created by whyask37 on 2017. 1. 30..
 */

const config      = require('../../knexfile');
const env         = 'development';
const knex        = require('knex')(config[env]);

knex.migrate.latest([config]);

module.exports = knex;
