'use strict';

var db = require('./db.js');
var sockjs = require('sockjs');
var clients = [];

exports.socket = sockjs.createServer();

// send message to all clients
exports.broadcast = function (message) {
  if (typeof message != 'string') {
    message = JSON.stringify(message);
  }

  clients.forEach(function (client) {
    client.write(message);
  });
};

exports.send_all_services = function (client) {
  //broadcast all the services in the db to the client
  var serviceStream = db.createValueStream({ start: 'service!', end: 'service~' });
  serviceStream.on('data', function (service){
    client.write(JSON.stringify({
      type: 'service',
      action: 'up',
      service: service
    }));
  });
};

exports.socket.on('connection', function (conn) {
  clients.push(conn);
  console.log('New client connected (' + clients.length + ' total)');
  exports.send_all_services(conn);

  conn.on('close', function() {
    var i = clients.indexOf(conn);
    if ( i && ( i >= 0 ) ) {
      clients.splice(i, 1); // remove the client
    }

    console.log('Client disconnected (' + clients.length + ' total)');
  });

  conn.on('service/downvote', function (data) {

  });

  conn.on('service/upvote', function (data) {

  });
});