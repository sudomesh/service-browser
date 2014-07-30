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

function already_in_db(service) {
  // Check to see if the service is already in the db
  db.get(construct_key(service), function (err, value) {
    if (err) {
      result = true;
      //callbacks didn't work here...
    };
  });
};

console.log(already_in_db(services[0]), function(val){
  return val;
});
already_in_db(services[0]);
already_in_db(services[1]);

test('check if service is already in db', function (t) {
  t.plan(2);

  //test when service is already in db
  t.true(already_in_db(services[0]), 'service already in db')
  
  //test when service is not in db
  t.false(already_in_db(services[1]), 'service not in db')
});
