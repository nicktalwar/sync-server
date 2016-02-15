var base = require('../base');
var assert = require('assert');
var factory = require('../factory');
var User = require('../../models/user');
var mongoose = require('../../lib/mongoose');

describe('new user', function() {
  before(base.clearDatabase);
  
  before(function() {
    this.user = new User(factory.userAttributes);
  });

  it('has name', function() {
    assert.equal(this.user.name, factory.userAttributes.name);
  });

  it('has email', function() {
    assert.equal(this.user.email, factory.userAttributes.email);
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
    User.findOrCreate(factory.userAttributes, function(error, user) {
      assert.equal(user.id, self.user.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserAttributes = factory.userAttributes;
    newUserAttributes.name = 'Chris Mills';

    var self = this;
    User.findOrCreate(newUserAttributes, function(error, user) {
      assert.equal(typeof user.id, 'string');
      assert.notEqual(user.id, self.user.id);
      done(error);
    });
  });
});