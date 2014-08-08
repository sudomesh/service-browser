var level = require('level');

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

//parse user input
if (process.argv[2] == 'test') {
  var db = level(__dirname + '/test.db', { encoding: 'json' });
  tasks(process.argv[3])
} else if (process.argv[2] == 'development'){
  var db = level(__dirname + '/services.db', { encoding: 'json' });
  tasks(process.argv[3])
} else {
  console.log('please select a data base: [test, development]');
  console.log(' -eg. $ node db_task.js test clear');
};


function tasks(task) {
  if (task == 'clear') {
    clear_db();
  } else if (task == 'dump') {
    stream_db();
  } else if (task == 'seed') {
    seed_db();
  } else {
    console.log('please select a task: [clear, dump, seed <pat to see file>]');
    console.log(' -eg. $ node db_task.js development seed seeds/services.json');
  }
};

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

function stream_db() {
  console.log('streaming db:');
  var stream = db.createReadStream({ start: 'service!', end: 'service~' });
  stream.on('data', function (data) {
    console.log(data);
  });
};

function clear_db() {
  db.createKeyStream().on('data', function (data) {
    db.del(data, function () {
      console.log('clearing db: ', data);
    })
  })
};

function seed_db() {
  db.put(construct_key(services[0]), services[0], function () {
    console.log('adding new service ' + services[0].name + ' to the db');
  });
};
