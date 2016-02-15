var base = require('../base');
var assert = require('assert');
var factory = require('../factory');
var ItemController = require('../../controllers/item');

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
      factory.savedUserStorageAuth(this.user, this.storage, done);
    });

    describe('with txt data', function(done) {
      before(function(done) {
        var path = 'storeFile.txt';
        var data = 'hello world';
        var encoding = 'utf8';
        var callback = function() {
          done();
        };

        ItemController.storeFile(this.user, this.storage, path, data, encoding, callback);
      });

      it('is stored');
    });

    it('with path');
    it('with binary data');
  });
});