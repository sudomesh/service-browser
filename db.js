'use strict';

var level = require('level');
module.exports = level(__dirname + '/db/services.db', { encoding: 'json' });