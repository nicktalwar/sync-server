var base = require('../base');
var assert = require('assert');
var factory = require('../factory');
var ItemController = require('../../controllers/item');
var nock = require('nock');
nock.disableNetConnect();
//nock.recorder.rec();

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
        var body = 'hello world';
        var subpath = 'storeFile.txt';
        this.responseBodyMock = {
          'size': '0.011KB',
          'rev': '35e97029684fe',
          'thumb_exists': false,
          'bytes': 11,
          'modified': 'Tue, 19 Jul 2011 21:55:38 +0000',
          'path': '/' + subpath,
          'is_dir': false,
          'icon': 'page_white',
          'root': 'app_folder',
          'mime_type': 'text/plain'
        };
        var path = this.storage.storeFilePath(this.userStorageAuth, subpath);

        nock('https://' + this.storage.host).put(path, body).reply(200, this.responseBodyMock);

        var self = this;
        ItemController.storeFile(this.user, this.storage, subpath, body, function(error, responseBody) {
          self.responseBody = responseBody;
          done(error);
        });
      });

      it('is stored with matching response body', function() {
        assert.equal(JSON.stringify(this.responseBody), JSON.stringify(this.responseBodyMock));
      });
    });

    it('with path');
    it('with binary body');
  });
});