var base = require('../base');
var assert = require('assert');
var UserStorageAuth = require('../../models/userStorageAuth');
var mongoose = require('../../lib/mongoose');
var factory = require('../factory');

describe('new userStorageAuth', function() {
  before(base.clearDatabase);
  
  before(function(done) {
    var self = this;
    this.userStorageAuth = factory.userStorageAuth(function(error, userStorageAuth) {
      self.userStorageAuth = userStorageAuth;
      done(error);
    });
  });

  it('has userId', function() {
    assert.equal(this.userStorageAuth.userId, factory.userStorageAuthAttributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.userStorageAuth.storageId, factory.userStorageAuthAttributes.storageId);
  });

  it('has storageToken', function() {
    assert.equal(this.userStorageAuth.storageToken, factory.userStorageAuthAttributes.storageToken);
  });

  it('has storageUserId', function() {
    assert.equal(this.userStorageAuth.storageUserId, factory.userStorageAuthAttributes.storageUserId);
  });

  it('can save and have id', function(done) {
    var userStorageAuth = this.userStorageAuth;
    this.userStorageAuth.save(function(error) {
      assert.equal(typeof userStorageAuth.id, 'string');
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    UserStorageAuth.findOrCreate(factory.userStorageAuthAttributes, function(error, userStorageAuth) {
      assert.equal(userStorageAuth.id, self.userStorageAuth.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserStorageAuthAttributes = factory.userStorageAuthAttributes;
    newUserStorageAuthAttributes.userId = 'newUserStorageAuthUserId';

    var self = this;
    UserStorageAuth.findOrCreate(newUserStorageAuthAttributes, function(error, userStorageAuth) {
      assert.equal(typeof userStorageAuth.id, 'string');
      assert.notEqual(userStorageAuth.id, self.userStorageAuth.id);
      done(error);
    });
  });
});