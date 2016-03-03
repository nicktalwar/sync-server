var base = require('../base');
var assert = require('assert');
var factory = require('../factory');
var ItemController = require('../../controllers/item');
var nock = require('nock');
var async = require('async');
var User = require('../../models/user');
var Storage = require('../../models/storage');
nock.disableNetConnect();

var storeTextFile = function(user, storage, userStorageAuth, statusCode, done) {
  var path = storage.storeFilePath(userStorageAuth, factory.textFileAttributes.subpath);
  nock('https://' + storage.host).put(path, factory.textFileAttributes.body).reply(statusCode, factory.textFileAttributes.responseBody);

  ItemController.storeFile(user, storage, factory.textFileAttributes.subpath, factory.textFileAttributes.body, function(error, responseBody) {
    done(error, responseBody);
  });
};

describe('itemController', function() {
  before(base.clearDatabase);

  describe('storeFile', function() {
    // Get userStorageAuth
    before(function(done) {
      var self = this;
      factory.userStorageAuth(function(error, userStorageAuth) {
        self.userStorageAuth = userStorageAuth;
        done(error);
      });
    });

    // Get user
    before(function(done) {
      var self = this;
      User.findById(self.userStorageAuth.userId, function(error, user) {
        self.user = user;
        done(error);
      });
    });

    // Get storage
    before(function() {
      this.storage = factory.storage();
    });

    describe('with string body and txt extension', function(done) {
      before(function(done) {
        var self = this;
        storeTextFile(this.user, this.storage, this.userStorageAuth, 200, function(error, responseBody) {
          self.responseBody = responseBody;
          done(error);
        });
      });

      it('is stored with matching response body', function() {
        assert.notEqual(JSON.stringify(this.responseBody), undefined);
        assert.equal(JSON.stringify(this.responseBody), JSON.stringify(factory.textFileAttributes.responseBody));
      });
    });

    describe('with path to existing file on storage', function(done) {
      before(function(done) {
        var self = this;
        storeTextFile(this.user, this.storage, this.userStorageAuth, 409, function(error) {
          self.error = error;
          done();
        });
      });

      it('fails request with status code 409', function() {
        assert.equal(this.error.message.hasSubstring(this.storage.requestErrorMessage(409)), true);
      });
    });

    it('fails attempt without user');
    it('fails attempt without storage');
    it('fails attempt without subpath');
    it('fails attempt without body');
    it('fails attempt with improper user');
    it('fails attempt with improper storage');
    it('fails attempt with improper subpath');
    it('fails attempt with improper body');
    it('fails attempt with improper done');
  });

  describe('storeItem', function() {
    // Initiate item and storage
    before(function(done) {
      var self = this;
      factory.item(function(error, item) {
        self.item = item;
        self.storage = new Storage({id: item.storageId});
        done(error);
      });
    });

    before(function(done) {
      var self = this;
      factory.userStorageAuth(this.item.userId, this.item.storageId, function(error, userStorageAuth) {
        self.userStorageAuth = userStorageAuth;
        done();
      });
    });

    before(function(done) {
      var path = this.storage.storeFilePath(this.userStorageAuth, this.item.path);
      nock('https://' + this.storage.host).put(path, JSON.stringify(this.item.data)).reply(200, factory.textFileAttributes.responseBody);

      var self = this;
      ItemController.storeItem(this.item, function(error, responseBody) {
        self.responseBody = responseBody;
        done(error);
      });
    });

    it('is stored with matching response body', function() {
      assert.notEqual(JSON.stringify(this.responseBody), undefined);
      assert.equal(JSON.stringify(this.responseBody), JSON.stringify(factory.textFileAttributes.responseBody));
    });

    it('fails attempt without item');
    it('suceeds without done');
    it('fails attempt with improper item');
    it('fails attempt with improper done');
  });

  it('syncAllForAllContentTypes');
  it('syncAll');
  it('syncPage');
  it('syncItem');
  it('getFile');
});