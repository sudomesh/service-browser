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


var util = require('util');
var path = require('path');
var http = require('http');
var express = require('express');
var sockjs = require('sockjs');
var mdns = require('mdns2');
var _ = require('lodash-node');

var config = require('./config.js');

var clients = [];
var services = [];

// send message to all clients
function broadcast(msg) {
    if(typeof(msg) != 'string') {
        msg = JSON.stringify(msg);
    }
    var i, client;
    for(i=0; i < clients.length; i++) {
        client = clients[i];
        client.write(msg);
    }
}


function send_all_services(client) {
    var i, service;
    for(i=0; i < services.length; i++) {
        service = services[i];
        client.write(JSON.stringify({
            type: 'service',
            action: 'up',
            service: service
        }));
    }
}
function checkContains(service) {
    // Check to see if we already have it in our services list
    if (_.find(services, function(s) {
      return s.unique === service.unique;
    })) {
      return false;
    } else {
      return true;
    }
}
// only allow services of the types we're interested in
function filter(service) {
    return service;
}

function createUnique(service) {
    // TODO: This might accidentally remove other services with same name and type on different hosts - we're not 
    // getting enough info back from mdns in case of serviceDown
    return service.replyDomain + service.type.protocol + '.' + service.type.name + '.' + service.name.replace(/ /, ''); 
}

// TODO need to listen for all service types
// dev note: try udisks-ssh instead of http
var browser = mdns.createBrowser(mdns.makeServiceType('http', 'tcp'));
browser.on('serviceUp', function(service) {
    console.log('service coming up: ');
    console.log(service);
    // We have to create a unique id becuase we don't have a good one from mdns2
    service.unique = createUnique(service);
    if(checkContains(service) && filter(service)) {
        services.push(service);
        broadcast({
            type: 'service',
            action: 'up',
            service: service
        });
    }
});
browser.on('serviceDown', function(service) {
    console.log('service coming down: ');
    console.log(service);
    // We have to create a unique id because we're not being handed one from mdns2
    service.unique = createUnique(service);
    if(filter(service)) {
        broadcast({
            type: 'service',
            action: 'down',
            service: service
        });
        services = _.filter(services, function(s) {
          return service.unique !== s.unique;
        });
    }
});
browser.start();

var websocket = sockjs.createServer();
websocket.on('connection', function(conn) {
    clients.push(conn);
    console.log("New client connected ("+clients.length+" total)");
    send_all_services(conn);
    conn.on('data', function(message) {
        // nothing to do here yet
    });
    conn.on('close', function() {
        var i = clients.indexOf(conn);
        if(i && (i >= 0)) {
            clients.splice(i, 1); // remove the client
        }
        console.log("Client disconnected ("+clients.length+" total)");
    });
});

var app = express();
var server = http.createServer(app);

websocket.installHandlers(server, {prefix:'/websocket'});

// serve static content from the /www dir
app.use('/', express.static(path.join(__dirname, 'www')));

// for parsing post request
app.use(express.bodyParser());

app.get('/nodes/:id', function(req, res){
    if(!req.params.id) {
        error(res, "node id must be specified in request");
        return;
    }
    console.log("retrieving node with id: " + req.params.id);

});

console.log('Listening on '+config.hostname+':'+config.port);
server.listen(config.port, config.hostname);
