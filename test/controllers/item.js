var base = require('../base');
var assert = require('assert');
var factory = require('../factory');
var ItemController = require('../../controllers/item');
var nock = require('nock');
nock.disableNetConnect();

var textFile = {
  body: 'hello world',
  subpath: 'storeFile.txt',
  responseBody: {
    'size': '0.011KB',
    'rev': '35e97029684fe',
    'thumb_exists': false,
    'bytes': 11,
    'modified': 'Tue, 19 Jul 2011 21:55:38 +0000',
    'path': '/storeFile.txt',
    'is_dir': false,
    'icon': 'page_white',
    'root': 'app_folder',
    'mime_type': 'text/plain'
  }
};

var storeFile = function(user, storage, userStorageAuth, statusCode, done) {
  var path = storage.storeFilePath(userStorageAuth, textFile.subpath);
  nock('https://' + storage.host).put(path, textFile.body).reply(statusCode, textFile.responseBody);

  var self = this;
  ItemController.storeFile(user, storage, textFile.subpath, textFile.body, function(error, responseBody) {
    self.responseBody = responseBody;
    done(error);
  });
};

describe('itemController', function() {
  before(base.clearDatabase);
  
  it('syncAllForAllContentTypes');
  it('syncAll');
  it('syncPage');
  it('syncItem');
  it('storeItem');
  it('getFile');

  describe('storeFile', function() {
    before(function(done) {
      var self = this;
      factory.savedUser(function(error, user) {
        self.user = user;
        done(error);
      });
    });

    before(function() {
      this.storage = factory.storage();
    });

    before(function(done) {
      var self = this;
      factory.savedUserStorageAuth(this.user, this.storage, function(error, userStorageAuth) {
        self.userStorageAuth = userStorageAuth;
        done(error);
      });
    });

    describe('with string body and txt extension', function(done) {
      before(function(done) {
        storeFile(this.user, this.storage, this.userStorageAuth, 200, done);
      });

      it('is stored with matching response body', function() {
        assert.equal(JSON.stringify(this.responseBody), JSON.stringify(this.responseBodyMock));
      });
    });

    describe('with path to existing file on storage', function(done) {
      before(function(done) {
        var self = this;
        storeFile(this.user, this.storage, this.userStorageAuth, 409, function(error) {
          self.error = error;
          done();
        });
      });

      it('fails request with status code 409', function() {
        assert.equal(this.error.message.hasSubstring(this.storage.requestErrorMessage(409)), true);
      });
    });

    it('with path');
    it('with binary body');
  });
});