'use strict';

var db = require('./db.js');

var mdns = require('mdns2');
var util = require('util');
var sockets = require('./sockets.js');

function createUnique (service) {
    // mdns does this great thing where they'll automatically resolve
    // nameing conflicts so this is indeed a unique identifier even without hostname
    return service.replyDomain + service.type.protocol + '.' + encodeURIComponent(service.type.name) + '.' + service.name.replace(/ /, '');
}

// TODO need to listen for all service types
// dev note: try udisks-ssh instead of http
exports.browser = mdns.createBrowser(mdns.makeServiceType('http', 'tcp'));

exports.browser.on('serviceUp', function (service) {
  // ignore other service browsers
  if (service.txtRecord && service.txtRecord.scope && service.txtRecord.type && (service.txtRecord.scope == 'peoplesopen.net') && (service.txtRecord.type == 'service-browser')) {
    console.log('ignoring other service browser on ' + util.inspect(service.addresses));
  }

  service.unique = createUnique(service);

  db.put(service.unique, service, function () {
    console.log('remembering service ' + service.unique);
    sockets.broadcast({
      type: 'service',
      action: 'up',
      service: service
    });
  });
});

exports.browser.on('serviceDown', function (service) {
    // ignore other service browsers
    if (service.txtRecord && service.txtRecord.scope && service.txtRecord.type && (service.txtRecord.scope == 'peoplesopen.net') && (service.txtRecord.type == 'service-browser')) {
      console.log('ignoring other service browser on ' + util.inspect(service.addresses));
    }

    service.unique = createUnique(service);

    db.del(service.unique, function () {
      console.log('forgetting service ' + service.unique);
      sockets.broadcast({
        type: 'service',
        action: 'down',
        service: service
      });
    });
});

exports.browser.on('error', function (err) {
  console.log('mdns error: ' + err);
});