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

    describe('with string body and txt extension', function() {
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

    describe('with path to existing file on storage', function() {
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

    describe('without user', function() {
      before(function(done) {
        var self = this;
        storeTextFile(null, this.storage, this.userStorageAuth, 200, function(error) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('user not provided'), true);
      });
    });

    describe('without valid user', function() {
      before(function(done) {
        var self = this;
        storeTextFile('user', this.storage, this.userStorageAuth, 200, function(error) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('invalid user provided'), true);
      });
    });

    describe('without storage', function() {
      before(function(done) {
        var self = this;
        ItemController.storeFile(this.user, null, factory.textFileAttributes.subpath, factory.textFileAttributes.body, function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('storage not provided'), true);
      });
    });

    describe('without valid storage', function() {
      before(function(done) {
        var self = this;
        ItemController.storeFile(this.user, 'storage', factory.textFileAttributes.subpath, factory.textFileAttributes.body, function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('invalid storage provided'), true);
      });
    });

    describe('without subpath', function() {
      before(function(done) {
        var self = this;
        ItemController.storeFile(this.user, this.storage, null, factory.textFileAttributes.body, function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('subpath not provided'), true);
      });
    });

    describe('with invalid subpath', function() {
      before(function(done) {
        var self = this;
        ItemController.storeFile(this.user, this.storage, 3, factory.textFileAttributes.body, function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('invalid subpath provided'), true);
      });
    });

    describe('without body', function() {
      before(function(done) {
        var self = this;
        ItemController.storeFile(this.user, this.storage, factory.textFileAttributes.subpath, null, function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('body not provided'), true);
      });
    });

    describe('with invalid body', function() {
      before(function(done) {
        var self = this;
        ItemController.storeFile(this.user, this.storage, factory.textFileAttributes.subpath, 3, function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('invalid body provided'), true);
      });
    });

    describe('with invalid done', function() {
      before(function(done) {
        var self = this;
        try {
          ItemController.storeFile(this.user, this.storage, factory.textFileAttributes.subpath, factory.textFileAttributes.body, 3);
        } catch(error) {
          self.error = error;
          done();
        }
      });

      it('fails with error', function() {
        assert.equal(this.error.message.hasSubstring('invalid done provided'), true);
      });
    });
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

    describe('without item', function() {
      before(function(done) {
        var self = this;
        ItemController.storeItem(null, function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('returns error', function() {
        assert.equal(this.error.message, 'item not provided');
      });
    });

    describe('without valid item', function() {
      before(function(done) {
        var self = this;
        ItemController.storeItem('item', function(error, responseBody) {
          self.error = error;
          done();
        });
      });

      it('returns error', function() {
        assert.equal(this.error.message, 'invalid item provided');
      });
    });

    describe('without item or done throws error', function() {
      before(function() {
        var path = this.storage.storeFilePath(this.userStorageAuth, this.item.path);
        nock('https://' + this.storage.host).put(path, JSON.stringify(this.item.data)).reply(200, factory.textFileAttributes.responseBody);

        try {
          ItemController.storeItem();
        } catch(error) {
          this.error = error;
        }
      });

      it('throws error', function() {
        assert.equal(this.error.message, 'item not provided');
      });
    });
  });

  it('syncAllForAllContentTypes');
  it('syncAll');
  it('syncPage');
  it('syncItem');
  it('getFile');
});