var base = require('../base');
var assert = require('assert');
var factory = require('../factory');
var Storage = require('../../models/storage.js');

describe('referenced storage', function() {
  before(function() {
    this.storage = new Storage({ id: 'dropbox' });
  });

  it('has id', function() {
    assert.equal(this.storage.id, 'dropbox');
  });

  it('has host', function() {
    assert.equal(this.storage.host, 'content.dropboxapi.com');
  });

  it('has requestErrorMessage', function() {
    assert.equal(this.storage.requestErrorMessage(409), "The call failed because a conflict occurred. This means a file already existed at the specified path, overwrite was false, and the parent_rev (if specified) didn't match the current rev.");
  });

  describe('storeFilePath retrieval', function() {
    before(function(done) {
      var self = this;
      factory.userStorageAuth(function(error, userStorageAuth) {
        self.userStorageAuth = userStorageAuth;
        done(error);
      });
    });

    it('with proper userStorageAuth and path succeeds', function() {
      assert.equal(this.storage.storeFilePath(this.userStorageAuth, 'foo.bar'), '/1/files_put/sandbox/foo.bar?overwrite=false&access_token=userStorageAuthStorageToken');
    });

    describe('without userStorageAuth', function() {
      before(function() {
        try {
          this.storage.storeFilePath(null, 'foo.bar');
        } catch(error) {
          this.error = error;
        }
      });

      it('throws error', function() {
        assert.equal(this.error.message, 'userStorageAuth needed to generate dropbox storage storeFilePath');
      });
    });

    describe('without userStorageAuth.storageToken', function() {
      before(function() {
        try {
          var userStorageAuth = this.userStorageAuth;
          userStorageAuth.storageToken = null;
          this.storage.storeFilePath(userStorageAuth, 'foo.bar');
        } catch(error) {
          this.error = error;
        }
      });

      it('throws error', function() {
        assert.equal(this.error.message, 'userStorageAuth.storageToken needed to generate dropbox storage storeFilePath');
      });
    });

    describe('without subpath', function() {
      before(function() {
        try {
          this.storage.storeFilePath(this.userStorageAuth);
        } catch(error) {
          this.error = error;
        }
      });

      it('throws error', function() {
        assert.equal(this.error.message, 'subpath needed to generate dropbox storage storeFilePath');
      });
    });
  });

  describe('without attributes', function() {
    before(function() {
      try {
        this.storage = new Storage();
      } catch(error) {
        this.error = error;
      }
    });

    it('throws error', function() {
      assert.equal(this.error.message, 'attributes parameter not provided');
    });
  });

  describe('without non-object attributes', function() {
    before(function() {
      try {
        this.storage = new Storage('dropbox');
      } catch(error) {
        this.error = error;
      }
    });

    it('throws error', function() {
      assert.equal(this.error.message, 'attributes parameter not object');
    });
  });

  describe('without attributes.id', function() {
    before(function() {
      try {
        this.storage = new Storage({ foo: 'bar' });
      } catch(error) {
        this.error = error;
      }
    });

    it('throws error', function() {
      assert.equal(this.error.message, 'attributes.id not provided');
    });
  });

  describe('without supported attributes.id', function() {
    before(function() {
      try {
        this.storage = new Storage({ id: 'foobar' });
      } catch(error) {
        this.error = error;
      }
    });

    it('throws error', function() {
      assert.equal(this.error.message, 'invalid storage ID provided');
    });
  });
});