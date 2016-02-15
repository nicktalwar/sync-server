var User = require('../../models/user');
var UserStorageAuth = require('../../models/userStorageAuth');

module.exports = {
  // Attributes

  storageAttributes: {
    id: "dropbox"
  },

  userAttributes: {
    name: 'Jordan Mills',
    email: 'jordan.mills@example.com'
  },

  userStorageAuthAttributes: {
    storageToken: "userStorageAuthAttributesStorageToken",
    storageUserId: "userStorageAuthAttributesUserId"
  },

  // Objects

  storage: function() {
    return require('../../objects/storages/' + this.storageAttributes.id);
  },

  user: function() {
    return new User(this.userAttributes);
  },

  userStorageAuth: function(user, storage) {
    var userStorageAuthAttributes = this.userStorageAuthAttributes;
    userStorageAuthAttributes.userId = user.id;
    userStorageAuthAttributes.storageId = storage.id;
    return new UserStorageAuth(userStorageAuthAttributes);
  },

  // Saved objects

  savedUser: function(done) {
    var user = this.user();
    user.save(function(error) {
      done(error, user);
    });
  },

  savedUserStorageAuth: function(user, storage, done) {
    var userStorageAuth = this.userStorageAuth(user, storage);
    userStorageAuth.save(function(error) {
      done(error, userStorageAuth);
    });
  }
}