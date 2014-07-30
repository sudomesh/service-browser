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
var _ = require('lodash');
var level = require('level');
var db = level(__dirname + '/db/services.db', { encoding: 'json' });

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
  //go broadcast all services in services array to the client
  var i, service;
  for(i=0; i < services.length; i++) {
      service = services[i];
      client.write(JSON.stringify({
          type: 'service',
          action: 'up',
          service: service
      }));
  }
  //broadcat all the services in the db to the client
  var serviceStream = db.createValueStream({start: 'service!', end: 'service~'});
  serviceStream.on('data', function (data) {
    client.write(JSON.stringify(data));
  });
}

function alreadyContains(service) {
  // Check to see if we already have it in our services list
  if (_.find(services, function(s) {
    return s.unique === service.unique;
  })) {
    return false;
  } else {
    return true;
  }
}

function already_in_db(service) {
  // Check to see if the service is already in the db
  var serviceStream = db.createValueStream({start: 'service!', end: 'service~'});
  serviceStream.on('data', function (data) {
    var s = data.value.service;
    if (service.unique === s.unique) {
      return true;
    } else {
      return false;
    };
  });
}

// only allow services of the types we're interested in
function filter(service) {
    return service;
}

function createUnique(service) {
    // mdns does this great thing where they'll automatically resolve
    // nameing conflicts so this is indeed a unique identifier even without hostname
    return service.replyDomain + service.type.protocol + '.' + encodeURIComponent(service.type.name) + '.' + service.name.replace(/ /, ''); 
}

function newKey(prefix) {
  var key = prefix + '!' + Math.random().toString(16).slice(2);
  return key.toString();
};

// TODO need to listen for all service types
// dev note: try udisks-ssh instead of http
var browser = mdns.createBrowser(mdns.makeServiceType('http', 'tcp'));
browser.on('serviceUp', function(service) {
    console.log('service coming up: ');
    console.log(service);
    service.unique = createUnique(service);
    //add service to the services array
    if(alreadyContains(service) && filter(service)) {
      services.push(service);
      broadcast({
          type: 'service',
          action: 'up',
          service: service
      });
    }
    //add service to the db
    if(already_in_db(service) && filter(service)) {
      var new_key = newKey('service');
      var new_value = {
        type: 'service',
        action: 'up',
        service: service
      };
      db.put(new_key, new_value, function () {
        console.log('adding new service to the db');
        broadcast(new_value);
      });
    }
});

browser.on('serviceDown', function(service) {
    console.log('service coming down: ');
    console.log(service);
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

browser.on('error', function (err) {
  console.log('mdns error: ' + err);
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

// serve static content from the /www dir at /static
app.use('/static/', express.static(path.join(__dirname, 'www')));

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
