var test = require('tape');
var level = require('level');
var db = level(__dirname + '/db/test.db', { encoding: 'json' });

var services = [
  {
    name: "Maxb OwnCloud",
    scope: 'peoplesopen.net',
    description: 'Maxb OwnCloud Service',
    type: 'storage',
    region: 'oakland',
    hostname: 'mini.local',
    port: 80
  },
  {
    name: "Lake Merrit Dog Club",
    scope: 'peoplesopen.net',
    description: 'Lake Merrit Dog Club Calendar',
    type: 'storage',
    region: 'oakland',
    hostname: 'mini.local',
    port: 80
  }
]

// TODO
// constuct key hash from unique name.
// use hash to constuct key and look for key in db
function key_hash(str) {
  var hash;
  for (var i=0; i < str.length; i += 1) {
    var chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  hash = Math.abs(hash).toString(16);
  return hash;
};

function construct_key(service) {
  var sufix = key_hash(service.name);
  return 'service!' + sufix;
};

function already_in_db(service, cbmesh) {
  // Check to see if the service is already in the db
  // console.log("callback = " + callback);
  db.get(construct_key(service), function (err, value) {
    var found;
    if (err) {
      found = false;
    } else {
      found = true;
    }
    cbmesh(found, value, err);

  });
};

already_in_db(services[0], function(found, value, err) {
  console.log("found: " + found);
  console.log("val: " + value);
  console.log("err: " + err);
});
already_in_db(services[1], function(found, value, err) {
  console.log("found: " + found);
  console.log("val: " + value);
  console.log("err: " + err);
});


test('check if service is already in db', function (t) {
  t.plan(2);

  //test when service is already in db
  already_in_db(services[0], function(found) {
    t.true(found, 'service already in db');
  });
  already_in_db(services[1], function(found) {
    t.false(found, 'service not already in db');
  });
});
