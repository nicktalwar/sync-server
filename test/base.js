process.env.NODE_ENV = 'test';
var config = require('../config/test.js');
var mongoose = require('../lib/mongoose');

before(function (done) {
  for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
  }
  return done();
});

after(function (done) {
  mongoose.disconnect();
  return done();
});

module.exports = {
  database: config.database
}