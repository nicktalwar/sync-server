var base = require('../base');
var assert = require('assert');
var User = require('../../models/user');
var mongoose = require('../../lib/mongoose');

var userAttributes = {
  name: 'Jordan Mills',
  email: 'jordan.mills@example.com'
};

describe('new user', function() {
  before(function() {
    this.user = new User(userAttributes);
  });

  it('has name', function() {
    assert.equal(this.user.name, userAttributes.name);
  });

  it('has email', function() {
    assert.equal(this.user.email, userAttributes.email);
  });

  it('can save and have id', function(done) {
    var user = this.user;
    this.user.save(function(error) {
      assert.equal(typeof user.id, 'string');
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    User.findOrCreate(userAttributes, function(error, user) {
      assert.equal(user.id, self.user.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserAttributes = userAttributes;
    newUserAttributes.name = 'Chris Mills';

    var self = this;
    User.findOrCreate(newUserAttributes, function(error, user) {
      assert.equal(typeof user.id, 'string');
      assert.notEqual(user.id, self.user.id);
      done(error);
    });
  });
});