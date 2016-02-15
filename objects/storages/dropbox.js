module.exports = {
  id: 'dropbox',
  host: 'api-content.dropbox.com',

  path: function(userStorageAuth, path) {
    return '/1/files_put/sandbox/' + path + '?access_token=' + userStorageAuth.storageToken;
  }
};