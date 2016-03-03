var async = require('async');
var ContentType = require('../../models/contentType');
var Item = require('../../models/item');
var Source = require('../../models/source');
var Storage = require('../../models/storage');
var User = require('../../models/user');
var UserSourceAuth = require('../../models/userSourceAuth');
var UserStorageAuth = require('../../models/userStorageAuth');

module.exports = {
  // Attributes

  contentTypeAttributes: {
    id: 'widget'
  },

  sourceAttributes: {
    id: 'megaplex',
    name: 'Megaplex',
    enabled: true,
    logoGlyphPath: '/images/logos/megaplex.svg',
    contentTypes: [
      new ContentType({ id: 'widget' }),
      new ContentType({ id: 'gadget' })
    ],
    host: 'megaplex.example.com',
    apiVersion: 5,
    defaultItemsLimit: 98,
    clientId: 'megaplexClientId',
    clientSecret: 'megaplexClientSecret',
    itemAssetLinks: []
  },

  storageAttributes: {
    id: "dropbox"
  },

  userAttributes: {
    name: 'Jordan Mills',
    email: 'jordan.mills@example.com'
  },

  userSourceAuthAttributes: {
    sourceToken: 'userSourceAuthSourceToken',
    sourceUserId: 'userSourceAuthSourceUserId'
  },

  userStorageAuthAttributes: {
    storageToken: 'userStorageAuthStorageToken',
    storageUserId: 'userStorageAuthStorageUserId'
  },

  textFileAttributes: {
    body: 'hello world',
    subpath: 'storeFile.txt',
    responseBody: { /* note: omits path, which depends on item ID */
      'size': '0.011KB',
      'rev': '35e97029684fe',
      'thumb_exists': false,
      'bytes': 11,
      'modified': 'Tue, 19 Jul 2011 21:55:38 +0000',
      'is_dir': false,
      'icon': 'page_white',
      'root': 'app_folder',
      'mime_type': 'text/plain'
    }
  },

  itemAttributes: {
    syncAttemptedAt: new Date(2015, 1, 1, 1, 1, 1, 1),
    syncVerifiedAt: new Date(2015, 1, 1, 1, 2, 1, 1),
    syncFailedAt: new Date(2015, 1, 1, 1, 3, 1, 1),
    bytes: 12345,
    description: 'Item description',
    error: 'Item error',
    data: 'hello world',
    mimeType: 'text/plain'
  },

  // Objects

  contentType: function() {
    return new ContentType(this.contentTypeAttributes);
  },

  item: function(done) {
    var self = this;
    async.waterfall([
      // Get user
      function(done) {
        self.user(done);
      },
      // Create item
      function(user, done) {
        var itemAttributes = self.itemAttributes;
        itemAttributes.userId = user.id;
        itemAttributes.storageId = self.storage().id;
        itemAttributes.sourceId = self.source().id;
        itemAttributes.contentTypeId = self.contentType().id;
        Item.create(itemAttributes, done);
      }
    ], function(error, item) {
      done(error, item);
    });
  },

  source: function() {
    return new Source(this.sourceAttributes);
  },

  storage: function() {
    return new Storage(this.storageAttributes);
  },

  user: function(done) {
    User.create(this.userAttributes, function(error, user) {
      done(error, user);
    });
  },

  userSourceAuth: function(done) {
    var self = this;
    async.waterfall([
      // Get user
      function(done) {
        self.user(done);
      },
      // Create userSourceAuth
      function(user, done) {
        var userSourceAuthAttributes = self.userSourceAuthAttributes;
        userSourceAuthAttributes.userId = user.id;
        userSourceAuthAttributes.sourceId = self.source.id;
        UserSourceAuth.create(userSourceAuthAttributes, done);
      },
    ], function(error, userSourceAuth) {
      done(error, userSourceAuth);
    });
  },

  userStorageAuth: function(userId, storageId, done) {
    // Support done as prioritized parameter over optional others
    if (arguments.length === 2) {
      done = storageId;
      storageId = null;
    } else if (arguments.length === 1) {
      done = userId;
      userId = null;
    }

    var self = this;
    async.waterfall([
      // Get user
      function(done) {
        if (!userId) {
          self.user(done);
        } else {
          User.findById(userId, done);
        }
      },
      // Create userStorageAuth
      function(user, done) {
        if (!user) {
          return done(new Error('user not found with id'));
        }

        if (!storageId) {
          storageId = self.storage().id;
        }

        var userStorageAuthAttributes = self.userStorageAuthAttributes;
        userStorageAuthAttributes.userId = user.id;
        userStorageAuthAttributes.storageId = storageId;
        UserStorageAuth.create(userStorageAuthAttributes, done);
      },
    ], function(error, userStorageAuth) {
      done(error, userStorageAuth);
    });
  }
}