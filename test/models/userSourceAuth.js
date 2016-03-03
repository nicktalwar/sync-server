var base = require('../base');
var assert = require('assert');
var UserSourceAuth = require('../../models/userSourceAuth');
var mongoose = require('../../lib/mongoose');
var factory = require('../factory');

describe('new userSourceAuth', function() {
  before(base.clearDatabase);
  
  before(function(done) {
    var self = this;
    this.userSourceAuth = factory.userSourceAuth(function(error, userSourceAuth) {
      self.userSourceAuth = userSourceAuth;
      done(error);
    });
  });

  it('has userId', function() {
    assert.equal(this.userSourceAuth.userId, factory.userSourceAuthAttributes.userId);
  });

  it('has sourceId', function() {
    assert.equal(this.userSourceAuth.sourceId, factory.userSourceAuthAttributes.sourceId);
  });

  it('has sourceToken', function() {
    assert.equal(this.userSourceAuth.sourceToken, factory.userSourceAuthAttributes.sourceToken);
  });

  it('has sourceUserId', function() {
    assert.equal(this.userSourceAuth.sourceUserId, factory.userSourceAuthAttributes.sourceUserId);
  });

  it('can save and have id', function(done) {
    var userSourceAuth = this.userSourceAuth;
    this.userSourceAuth.save(function(error) {
      assert.equal(typeof userSourceAuth.id, 'string');
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    UserSourceAuth.findOrCreate(factory.userSourceAuthAttributes, function(error, userSourceAuth) {
      assert.equal(userSourceAuth.id, self.userSourceAuth.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserSourceAuthAttributes = factory.userSourceAuthAttributes;
    newUserSourceAuthAttributes.userId = 'newUserSourceAuthUserId';

    var self = this;
    UserSourceAuth.findOrCreate(newUserSourceAuthAttributes, function(error, userSourceAuth) {
      assert.equal(typeof userSourceAuth.id, 'string');
      assert.notEqual(userSourceAuth.id, self.userSourceAuth.id);
      done(error);
    });
  });
});