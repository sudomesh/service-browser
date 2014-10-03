#!/usr/bin/env node

/*
  Copyright 2014 Marc Juul and MaxB
  License: AGPLv3

  This file is part of service-browser.

  service-browser is free software: you can redistribute it
  and/or modifyit under the terms of the GNU Affero General
  Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any
  later version.

  service-browser is distributed in the hope that it will be
  useful, but WITHOUT ANY WARRANTY; without even the implied
  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
  PURPOSE.  See the GNU Affero General Public License for
  more details.

  You should have received a copy of the GNU Affero General
  Public License along with service-browser.
  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

var path = require('path');
var http = require('http');
var express = require('express');
var sockets = require('./sockets.js');
var services = require('./services.js');

var config = require('./config.js');

services.browser.start();

var app = express();
var server = http.createServer(app);

sockets.socket.installHandlers(server, { prefix: '/websocket' });

// serve static content from the /www dir at /static
app.use('/static/', express.static(path.join(__dirname, 'www')));

console.log('Listening on ' + config.hostname + ':' + config.port);
server.listen(config.port, config.hostname);
