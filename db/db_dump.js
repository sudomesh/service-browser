var level = require('level');
var db = level(__dirname + '/../db/services.db', { encoding: 'json' });

var stream = db.createReadStream({ start: 'service!', end: 'service~' });

stream.on('data', function (data) {
  console.log(data);
});
